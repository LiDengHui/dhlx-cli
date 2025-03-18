import fs from 'fs';
import path from 'path';

export interface BaseOptions {
    input: string;
    output: string;
}
export const defaultImage = ['.jpg', '.jpeg', '.png', '.webp'];
export async function validFiles<T extends BaseOptions>(
    exts = defaultImage,
    options: T,
    eachHandle: (file: string, outputFile: string, ext: string) => Promise<void>,
    beforeValid?: (options: T) => void,
): Promise<void> {
    const { input, output } = options;

    if (!input) {
        console.error('Input path is required.');
        process.exit(1);
    }

    beforeValid && beforeValid(options);

    // Resolve the absolute paths for input and output
    const absoluteInput = path.resolve(input);
    const absoluteOutput = path.resolve(output);

    // Recursively collect all files from the input directory and its subdirectories
    const getFiles = (dir: string): string[] => {
        const files: string[] = [];
        const items = fs.readdirSync(dir);

        items.forEach((item) => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...getFiles(fullPath)); // Recurse into subdirectory
            } else {
                files.push(fullPath);
            }
        });

        return files;
    };

    const files = getFiles(absoluteInput);

    // Create the output directory if it doesn't exist
    fs.mkdirSync(absoluteOutput, { recursive: true });

    for (const file of files) {
        // Resolve the full absolute path of the file
        const absoluteFile = path.resolve(file);
        // Skip if the file is in the output directory or its subdirectories
        if (absoluteFile.startsWith(absoluteOutput)) {
            console.log(`Skipping file in output directory: ${file}`);
            continue;
        }

        const ext = path.extname(file);
        if (!exts.includes(ext.toLowerCase())) {
            console.log(`Skipping unsupported file: ${file}`);
            continue;
        }

        // Compute the relative path of the file from the input directory
        const relativePath = path.relative(absoluteInput, absoluteFile);
        // Construct the corresponding output path by joining it with the output directory
        const outputDir = path.join(absoluteOutput, path.dirname(relativePath));
        // Ensure only the directory structure is created, not the file itself

        fs.mkdirSync(outputDir, { recursive: true });

        // Call the provided handler function for the file
        await eachHandle(file, outputDir, ext);
    }
}

import fs from 'fs';
import path from 'path';
import log from '../../utils/log';

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

    const absoluteInput = path.resolve(input);
    const absoluteOutput = path.resolve(output);

    const getFiles = (dir: string): string[] => {
        const files: string[] = [];
        const items = fs.readdirSync(dir);

        items.forEach((item) => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...getFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        });

        return files;
    };

    const files = getFiles(absoluteInput);

    fs.mkdirSync(absoluteOutput, { recursive: true });

    for (const file of files) {
        const absoluteFile = path.resolve(file);
        if (absoluteFile.startsWith(absoluteOutput)) {
            console.log(`Skipping file in output directory: ${file}`);
            continue;
        }

        const ext = path.extname(file);
        if (!exts.includes(ext.toLowerCase())) {
            console.log(`Skipping unsupported file: ${file}`);
            continue;
        }

        const relativePath = path.relative(absoluteInput, absoluteFile);
        const outputDir = path.join(absoluteOutput, path.dirname(relativePath));

        fs.mkdirSync(outputDir, { recursive: true });

        try {
            await eachHandle(file, outputDir, ext);
        } catch (e) {
            log.error(e);
        }
    }
}

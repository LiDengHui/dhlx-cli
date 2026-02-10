import fs from 'fs';
import path from 'path';
import readline from 'node:readline';

interface CodeLineOptions {
    input: string;
    extensions: string[];
    excludes: string[];
    emptyLine: boolean;
    commentLine: boolean;
    detail: boolean;
}

const defaultOptions = {
    input: '.',
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.html', '.css', '.scss', '.mjs'],
    excludes: ['node_modules', '.git', 'dist', 'build'],
    emptyLine: true,
    commentLine: true,
    detail: false,
};
export const codeLine = async (options: CodeLineOptions = defaultOptions as CodeLineOptions) => {
    options.input = options.input ?? (defaultOptions.input as string);
    options.extensions = options.extensions ?? defaultOptions.extensions;
    options.excludes = options.excludes ?? (defaultOptions.excludes as string[]);
    options.emptyLine = options.emptyLine ?? (defaultOptions.emptyLine as boolean);
    options.commentLine = options.commentLine ?? (defaultOptions.commentLine as boolean);

    try {
        const results = await traverseDirectory(options.input, options as any);
        printResults(results);
    } catch (error) {
        console.error('Error:', error);
    }
};

interface ByExtensionInfo {
    files: number;
    lines: number;
}

interface Result {
    totalFiles: number;
    totalLines: number;
    byExtension: Record<string, ByExtensionInfo>;
}

async function traverseDirectory(dirPath: string, config: any) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const results: Result = {
        totalFiles: 0,
        totalLines: 0,
        byExtension: {} as Record<string, ByExtensionInfo>,
    };

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (config.excludes.some((e: string) => fullPath.includes(e))) continue;
            const sub = await traverseDirectory(fullPath, config);
            mergeResults(results, sub);
        } else {
            const ext = path.extname(entry.name);
            if (!config.extensions.includes(ext)) continue;
            results.totalFiles += 1;
            const lines = await countFileLines(fullPath, {
                emptyLine: config.emptyLine,
                commentLine: config.commentLine,
            });
            results.totalLines += lines;
            if (!results.byExtension[ext]) results.byExtension[ext] = { files: 0, lines: 0 };
            results.byExtension[ext].files += 1;
            results.byExtension[ext].lines += lines;
        }
    }

    return results;
}

async function countFileLines(filePath: string, config: { emptyLine: boolean; commentLine: boolean }) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let lineCount = 0;
    for await (const line of rl) {
        const trimmed = line.trim();
        if (!config.emptyLine && trimmed === '') continue;
        if (!config.commentLine && trimmed.startsWith('//')) continue;
        lineCount++;
    }

    return lineCount;
}

function mergeResults(main: Result, sub: Result) {
    main.totalFiles += sub.totalFiles;
    main.totalLines += sub.totalLines;

    for (const [ext, data] of Object.entries(sub.byExtension)) {
        if (!main.byExtension[ext]) main.byExtension[ext] = { files: 0, lines: 0 };
        main.byExtension[ext].files += data.files;
        main.byExtension[ext].lines += data.lines;
    }
}

function printResults(results: Result) {
    console.log('📊 Code Line Counter Results');
    console.log('='.repeat(50));
    console.log(`📂 Total Files: ${results.totalFiles}`);
    console.log(`📝 Total Lines: ${results.totalLines}`);
    console.log('─'.repeat(50));

    console.log('📋 By File Type:');
    for (const [ext, data] of Object.entries(results.byExtension)) {
        console.log(`${ext}: files=${data.files}, lines=${data.lines}`);
    }

    console.log('='.repeat(50));
}

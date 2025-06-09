import * as fs from "node:fs";
import * as path from "node:path"
import readline from "node:readline";
import log from "./utils/log.js";

interface CodeLineOptions {
    // 指定扫描目录
    input: string;
    // 只统计JS文件
    extensions: string[];
    // 添加排除目录
    excludes: string[];
    // 包含空行
    emptyLine: boolean;
    // 排除注释行
    commentLine: boolean;

    // 显示详细信息
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
export const codeLine = async (options: CodeLineOptions = defaultOptions) => {
    options.input = options.input ?? defaultOptions.input as string;
    options.extensions = options.extensions ?? defaultOptions.extensions;
    options.excludes = options.excludes?? defaultOptions.excludes as string[];
    options.emptyLine = options.emptyLine?? defaultOptions.emptyLine as boolean;
    options.commentLine = options.commentLine ?? defaultOptions.commentLine as boolean;

    try {
        const results = await traverseDirectory(options.input, options);
        printResults(results);
    } catch (error) {
        console.error('Error:', error);
    }
};

interface ByExtensionInfo {
    files: number,
    lines: number,
}

interface Result {
    totalFiles: number;
    totalLines: number;
    byExtension: Record<string, ByExtensionInfo>
}
// 递归遍历目录
async function traverseDirectory(dirPath: string, config: Omit<CodeLineOptions, "input">) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const results: Result = {
        totalFiles: 0,
        totalLines: 0,
        byExtension: {} as Record<string, ByExtensionInfo>
    };

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // 跳过排除目录
        if (entry.isDirectory()) {
            if (config.excludes.includes(entry.name)) continue;
            const subResults = await traverseDirectory(fullPath, config);
            mergeResults(results, subResults);
            continue;
        }

        // 检查文件扩展名
        const ext = path.extname(entry.name).toLowerCase();
        if (!config.extensions.includes(ext)) continue;

        if(config.detail) {
            log.info(fullPath)
        }
        // 统计文件行数
        const lines = await countFileLines(fullPath, config);
        results.totalFiles++;
        results.totalLines += lines;

        // 按扩展名统计
        if (!results.byExtension[ext]) {
            results.byExtension[ext] = { files: 0, lines: 0 };
        }
        results.byExtension[ext].files++;
        results.byExtension[ext].lines += lines;
    }

    return results;
}

// 统计单个文件行数
async function countFileLines(filePath: string, config: Pick<CodeLineOptions, 'emptyLine'| 'commentLine'>) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
        const trimmedLine = line.trim();

        // 空行处理
        if (!config.emptyLine && trimmedLine === '') continue;

        // 注释行处理 (简单判断)
        if (!config.commentLine && (
            trimmedLine.startsWith('//') ||
            trimmedLine.startsWith('/*') ||
            trimmedLine.startsWith('*') ||
            trimmedLine.startsWith('<!--')
        )) continue;

        lineCount++;
    }

    return lineCount;
}

// 合并子目录结果
function mergeResults(main: Result, sub: Result) {
    main.totalFiles += sub.totalFiles;
    main.totalLines += sub.totalLines;

    for (const [ext, data] of Object.entries(sub.byExtension)) {
        if (!main.byExtension[ext]) {
            main.byExtension[ext] = { files: 0, lines: 0 };
        }
        main.byExtension[ext].files += data.files;
        main.byExtension[ext].lines += data.lines;
    }
}

// 打印结果
function printResults(results: Result) {
    console.log('📊 Code Line Counter Results');
    console.log('='.repeat(50));
    console.log(`📂 Total Files: ${results.totalFiles}`);
    console.log(`📝 Total Lines: ${results.totalLines}`);
    console.log('─'.repeat(50));

    // 按扩展名打印
    console.log('📋 By File Type:');
    for (const [ext, data] of Object.entries(results.byExtension)) {
        console.log(`  ${ext.padEnd(8)}: ${data.files.toString().padStart(4)} files | ${data.lines.toString().padStart(6)} lines`);
    }

    console.log('='.repeat(50));
}

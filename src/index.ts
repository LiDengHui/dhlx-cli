import createProject from './create.js';
import { compressImages } from './compress.js';
import { transformed, version } from './version.js';
import { program } from 'commander';
import { convertImages } from './convert.js';
import { copyConfigFile, getInitKeys } from './init.js';
import { deployAction } from './uploadService.js';
import fs from 'fs';
import path from 'path';
import processExcel from './processExcel.js';
import { imageSize } from './imageSize.js';
import { wordToHtml } from './wordToHtml.js';
import { excel2json } from './excel2json.js';
import { json2excel } from './json2excel.js';

console.info(transformed);

program.version(version);

program
    .command('create [template] [project]')
    .description('创建项目')
    .action(async (template, project) => {
        await createProject({
            template,
            project,
        });
    });
program
    .command('process')
    .description('处理 Excel 文件')
    .option('-c, --config <path>', '指定配置文件路径 {process.js}', 'process.js')
    .option('-i, --file <path>', '输入文件 {input.excel}')
    .option('-o, --out <path>', '输出文件 {output.excel}')
    .option('-b, --baseValue <string>', '对比源, {2025/6/1}')
    .option('-t, --compareValue <string>', '对比项 {2025/5/1}')
    .option('-s, --sheet <string></string>', 'sheetName 默认第一个')
    .action(async (options) => {
        const configPath = path.resolve(process.cwd(), options.config);
        const configModule = await import(configPath);
        const config = configModule.default;
        await processExcel({ ...config, ...options });
    });

program
    .command('compress')
    .description('Compress images')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .option('-q, --quality <number>', 'Image quality (default: 80)', '80')
    .action(async (options) => {
        await compressImages({
            input: options.input,
            output: options.output,
            quality: parseInt(options.quality, 10),
        });
    });

program
    .command('image-size')
    .description('Change images size')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .option('-w, --width <number>', 'Image width')
    .option('-h, --height <number>', 'Image Height')
    .option('-f, --fit <string>', 'fit contain｜cover｜fill｜inside｜outside')
    .option('-p, --position <string>', 'position, top center bottom left right', 'center')
    .action(async (options) => {
        await imageSize({
            input: options.input,
            output: options.output,
            width: parseInt(options.width),
            height: parseInt(options.height),
            fit: options.fit,
            position: options.position,
        });
    });

program
    .command('word-to-html')
    .description('Change word to html')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .action(async (options) => {
        await wordToHtml({
            input: options.input,
            output: options.output,
        });
    });

// 转换子命令
program
    .command('convert')
    .description('Convert image formats')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .option('-f, --format <string>', 'Target image format (jpg, png, webp)', 'jpg')
    .action(async (options) => {
        await convertImages({
            input: options.input,
            output: options.output,
            format: options.format,
        });
    });

program
    .command('init <type>')
    .description(
        `Copy a specific configuration file [${getInitKeys()}] from the project to the current working directory`,
    )
    .action(copyConfigFile);

program
    .command('deploy')
    .description('Compress specified directories and upload to server')
    .option('-c, --config <file>', 'Path to config file', './deployConfig.json')
    .option('-m, --mode <mode>', 'Select deployment mode from config')
    .option('-s, --source <dir>', 'Comma-separated list of directories to include')
    .option('-z, --zip <filename>', 'Zip file name', 'archive.zip')
    .option('-h, --host <host>', 'SSH host')
    .option('-u, --user <user>', 'SSH username')
    .option('-p, --password <password>', 'SSH password')
    .option('-r, --remote <path>', 'Remote directory path', '/var/www/uploads')
    .option('-e, --extract <path>', 'Remote extract directory', '/var/www/static')
    .action(async (options) => {
        // Construct the config path relative to the current working directory
        const configPath = path.resolve(process.cwd(), options.config);
        let config = {};

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            console.log(config);
        }

        let finalOptions = options;

        if (options.mode && Array.isArray(config)) {
            const modeConfig = config.find((c) => c.mode === options.mode);
            if (modeConfig) {
                finalOptions = { ...options, ...modeConfig };
            } else {
                console.error(`Error: Mode '${options.mode}' not found in config.`);
                process.exit(1);
            }
        } else if (typeof config === 'object' && !Array.isArray(config)) {
            finalOptions = { ...options, ...config };
        }

        await deployAction(finalOptions);
    });

program
    .command('excel2json')
    .description('将 Excel 文件转换为 JSON 格式')
    .option('-c, --config <path>', '配置文件路径 {excel2json.js}')
    .option('-i, --input <path>', '输入 Excel 文件路径 {input.xlsx}')
    .option('-o, --output <path>', '输出 JSON 文件路径，未提供时打印到控制台')
    .option('-s, --sheet <name>', '指定 sheet 名称，默认第一个')
    .action(async (options) => {
        let config = {};
        if (options.config) {
            const configPath = path.resolve(process.cwd(), options.config);
            const configModule = await import(configPath);
            config = configModule.default;
        }
        await excel2json({ ...config, ...options });
    });

program
    .command('json2excel')
    .description('将  JSON 文件转换为 Excel 格式')
    .option('-c, --config <path>', '配置文件路径 {excel2json.js}')
    .option('-i, --input <path>', '输入 Excel 文件路径 {input.xlsx}')
    .option('-o, --output <path>', '输出 JSON 文件路径，未提供时打印到控制台')
    .option('-s, --sheet <name>', '指定 sheet 名称，默认第一个')
    .option('-d, --data <object| string>', '数据')
    .action(async (options) => {
        let config = {};
        if (options.config) {
            const configPath = path.resolve(process.cwd(), options.config);
            const configModule = await import(configPath);
            config = configModule.default;
        }
        await json2excel({ ...config, ...options });
    });

program.parse(process.argv);

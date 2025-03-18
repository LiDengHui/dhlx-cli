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
    .option('-i, --file <path>', '输入文件 {input.excel}', 'input.excel')
    .option('-o, --out <path>', '输出文件 {output.excel}', 'output.excel')
    .option('-b, --baseValue <string>', '对比源, {2025/6/1}', '2025/6/1')
    .option('-t, --compareValue <string>', '对比项 {2025/5/1}', '2025/5/1')
    .action(async (options) => {
        // Construct the config path relative to the current working directory
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
    .option('-w, --width <number>', 'Image width', '500')
    .option('-h, --height <number>', 'Image Height', '500')
    .action(async (options) => {
        await imageSize({
            input: options.input,
            output: options.output,
            width: parseInt(options.width),
            height: parseInt(options.height),
        });
    });

// 转换子命令
program
    .command('convert')
    .description('Convert image formats')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .option('-f, --format <format>', 'Target image format (jpg, png, webp)', 'jpg')
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

program.parse(process.argv);

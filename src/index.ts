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
import { ghPages } from './gh-pages.js';
import { BaseOptions } from './baseImage.js';
import { codeLine } from './codeLine.js';
import log from './utils/log.js';
import { codeMap } from './code-map.js';
import { pdfToHtml } from './pdfToHtml.js';
import { loginAction, checkLoginStatus } from './login.js';
import { publishAction, validateMicroConfig } from './micro.js';
import { setConfig, getConfig, getAllConfig, deleteConfig, clearConfig, showConfig } from './config.js';

console.info(transformed);

program.version(version);

program
    .command('create [project]')
    .description('创建项目')
    .option('-t, --template <path>', '模版名称')
    .option('-d, --detail <path>', '详细详细')
    .action(async (project, options) => {
        await createProject({
            project,
            template: options.template,
            description: options.detail,
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
program
    .command('pdf2html')
    .description('Change pdf to html')
    .option('-i, --input <path>', 'Input file or folder path')
    .option('-o, --output <path>', 'Output folder path', './output')
    .action(async (options) => {
        await pdfToHtml({
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

async function createConfigOptions(options: any) {
    let config = {};
    if (options.config) {
        const configPath = path.resolve(process.cwd(), options.config);
        const configModule = await import(configPath);
        config = configModule.default;
    }
    return {
        ...config,
        ...options,
    } as BaseOptions;
}

program
    .command('excel2json')
    .description('将 Excel 文件转换为 JSON 格式')
    .option('-c, --config <path>', '配置文件路径 {excel2json.js}')
    .option('-i, --input <path>', '输入 Excel 文件路径 {input.xlsx}')
    .option('-o, --output <path>', '输出 JSON 文件路径，未提供时打印到控制台')
    .option('-s, --sheet <name>', '指定 sheet 名称，默认第一个')
    .action(async (options) => {
        const config = await createConfigOptions(options);
        excel2json(config);
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
        const config = await createConfigOptions(options);
        json2excel(config);
    });

program
    .command('gh-pages')
    .description('部署git hub page 页面')
    .option('-i, --input <path>', '输入创建pg-pages branch 目录')
    .action(async (options) => {
        const input = options.input;
        await ghPages({ input });
    });

program
    .command('code-line')
    .description('统计代码行数')
    .option('-i, --input <path>', '指定扫描目录', './') // 默认当前目录
    .option('-e, --excludes <excludes>', '排除的目录（逗号分隔）', ['node_modules', '.git', 'dist', 'build'])
    .option('-t, --extensions <extensions>', '包含的文件扩展名（逗号分隔）', [
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.vue',
        '.html',
        '.css',
        '.scss',
        '.mjs',
    ])
    .option('-d, --detail', '显示详细信息')
    .option('--no-empty-line', '排除空行统计')
    .option('--no-comment-line', '排除注释行统计')
    .action(async (options) => {
        if (options.detail) {
            log.info(JSON.stringify(options, null, 4));
        }

        await codeLine(options);
    });

program
    .command('code-map')
    .description('生成代码依赖图')
    .option('-i, --input <path>', '输入文件')
    .option('-t, --type <path>', '输出目录', 'g6')
    .option('-d, --deep <number>', '深度', '2')
    .action(async (options) => {
        codeMap(options);
    });

program
    .command('config')
    .description('配置管理')
    .option('set <key> <value>', '设置配置项')
    .option('get <key>', '获取配置项')
    .option('list', '显示所有配置')
    .option('delete <key>', '删除配置项')
    .option('clear', '清空所有配置')
    .action(async (options) => {
        const args = process.argv.slice(3); // 获取 config 命令后的参数

        if (args.length === 0) {
            // 显示所有配置
            showConfig();
            return;
        }

        const subCommand = args[0];

        switch (subCommand) {
            case 'set':
                if (args.length < 3) {
                    log.error('用法: dhlx config set <key> <value>');
                    process.exit(1);
                }
                setConfig(args[1], args[2]);
                log.success(`配置已设置: ${args[1]} = ${args[2]}`);
                break;

            case 'get':
                if (args.length < 2) {
                    log.error('用法: dhlx config get <key>');
                    process.exit(1);
                }
                const value = getConfig(args[1]);
                if (value !== undefined) {
                    console.log(value);
                } else {
                    log.error(`配置项 "${args[1]}" 不存在`);
                    process.exit(1);
                }
                break;

            case 'list':
                showConfig();
                break;

            case 'delete':
                if (args.length < 2) {
                    log.error('用法: dhlx config delete <key>');
                    process.exit(1);
                }
                deleteConfig(args[1]);
                log.success(`配置已删除: ${args[1]}`);
                break;

            case 'clear':
                clearConfig();
                log.success('所有配置已清空');
                break;

            default:
                log.error(`未知的子命令: ${subCommand}`);
                log.info('可用命令: set, get, list, delete, clear');
                process.exit(1);
        }
    });

program
    .command('login')
    .description('登录 nest-serve 后台')
    .option('-u, --username <username>', '用户名')
    .option('-p, --password <password>', '密码')
    .option('-s, --server <server>', '服务器地址')
    .action(async (options) => {
        await loginAction(options);
    });

program
    .command('logout')
    .description('退出登录')
    .action(async () => {
        const { deleteCredentials } = await import('./utils/auth.js');
        deleteCredentials();
        log.success('已成功退出登录');
    });

program
    .command('status')
    .description('查看登录状态')
    .action(async () => {
        await checkLoginStatus();
    });

const microCommand = program.command('micro').description('微应用管理');

microCommand
    .command('publish')
    .description('发布微应用')
    .option('-d, --dist <path>', 'dist 目录路径', './dist')
    .option('-s, --server <server>', '服务器地址')
    .option('-z, --zip-name <name>', 'ZIP 文件名')
    .action(async (options: any) => {
        await publishAction(options);
    });

microCommand
    .command('validate')
    .description('验证微应用配置')
    .option('-d, --dist <path>', 'dist 目录路径', './dist')
    .action((options: any) => {
        validateMicroConfig(options.dist);
    });

program.parse(process.argv);

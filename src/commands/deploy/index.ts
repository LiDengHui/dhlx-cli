import { Command } from 'commander';
import { publishAction, validateMicroConfig, deployAction, DeployOptions } from '../../handlers/deploy/index';
import { loadJsonConfigIfExists } from '../shared/config';

interface DeployCommandOptions extends Partial<DeployOptions> {
    config: string;
    mode?: string;
    [key: string]: unknown;
}

type DeployConfigFile = Partial<DeployCommandOptions> | Array<Partial<DeployCommandOptions> & { mode?: string }>;

function resolveDeployOptions(options: DeployCommandOptions): DeployCommandOptions {
    const config = loadJsonConfigIfExists<DeployConfigFile>(options.config);
    if (!config) {
        return options;
    }

    if (options.mode && Array.isArray(config)) {
        const modeConfig = config.find((item) => item.mode === options.mode);
        if (!modeConfig) {
            throw new Error(`Mode '${options.mode}' not found in config.`);
        }
        return { ...options, ...modeConfig };
    }

    if (!Array.isArray(config)) {
        return { ...options, ...config };
    }

    return options;
}

function ensureDeployOptions(options: DeployCommandOptions): DeployOptions {
    const requiredKeys: Array<keyof DeployOptions> = ['source', 'zip', 'host', 'user', 'remote', 'extract'];

    for (const key of requiredKeys) {
        if (!(options as any)[key]) {
            throw new Error(`Missing required deploy option: ${String(key)}`);
        }
    }

    return options as DeployOptions;
}

export function registerDeployCommands(program: Command): void {
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
        .action(async (options: DeployCommandOptions) => {
            const finalOptions = ensureDeployOptions(resolveDeployOptions(options));
            await deployAction(finalOptions);
        });

    const microCommand = program.command('micro').description('微应用管理');

    microCommand
        .command('publish')
        .description('发布微应用')
        .option('-d, --dist <path>', 'dist 目录路径', './dist')
        .option('-s, --server <server>', '服务器地址')
        .option('-z, --zip-name <name>', 'ZIP 文件名')
        .action(async (options) => {
            await publishAction(options);
        });

    microCommand
        .command('validate')
        .description('验证微应用配置')
        .option('-d, --dist <path>', 'dist 目录路径', './dist')
        .action((options) => {
            validateMicroConfig(options.dist);
        });
}

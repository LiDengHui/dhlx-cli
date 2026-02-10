import { Command } from 'commander';
import { codeLine, codeMap, ghPages } from '../../handlers/util/index.js';
import log from '../../utils/log.js';

export function registerUtilCommands(program: Command): void {
    // Code line command
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

    // Code map command
    program
        .command('code-map')
        .description('生成代码依赖图')
        .option('-i, --input <path>', '输入文件')
        .option('-t, --type <path>', '输出目录', 'g6')
        .option('-d, --deep <number>', '深度', '2')
        .action(async (options) => {
            codeMap(options);
        });

    // GitHub Pages command
    program
        .command('gh-pages')
        .description('部署git hub page 页面')
        .option('-i, --input <path>', '输入创建pg-pages branch 目录')
        .action(async (options) => {
            const input = options.input;
            await ghPages({ input });
        });
}

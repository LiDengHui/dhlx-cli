import { Command } from 'commander';
import { createProject, copyConfigFile, getInitKeys } from '../../handlers/project/index';

export function registerProjectCommands(program: Command): void {
    // Create command
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

    // Init command
    program
        .command('init <type>')
        .description(
            `Copy a specific configuration file [${getInitKeys()}] from the project to the current working directory`,
        )
        .action(copyConfigFile);
}

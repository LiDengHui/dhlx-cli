import { Command } from 'commander';
import { clearConfig, deleteConfig, getConfig, setConfig, showConfig } from '../../config';
import log from '../../utils/log';

export function registerConfigCommands(program: Command): void {
    const configCommand = program.command('config').description('配置管理');

    configCommand
        .command('set <key> <value>')
        .description('设置配置项')
        .action((key: string, value: string) => {
            setConfig(key, value);
            log.success(`配置已设置: ${key} = ${value}`);
        });

    configCommand
        .command('get <key>')
        .description('获取配置项')
        .action((key: string) => {
            const value = getConfig(key);
            if (value === undefined) {
                throw new Error(`配置项 "${key}" 不存在`);
            }
            console.log(value);
        });

    configCommand
        .command('list')
        .description('显示所有配置')
        .action(() => {
            showConfig();
        });

    configCommand
        .command('delete <key>')
        .description('删除配置项')
        .action((key: string) => {
            deleteConfig(key);
            log.success(`配置已删除: ${key}`);
        });

    configCommand
        .command('clear')
        .description('清空所有配置')
        .action(() => {
            clearConfig();
            log.success('所有配置已清空');
        });

    configCommand.action(() => {
        showConfig();
    });
}

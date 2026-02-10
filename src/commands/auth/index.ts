import { Command } from 'commander';
import { loginAction, checkLoginStatus, deleteCredentials } from '../../handlers/auth/index.js';
import log from '../../utils/log.js';

export function registerAuthCommands(program: Command): void {
    // Login command
    program
        .command('login')
        .description('登录 nest-serve 后台')
        .option('-u, --username <username>', '用户名')
        .option('-p, --password <password>', '密码')
        .option('-s, --server <server>', '服务器地址')
        .action(async (options) => {
            await loginAction(options);
        });

    // Logout command
    program
        .command('logout')
        .description('退出登录')
        .action(async () => {
            deleteCredentials();
            log.success('已成功退出登录');
        });

    // Status command
    program
        .command('status')
        .description('查看登录状态')
        .action(async () => {
            await checkLoginStatus();
        });
}

import readline from 'readline';
import { saveCredentials, deleteCredentials, LoginCredentials } from './utils/auth.js';
import log from './utils/log.js';

interface LoginOptions {
    username?: string;
    password?: string;
    server?: string;
}

/**
 * 创建命令行输入接口
 */
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

/**
 * 提示用户输入
 */
function prompt(question: string): Promise<string> {
    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * 隐藏密码输入
 */
function promptPassword(question: string): Promise<string> {
    const rl = createInterface();
    return new Promise((resolve) => {
        // 检查是否在交互式环境中
        if (!process.stdin.isTTY) {
            // 非交互式环境，使用简单的输入
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
            return;
        }

        // 交互式环境，使用隐藏输入
        process.stdout.write(question);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let password = '';

        process.stdin.on('data', (char: Buffer) => {
            const charStr = char.toString();

            switch (charStr) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    rl.close();
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += charStr;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

/**
 * 登录到 nest-serve 后台
 */
async function loginToServer(username: string, password: string, server: string): Promise<LoginCredentials> {
    try {
        const response = await fetch(`${server}/admin/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as any;
            throw new Error(errorData.message || `登录失败: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as any;

        if (!data.data || !data.data.token) {
            throw new Error('登录响应格式错误：缺少 token');
        }

        // 计算过期时间（假设 token 有效期为 24 小时）
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

        return {
            token: data.data.token,
            username: data.data.username || username,
            loginTime: Date.now(),
            expiresAt,
        };
    } catch (error) {
        throw new Error(`登录请求失败: ${error}`);
    }
}

/**
 * 登录操作
 */
export async function loginAction(options: LoginOptions): Promise<void> {
    try {
        log.info('开始登录 nest-serve 后台...\n');

        // 获取登录信息
        let username = options.username;
        let password = options.password;
        let server = options.server || 'http://localhost:3000';

        // 如果没有提供用户名，提示用户输入
        if (!username) {
            username = await prompt('请输入用户名: ');
            if (!username) {
                log.error('用户名不能为空');
                return;
            }
        }

        // 如果没有提供密码，提示用户输入
        if (!password) {
            password = await promptPassword('请输入密码: ');
            if (!password) {
                log.error('密码不能为空');
                return;
            }
        }

        log.info('正在登录...');

        // 尝试登录
        const credentials = await loginToServer(username, password, server);

        // 保存登录凭证
        saveCredentials(credentials);

        log.success(`登录成功！欢迎回来，${credentials.username}`);
        log.info(`登录时间: ${new Date(credentials.loginTime).toLocaleString()}`);
        log.info(`凭证保存位置: ~/.dhlxrc`);
    } catch (error) {
        log.error(`登录失败: ${error}`);

        // 删除可能存在的旧凭证
        deleteCredentials();

        log.error('请检查用户名、密码和服务器地址是否正确');
        process.exit(1);
    }
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus(): Promise<boolean> {
    const { loadCredentials, deleteCredentials } = await import('./utils/auth.js');
    const credentials = loadCredentials();

    if (!credentials) {
        log.error('您尚未登录，请先运行 `dhlx login` 命令登录');
        return false;
    }

    log.info(`当前登录用户: ${credentials.username}`);
    log.info(`登录时间: ${new Date(credentials.loginTime).toLocaleString()}`);

    if (credentials.expiresAt) {
        const remainingTime = credentials.expiresAt - Date.now();
        if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            log.info(`凭证剩余有效期: ${hours}小时${minutes}分钟`);
        } else {
            log.warn('登录凭证已过期，请重新登录');
            deleteCredentials();
            return false;
        }
    }

    return true;
}

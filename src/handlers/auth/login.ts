import readline from 'readline';
import readlineSync from 'readline-sync';
import { saveCredentials, loadCredentials, LoginCredentials } from '../../utils/auth';
import { getConfig } from '../../config';
import log from '../../utils/log';

interface LoginOptions {
    username?: string;
    password?: string;
    server?: string;
}

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function prompt(question: string): Promise<string> {
    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function promptPassword(question: string): Promise<string> {
    return new Promise((resolve) => {
        try {
            const password = readlineSync.question(question, {
                hideEchoBack: true,
                mask: '*',
            });
            resolve(password.trim());
        } catch {
            const rl = createInterface();
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        }
    });
}

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
            throw new Error('登录返回数据格式不正确');
        }

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

export async function loginAction(options: LoginOptions): Promise<void> {
    try {
        log.info('开始登录 nest-serve 后台...\n');

        let username = options.username;
        let password = options.password;
        let server = options.server;

        if (!server) {
            const configServer = getConfig<string>('source');
            server = typeof configServer === 'string' && configServer.trim() ? configServer : 'http://localhost:3000';
            log.info(`使用配置的服务器地址: ${server}`);
        }

        if (!username) {
            username = await prompt('用户名: ');
        }

        if (!password) {
            password = await promptPassword('密码: ');
        }

        log.info('正在登录...');

        const credentials = await loginToServer(username!, password!, server);
        saveCredentials(credentials);
        log.success('登录成功');
    } catch (error) {
        log.error(`登录失败: ${error}`);
        process.exit(1);
    }
}

export async function checkLoginStatus(): Promise<boolean> {
    const credentials = loadCredentials();

    if (!credentials) {
        log.info('未登录');
        return false;
    }

    log.info(`当前登录用户: ${credentials.username}`);
    log.info(`登录时间: ${new Date(credentials.loginTime).toLocaleString()}`);

    if (credentials.expiresAt) {
        log.info(`过期时间: ${new Date(credentials.expiresAt).toLocaleString()}`);
    }

    return true;
}

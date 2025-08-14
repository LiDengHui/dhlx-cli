import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.dhlxrc');

export interface LoginCredentials {
    token: {
        accessToken: string;
        refreshToken: string;
    };
    username: string;
    loginTime: number;
    expiresAt?: number;
}

/**
 * 保存登录凭证到配置文件
 */
export function saveCredentials(credentials: LoginCredentials): void {
    try {
        const configDir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(credentials, null, 2));
    } catch (error) {
        throw new Error(`保存登录凭证失败: ${error}`);
    }
}

/**
 * 读取登录凭证
 */
export function loadCredentials(): LoginCredentials | null {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return null;
        }

        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const credentials: LoginCredentials = JSON.parse(data);

        // 检查凭证是否过期
        if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
            deleteCredentials();
            return null;
        }

        return credentials;
    } catch (error) {
        console.error('读取登录凭证失败:', error);
        return null;
    }
}

/**
 * 删除登录凭证
 */
export function deleteCredentials(): void {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            fs.unlinkSync(CONFIG_FILE);
        }
    } catch (error) {
        console.error('删除登录凭证失败:', error);
    }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
    const credentials = loadCredentials();
    return credentials !== null;
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser(): LoginCredentials | null {
    return loadCredentials();
}

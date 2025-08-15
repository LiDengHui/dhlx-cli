import fs from 'fs';
import path from 'path';
import os from 'os';

// 使用统一的配置文件
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

interface DhlxConfig {
    source?: string;
    username?: string;
    token?: {
        accessToken: string;
        refreshToken: string;
    };
    loginTime?: number;
    expiresAt?: number;
    [key: string]: any;
}

/**
 * 读取配置文件
 */
function loadConfig(): DhlxConfig {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.error('读取配置文件失败:', error);
    }
    return {};
}

/**
 * 保存配置文件
 */
function saveConfig(config: DhlxConfig): void {
    try {
        const configDir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('保存配置文件失败:', error);
        throw error;
    }
}

/**
 * 保存登录凭证到配置文件
 */
export function saveCredentials(credentials: LoginCredentials): void {
    try {
        const config = loadConfig();

        // 更新登录相关信息
        config.token = credentials.token;
        config.username = credentials.username;
        config.loginTime = credentials.loginTime;
        config.expiresAt = credentials.expiresAt;

        saveConfig(config);
    } catch (error) {
        throw new Error(`保存登录凭证失败: ${error}`);
    }
}

/**
 * 读取登录凭证
 */
export function loadCredentials(): LoginCredentials | null {
    try {
        const config = loadConfig();

        // 检查是否有登录凭证
        if (!config.token || !config.username || !config.loginTime) {
            return null;
        }

        const credentials: LoginCredentials = {
            token: config.token,
            username: config.username,
            loginTime: config.loginTime,
            expiresAt: config.expiresAt,
        };

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
        const config = loadConfig();

        // 只删除登录相关的字段，保留其他配置
        delete config.token;
        delete config.username;
        delete config.loginTime;
        delete config.expiresAt;

        saveConfig(config);
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

import { readConfig, writeConfig } from './config-store';
import type { KnownConfig } from './config-store';

export interface LoginCredentials {
    token: NonNullable<KnownConfig['token']>;
    username: string;
    loginTime: number;
    expiresAt?: number;
}

/**
 * 保存登录凭证到配置文件
 */
export function saveCredentials(credentials: LoginCredentials): void {
    try {
        const config = readConfig();

        // 更新登录相关信息
        config.token = credentials.token;
        config.username = credentials.username;
        config.loginTime = credentials.loginTime;
        config.expiresAt = credentials.expiresAt;

        writeConfig(config);
    } catch (error) {
        throw new Error(`保存登录凭证失败: ${error}`);
    }
}

/**
 * 读取登录凭证
 */
export function loadCredentials(): LoginCredentials | null {
    try {
        const config = readConfig();

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
        const config = readConfig();

        // 只删除登录相关的字段，保留其他配置
        delete config.token;
        delete config.username;
        delete config.loginTime;
        delete config.expiresAt;

        writeConfig(config);
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

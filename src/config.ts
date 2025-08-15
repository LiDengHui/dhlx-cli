import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

interface DhlxConfig {
    source?: string; // 默认服务器地址
    username?: string; // 默认用户名
    token?: {
        accessToken: string;
        refreshToken: string;
    };
    loginTime?: number;
    expiresAt?: number;
    [key: string]: any; // 其他配置项
}

const CONFIG_FILE = path.join(homedir(), '.dhlxrc');

/**
 * 获取配置文件路径
 */
function getConfigPath(): string {
    return CONFIG_FILE;
}

/**
 * 读取配置
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
 * 保存配置
 */
function saveConfig(config: DhlxConfig): void {
    try {
        // 确保目录存在
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
 * 设置配置项
 */
export function setConfig(key: string, value: string): void {
    const config = loadConfig();
    config[key] = value;
    saveConfig(config);
}

/**
 * 获取配置项
 */
export function getConfig(key: string): string | undefined {
    const config = loadConfig();
    return config[key];
}

/**
 * 获取所有配置
 */
export function getAllConfig(): DhlxConfig {
    return loadConfig();
}

/**
 * 删除配置项
 */
export function deleteConfig(key: string): void {
    const config = loadConfig();
    delete config[key];
    saveConfig(config);
}

/**
 * 清空所有配置
 */
export function clearConfig(): void {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            fs.unlinkSync(CONFIG_FILE);
        }
    } catch (error) {
        console.error('清空配置文件失败:', error);
        throw error;
    }
}

/**
 * 显示配置信息
 */
export function showConfig(): void {
    const config = loadConfig();
    if (Object.keys(config).length === 0) {
        console.log('暂无配置信息');
        return;
    }

    console.log('当前配置:');
    Object.entries(config).forEach(([key, value]) => {
        // 隐藏敏感信息
        if (key === 'token') {
            console.log(`  ${key}: [已隐藏]`);
        } else if (key === 'loginTime' || key === 'expiresAt') {
            console.log(`  ${key}: ${new Date(value).toLocaleString()}`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    });
}

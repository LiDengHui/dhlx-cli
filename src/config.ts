import fs from 'fs';
import { ConfigParseError, CONFIG_FILE, readConfig, writeConfig } from './utils/config-store';
import type { DhlxConfig } from './utils/config-store';

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
        return readConfig();
    } catch (error) {
        if (error instanceof ConfigParseError) {
            console.error(`读取配置文件失败: ${error.message}`);
            if (error.backupPath) {
                console.error(`已备份损坏配置文件到: ${error.backupPath}`);
            }
            throw new Error(`配置文件已损坏，请修复或删除后重试: ${getConfigPath()}`);
        }
        throw error;
    }
}

/**
 * 保存配置
 */
function saveConfig(config: DhlxConfig): void {
    writeConfig(config);
}

/**
 * 设置配置项
 */
export function setConfig(key: string, value: unknown): void {
    const config = loadConfig();
    config[key] = value;
    saveConfig(config);
}

/**
 * 获取配置项
 */
export function getConfig<T = unknown>(key: string): T | undefined {
    const config = loadConfig();
    return config[key] as T | undefined;
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
            const ts = typeof value === 'number' ? value : Number(value);
            if (Number.isFinite(ts)) {
                console.log(`  ${key}: ${new Date(ts).toLocaleString()}`);
            } else {
                console.log(`  ${key}: [无效时间戳: ${String(value)}]`);
            }
        } else {
            console.log(`  ${key}: ${value}`);
        }
    });
}

export type { DhlxConfig } from './utils/config-store';

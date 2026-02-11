import fs from 'fs';
import path from 'path';
import os from 'os';

export interface AuthToken {
    accessToken: string;
    refreshToken: string;
}

export interface KnownConfig {
    source?: string;
    username?: string;
    token?: AuthToken;
    loginTime?: number;
    expiresAt?: number;
}

export type DhlxConfig = KnownConfig & {
    [key: string]: unknown;
};

export class ConfigParseError extends Error {
    public readonly configPath: string;
    public readonly backupPath?: string;

    constructor(message: string, configPath: string, backupPath?: string) {
        super(message);
        this.name = 'ConfigParseError';
        this.configPath = configPath;
        this.backupPath = backupPath;
    }
}

export const CONFIG_FILE = path.join(os.homedir(), '.dhlxrc');

function ensureConfigDirExists(configPath: string): void {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
}

function backupBrokenConfig(configPath: string): string | undefined {
    try {
        const backupPath = `${configPath}.bak-${Date.now()}`;
        fs.copyFileSync(configPath, backupPath);
        return backupPath;
    } catch {
        return undefined;
    }
}

export function readConfig(configPath: string = CONFIG_FILE): DhlxConfig {
    if (!fs.existsSync(configPath)) {
        return {};
    }

    const configData = fs.readFileSync(configPath, 'utf-8');
    try {
        const parsed = JSON.parse(configData) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('配置内容必须是 JSON 对象');
        }
        return parsed as DhlxConfig;
    } catch (error) {
        const backupPath = backupBrokenConfig(configPath);
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new ConfigParseError(`配置文件解析失败: ${errorMsg}`, configPath, backupPath);
    }
}

export function writeConfig(config: DhlxConfig, configPath: string = CONFIG_FILE): void {
    ensureConfigDirExists(configPath);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    if (process.platform !== 'win32') {
        try {
            fs.chmodSync(configPath, 0o600);
        } catch {
            // Ignore chmod failures on unsupported filesystems.
        }
    }
}

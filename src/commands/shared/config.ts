import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function loadConfigModule<TConfig extends object>(configPath?: string): Promise<Partial<TConfig>> {
    if (!configPath) {
        return {};
    }

    const absoluteConfigPath = path.resolve(process.cwd(), configPath);
    const configModule = await import(pathToFileURL(absoluteConfigPath).href);
    return (configModule.default ?? configModule) as Partial<TConfig>;
}

export function loadJsonConfigIfExists<TConfig = unknown>(configPath: string): TConfig | undefined {
    const absoluteConfigPath = path.resolve(process.cwd(), configPath);
    if (!fs.existsSync(absoluteConfigPath)) {
        return undefined;
    }

    const fileContent = fs.readFileSync(absoluteConfigPath, 'utf-8');
    return JSON.parse(fileContent) as TConfig;
}

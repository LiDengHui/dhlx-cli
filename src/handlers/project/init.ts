import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files: Record<string, string> = {
    prettier: 'prettier.config.js',
    tsconfig: 'tsconfig.json',
    jscpd: '.jscpd.json',
    deploy: 'deployConfig.json',
    process: 'process.js',
};

export const getInitKeys = () => Object.keys(files);

export function copyConfigFile(type: string): void {
    const file = files[type];

    if (!file) {
        console.error(`Invalid type: ${type}. Supported types are: prettier, tsconfig, jscpd`);
        return;
    }

    const sourcePath = path.resolve(__dirname, `../../${file}`);
    const destinationPath = path.resolve(process.cwd(), file);

    if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`);
        return;
    }

    try {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied ${file} to ${destinationPath}`);
    } catch (error) {
        console.error(`Failed to copy ${file}:`, error);
    }
}

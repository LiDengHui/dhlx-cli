import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type InitFile = {
    targetName: string;
    sourceName: string;
};

const files: Record<string, InitFile> = {
    oxfmt: { targetName: '.oxfmtrc.json', sourceName: '.oxfmtrc.json' },
    tsconfig: { targetName: 'tsconfig.json', sourceName: 'tsconfig.json' },
    jscpd: { targetName: '.jscpd.json', sourceName: '.jscpd.json' },
    deploy: { targetName: 'deployConfig.json', sourceName: 'deployConfig.json' },
    process: { targetName: 'process.js', sourceName: 'process.js' },
};

export const getInitKeys = () => Object.keys(files);

export function copyConfigFile(type: string): void {
    const config = files[type];

    if (!config) {
        console.error(`Invalid type: ${type}. Supported types are: ${getInitKeys().join(', ')}`);
        return;
    }

    const candidateSourcePaths = [
        // Preferred location: package-root/docs/init
        path.resolve(__dirname, `../../../docs/init/${config.sourceName}`),
        // Backward-compatible fallback for older layouts
        path.resolve(__dirname, `../../${config.sourceName}`),
    ];
    const sourcePath = candidateSourcePaths.find((candidatePath) => fs.existsSync(candidatePath));
    const destinationPath = path.resolve(process.cwd(), config.targetName);

    if (!sourcePath) {
        console.error(`Source file not found for "${type}".`);
        console.error(`Expected one of: ${candidateSourcePaths.join(' | ')}`);
        return;
    }

    try {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied ${config.targetName} to ${destinationPath}`);
    } catch (error) {
        console.error(`Failed to copy ${config.targetName}:`, error);
    }
}

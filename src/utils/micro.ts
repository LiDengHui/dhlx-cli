import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createWriteStream } from 'fs';
import { loadCredentials } from './auth';
import log from './log';

export interface MicroConfig {
    name: string;
    version: string;
    code: string;
    buildInfo?: {
        buildTime: string;
        buildEnv: string;
    };
    [key: string]: any;
}

/**
 * 计算文件的 MD5 哈希值
 */
export function calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data: Buffer) => {
            hash.update(data as any);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 读取并解析 micro.config.json 文件
 */
export function parseMicroConfig(distPath: string): MicroConfig {
    const configPath = path.join(distPath, 'micro.config.json');

    if (!fs.existsSync(configPath)) {
        throw new Error(`micro.config.json 文件不存在: ${configPath}`);
    }

    try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config: MicroConfig = JSON.parse(configData);

        // 验证必需的字段
        if (!config.name) {
            throw new Error('micro.config.json 缺少 name 字段');
        }
        if (!config.version) {
            throw new Error('micro.config.json 缺少 version 字段');
        }
        if (!config.code) {
            throw new Error('micro.config.json 缺少 code 字段');
        }

        return config;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`micro.config.json 格式错误: ${error.message}`);
        }
        throw error;
    }
}

/**
 * 检查登录状态
 */
export function checkLogin(): string {
    const credentials = loadCredentials();
    if (!credentials) {
        throw new Error('您尚未登录，请先运行 `dhlx login` 命令登录');
    }
    return credentials.token.accessToken;
}

/**
 * 验证 dist 目录是否存在且包含必要文件
 */
export function validateDistDirectory(distPath: string): void {
    if (!fs.existsSync(distPath)) {
        throw new Error(`dist 目录不存在: ${distPath}`);
    }

    if (!fs.statSync(distPath).isDirectory()) {
        throw new Error(`${distPath} 不是一个目录`);
    }

    // 检查是否有文件
    const files = fs.readdirSync(distPath);
    if (files.length === 0) {
        throw new Error('dist 目录为空，请先构建项目');
    }

    // 检查 micro.config.json
    const configPath = path.join(distPath, 'micro.config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error('dist 目录中缺少 micro.config.json 文件');
    }

    log.info(`验证通过，发现 ${files.length} 个文件`);
}

/**
 * 创建 ZIP 文件
 */
export async function createZipArchive(sourcePath: string, zipPath: string): Promise<string> {
    // 这里我们使用 Node.js 内置的压缩功能
    // 在实际项目中，您可能需要使用 archiver 或其他压缩库
    const archiver = await import('archiver');

    return new Promise((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = archiver.default('zip', {
            zlib: { level: 9 }, // 设置压缩级别
        });

        output.on('close', () => {
            const size = archive.pointer();
            log.info(`ZIP 文件创建完成，大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
            resolve(zipPath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // 添加 dist 目录中的所有文件到 ZIP
        archive.directory(sourcePath, false);

        archive.finalize();
    });
}

/**
 * 上传文件到服务器
 */
export async function uploadToServer(
    zipPath: string,
    server: string,
    token: string,
    microConfig: MicroConfig,
): Promise<any> {
    const formData = new FormData();

    // 添加 ZIP 文件
    const zipBuffer = fs.readFileSync(zipPath);
    const zipBlob = new Blob([zipBuffer as any], { type: 'application/zip' });
    formData.append('file', zipBlob, path.basename(zipPath));

    // 添加微应用配置信息
    formData.append('name', microConfig.name);
    formData.append('version', microConfig.version);
    formData.append('code', microConfig.code);

    // 计算并添加 MD5 校验和
    const md5Hash = await calculateMD5(zipPath);
    formData.append('checksum', md5Hash);

    log.info(`开始上传文件，MD5: ${md5Hash}`);

    const response = await fetch(`${server}/admin/subapps/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new Error(errorData.message || `上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

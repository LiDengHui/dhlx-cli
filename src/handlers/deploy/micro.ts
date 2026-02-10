import fs from 'fs';
import path from 'path';
import os from 'os';
import {
    validateDistDirectory,
    parseMicroConfig,
    createZipArchive,
    uploadToServer,
    checkLogin,
    MicroConfig,
} from '../../utils/micro.js';
import { getConfig } from '../../config.js';
import log from '../../utils/log.js';

interface PublishOptions {
    dist?: string;
    server?: string;
    zipName?: string;
}

export async function publishAction(options: PublishOptions): Promise<void> {
    try {
        log.info('开始发布微应用...\n');

        const distPath = options.dist || './dist';
        let server = options.server;

        if (!server) {
            server = getConfig('source') || 'http://localhost:3000';
            log.info(`使用配置的服务器地址: ${server}`);
        }

        const zipName = options.zipName || `${path.basename(process.cwd())}-${Date.now()}.zip`;
        const zipPath = path.join(os.tmpdir(), zipName);

        log.info('1. 检查登录状态...');
        const token = checkLogin();
        log.success('登录状态验证通过');

        log.info('2. 验证 dist 目录...');
        validateDistDirectory(distPath);

        log.info('3. 解析 micro.config.json...');
        const microConfig = parseMicroConfig(distPath);
        log.success(`配置解析成功: ${microConfig.name} v${microConfig.version} (${microConfig.code})`);

        log.info('4. 创建 ZIP 文件...');
        await createZipArchive(distPath, zipPath);

        log.info('5. 上传到服务器...');
        const result = await uploadToServer(zipPath, server, token, microConfig);

        log.info('6. 清理临时文件...');
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
            log.info('临时 ZIP 文件已删除');
        }

        log.success('微应用发布成功！');
        log.info(`应用名称: ${microConfig.name}`);
        log.info(`版本: ${microConfig.version}`);
        log.info(`应用代码: ${microConfig.code}`);

        if (result.data) {
            log.info(`服务器响应: ${JSON.stringify(result.data, null, 2)}`);
        }
    } catch (error) {
        log.error(`发布失败: ${error}`);
        const zipPath = path.join(os.tmpdir(), options.zipName || `${path.basename(process.cwd())}-${Date.now()}.zip`);
        if (fs.existsSync(zipPath)) {
            try {
                fs.unlinkSync(zipPath);
            } catch (cleanupError) {
                log.error(`无法删除临时文件: ${cleanupError}`);
            }
        }

        process.exit(1);
    }
}

export function validateMicroConfig(distPath: string): MicroConfig {
    log.info('验证微应用配置...');

    try {
        const config = parseMicroConfig(distPath);

        log.success('配置验证通过');
        log.info(`应用名称: ${config.name}`);
        log.info(`版本: ${config.version}`);
        log.info(`应用代码: ${config.code}`);

        if (config.buildInfo) {
            log.info(`构建时间: ${config.buildInfo.buildTime}`);
        }

        return config;
    } catch (error) {
        log.error(`配置验证失败: ${error}`);
        throw error;
    }
}

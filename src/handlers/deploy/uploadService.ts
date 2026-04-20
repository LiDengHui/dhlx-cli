import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { NodeSSH } from 'node-ssh';

export interface DeployOptions {
    source: string;
    zip: string;
    host: string;
    user: string;
    password?: string;
    privateKeyPath?: string;
    remote: string;
    extract: string;
    exclude?: string[];
}

export async function deployAction(options: DeployOptions): Promise<void> {
    const { source, zip, host, user, password, privateKeyPath, remote, extract, exclude = [] } = options;
    if (!source) {
        console.error('Error: No source directory provided');
        process.exit(1);
    }

    const zipPath = path.resolve(zip);
    await compressDirectory(source, zipPath, exclude);
    await uploadAndExtractFile(zipPath, { host, user, password, privateKeyPath, remote, extract });
    fs.unlinkSync(zipPath);
    console.log('Deployment complete');
}

async function compressDirectory(directory: string, zipPath: string, exclude: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            files.forEach((file) => {
                const fullPath = path.join(directory, file);

                if (exclude.some((e: string) => fullPath === path.join(directory, e))) {
                    return;
                }
                if (fs.lstatSync(fullPath).isDirectory()) {
                    archive.directory(fullPath, file);
                } else {
                    archive.file(fullPath, { name: file });
                }
            });
        } else {
            console.warn(`Warning: Directory not found: ${directory}`);
        }

        archive.finalize();
    });
}

interface UploadOptions {
    host: string;
    user: string;
    password?: string;
    privateKeyPath?: string;
    remote: string;
    extract: string;
}

async function uploadAndExtractFile(
    zipPath: string,
    { host, user, password, privateKeyPath, remote, extract }: UploadOptions,
): Promise<void> {
    const ssh = new NodeSSH();
    const connectionOptions: {
        host: string;
        username: string;
        password?: string;
        privateKey?: string;
    } = { host, username: user };

    if (password) {
        connectionOptions.password = password;
    } else {
        const resolvedKeyPath = resolvePrivateKeyPath(privateKeyPath);
        if (!fs.existsSync(resolvedKeyPath)) {
            throw new Error(`No password provided and SSH key not found at ${resolvedKeyPath}`);
        }
        connectionOptions.privateKey = fs.readFileSync(resolvedKeyPath, 'utf-8');
        console.log(`Using SSH key from ${resolvedKeyPath}`);
    }

    await ssh.connect(connectionOptions);

    const remoteZipPath = `${remote}/${path.basename(zipPath)}`;
    console.log(`Uploading ${zipPath} to ${remoteZipPath}...`);
    await ssh.putFile(zipPath, remoteZipPath);

    console.log(`Extracting ${remoteZipPath} to ${extract}...`);
    await ssh.execCommand(`unzip -o ${remoteZipPath} -d ${extract}`);

    console.log('Cleanup remote zip file...');
    await ssh.execCommand(`rm ${remoteZipPath}`);

    ssh.dispose();
}

function resolvePrivateKeyPath(candidate?: string): string {
    if (!candidate) {
        return path.join(os.homedir(), '.ssh', 'id_rsa');
    }

    if (candidate === '~') {
        return os.homedir();
    }

    if (candidate.startsWith('~/') || candidate.startsWith('~\\')) {
        return path.join(os.homedir(), candidate.slice(2));
    }

    if (path.isAbsolute(candidate)) {
        return candidate;
    }

    return path.resolve(candidate);
}

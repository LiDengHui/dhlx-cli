import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { NodeSSH } from 'node-ssh';

// Define the interface for the options parameter
interface DeployOptions {
    source: string; // Change to a single directory (string)
    zip: string;
    host: string;
    user: string;
    password: string;
    remote: string;
    extract: string;
    exclude: string[];
}

export async function deployAction(options: DeployOptions): Promise<void> {
    const { source, zip, host, user, password, remote, extract, exclude = [] } = options;
    console.log(options);
    if (!source) {
        console.error('Error: No source directory provided');
        process.exit(1);
    }

    const zipPath = path.resolve(zip);
    await compressDirectory(source, zipPath, exclude); // Changed to compressDirectory
    await uploadAndExtractFile(zipPath, { host, user, password, remote, extract });
    fs.unlinkSync(zipPath);
    console.log('Deployment complete');
}

// Compress contents of the source directory, not including the top-level directory
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
                    // If it's a directory, add the directory recursively
                    archive.directory(fullPath, file);
                } else {
                    // If it's a file, just add it
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
    password: string;
    remote: string;
    extract: string;
}

async function uploadAndExtractFile(
    zipPath: string,
    { host, user, password, remote, extract }: UploadOptions,
): Promise<void> {
    const ssh = new NodeSSH();
    await ssh.connect({ host, username: user, password });

    const remoteZipPath = `${remote}/${path.basename(zipPath)}`;
    console.log(`Uploading ${zipPath} to ${remoteZipPath}...`);
    await ssh.putFile(zipPath, remoteZipPath);

    console.log(`Extracting ${remoteZipPath} to ${extract}...`);
    await ssh.execCommand(`unzip -o ${remoteZipPath} -d ${extract}`);

    console.log('Cleanup remote zip file...');
    await ssh.execCommand(`rm ${remoteZipPath}`);

    ssh.dispose();
}

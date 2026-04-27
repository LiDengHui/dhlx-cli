import path from 'path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { BaseOptions, validFiles } from '../image/baseImage';

const execFileAsync = promisify(execFile);

type OutputFormat = 'png' | 'jpeg' | 'tiff';
const supportedFormats: OutputFormat[] = ['png', 'jpeg', 'tiff'];

export interface PdfToImgOptions extends BaseOptions {
    format?: OutputFormat;
    page?: number;
    scale?: number;
    prefix?: string;
}

async function renderFirstPageToPng(inputFile: string, outputFile: string, scale: number): Promise<void> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dhlx-pdf2img-'));

    try {
        await execFileAsync('qlmanage', ['-t', '-s', String(scale), '-o', tempDir, inputFile]);

        const generated = fs.readdirSync(tempDir).find((file) => file.toLowerCase().endsWith('.png'));

        if (!generated) {
            throw new Error(`qlmanage did not generate a PNG preview for ${inputFile}`);
        }

        fs.copyFileSync(path.join(tempDir, generated), outputFile);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function convertPngToFormat(
    inputFile: string,
    outputFile: string,
    format: Exclude<OutputFormat, 'png'>,
): Promise<void> {
    await execFileAsync('sips', ['-s', 'format', format, inputFile, '--out', outputFile]);
}

export async function pdfToImg(options: PdfToImgOptions): Promise<void> {
    const format = options.format ?? 'png';
    const scale = Number.isFinite(options.scale) ? Number(options.scale) : 1024;

    if (!supportedFormats.includes(format)) {
        throw new Error(`Unsupported format: ${format}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    if (options.page && options.page !== 1) {
        throw new Error('The current macOS qlmanage-based implementation only supports exporting the first page.');
    }

    await validFiles(['.pdf'], options, async (file, output, ext) => {
        const baseName = path.basename(file, ext);
        const outPrefix = options.prefix ?? baseName;
        const pngOutput = path.join(output, `${outPrefix}.png`);
        const finalOutput = path.join(output, `${outPrefix}.${format}`);

        await renderFirstPageToPng(file, pngOutput, scale);

        if (format !== 'png') {
            await convertPngToFormat(pngOutput, finalOutput, format);
            fs.rmSync(pngOutput, { force: true });
        }

        console.log(`Converted: ${file} -> ${format === 'png' ? pngOutput : finalOutput}`);
    });
}

import { BaseOptions, validFiles } from './baseImage.js';
import mammoth from 'mammoth';
import path from 'path';
import * as fs from 'node:fs';

interface WordToHtmlOption extends BaseOptions {}

export async function wordToHtml(options: WordToHtmlOption): Promise<void> {
    await validFiles(['.docx', '.doc'], options, async (file, output, ext) => {
        const { value: html } = await mammoth.convertToHtml({ path: file });
        const outputFile = path.join(output, `${path.basename(file, ext)}.html`);
        fs.writeFileSync(outputFile, html);
        console.log(`Compressed: ${file} -> ${outputFile}`);
    });
}

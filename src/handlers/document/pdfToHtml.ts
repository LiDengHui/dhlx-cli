import { BaseOptions, validFiles } from '../image/baseImage';
import path from 'path';
import * as fs from 'node:fs';
import util from 'node:util';
import child_process from 'node:child_process';

const exec = util.promisify(child_process.exec);

interface WordToHtmlOption extends BaseOptions {}
// brew install poppler
export async function pdfToHtml(options: WordToHtmlOption): Promise<void> {
    await validFiles(['.pdf'], options, async (file, output, ext) => {
        const outputFile = path.join(output, `./${path.basename(file, ext)}/index.html`);
        const filex = path.join(output, path.basename(file, ext));
        if (!fs.existsSync(filex)) {
            fs.mkdirSync(filex, { recursive: true });
        }
        try {
            const { stdout } = await exec(`pdftohtml -c -zoom 1.5 -noframes '${file}' '${outputFile}'`);
            console.log(stdout);
        } catch (error) {
            console.error(error);
        }

        console.log(`Compressed: ${file} -> ${output}`);
    });
}

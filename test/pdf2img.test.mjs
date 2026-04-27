import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, test } from 'vite-plus/test';

const execFileAsync = promisify(execFile);
const projectRoot = '/Users/yanqi/work/dhlx/dhlx-cli';
const cliPath = path.join(projectRoot, 'bin/index.js');

async function runCli(args, options = {}) {
    return execFileAsync('node', [cliPath, ...args], {
        cwd: projectRoot,
        env: process.env,
        ...options,
    });
}

async function createSamplePdf(filePath) {
    const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
40 100 Td
(Hello PDF) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000342 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
412
%%EOF
`;
    await fs.writeFile(filePath, pdf, 'utf8');
}

describe('pdf2img CLI', () => {
    test('help should expose the pdf2img command', async () => {
        const { stdout } = await runCli(['--help']);

        expect(stdout).toContain('pdf2img');
    });

    test('converts a PDF into at least one image file', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dhlx-pdf2img-'));
        const inputFile = path.join(tempDir, 'sample.pdf');
        const outputDir = path.join(tempDir, 'output');

        await createSamplePdf(inputFile);
        await runCli(['pdf2img', '-i', inputFile, '-o', outputDir]);

        const entries = await fs.readdir(outputDir);
        expect(entries.some((entry) => entry.endsWith('.png'))).toBe(true);
    });
});

import { BaseOptions, validFiles } from './baseImage.js';
import path from 'path';
import sharp from 'sharp';

interface ImageSizeOption extends BaseOptions {
    width?: number;
    height?: number;
}

export async function imageSize(options: ImageSizeOption): Promise<void> {
    const { width = 500, height = 500 } = options;

    await validFiles(options, async (file, output) => {
        const outputFile = path.join(output, path.basename(file));
        await sharp(file).resize({ width, height }).toFile(outputFile);
        console.log(`Compressed: ${file} -> ${outputFile}`);
    });
}

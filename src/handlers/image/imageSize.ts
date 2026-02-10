import { BaseOptions, defaultImage, validFiles } from './baseImage.js';
import path from 'path';
import sharp, { FitEnum } from 'sharp';

interface ImageSizeOption extends BaseOptions {
    width?: number;
    height?: number;
    fit?: keyof FitEnum;
    position?: number | string;
}

export async function imageSize(options: ImageSizeOption): Promise<void> {
    const { width, height, fit, position = 500 } = options;

    await validFiles(defaultImage, options, async (file, output) => {
        const outputFile = path.join(output, path.basename(file));
        await sharp(file).resize({ width, height, fit, position }).toFile(outputFile);
        console.log(`Compressed: ${file} -> ${outputFile}`);
    });
}

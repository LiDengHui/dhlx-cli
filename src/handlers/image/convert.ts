import sharp, { FormatEnum } from 'sharp';
import { BaseOptions, defaultImage, validFiles } from './baseImage.js';
import path from 'path';

interface ConvertOptions extends BaseOptions {
    format: string;
}

export async function convertImages(options: ConvertOptions): Promise<void> {
    const { format } = options;

    await validFiles(
        defaultImage,
        options,
        async (file, output, ext) => {
            const outputFile = path.join(output, `${path.basename(file, ext)}.${format}`);
            await sharp(file)
                .toFormat(format as keyof FormatEnum)
                .toFile(outputFile);
            console.log(`Converted: ${file} -> ${outputFile}`);
        },
        () => {
            if (!['jpg', 'png', 'webp'].includes(format.toLowerCase())) {
                console.error('Unsupported format. Use jpg, png, or webp.');
                process.exit(1);
            }
        },
    );
}

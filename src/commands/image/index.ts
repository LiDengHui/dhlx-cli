import { Command } from 'commander';
import { compressImages, convertImages, imageSize } from '../../handlers/image';
import { parseOptionalInt } from '../shared/parse';

export function registerImageCommands(program: Command): void {
    program
        .command('compress')
        .description('Compress images')
        .option('-i, --input <path>', 'Input file or folder path')
        .option('-o, --output <path>', 'Output folder path', './output')
        .option('-q, --quality <number>', 'Image quality (default: 80)', '80')
        .action(async (options) => {
            const quality = parseOptionalInt(options.quality, 'quality');
            await compressImages({
                input: options.input,
                output: options.output,
                quality,
            });
        });

    program
        .command('image-size')
        .description('Change images size')
        .option('-i, --input <path>', 'Input file or folder path')
        .option('-o, --output <path>', 'Output folder path', './output')
        .option('-w, --width <number>', 'Image width')
        .option('-h, --height <number>', 'Image Height')
        .option('-f, --fit <string>', 'fit contain|cover|fill|inside|outside')
        .option('-p, --position <string>', 'position, top center bottom left right', 'center')
        .action(async (options) => {
            const width = parseOptionalInt(options.width, 'width');
            const height = parseOptionalInt(options.height, 'height');
            await imageSize({
                input: options.input,
                output: options.output,
                width,
                height,
                fit: options.fit,
                position: options.position,
            });
        });

    program
        .command('convert')
        .description('Convert image formats')
        .option('-i, --input <path>', 'Input file or folder path')
        .option('-o, --output <path>', 'Output folder path', './output')
        .option('-f, --format <string>', 'Target image format (jpg, png, webp)', 'jpg')
        .action(async (options) => {
            await convertImages({
                input: options.input,
                output: options.output,
                format: options.format,
            });
        });
}

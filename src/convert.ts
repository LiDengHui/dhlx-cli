import sharp, { FormatEnum } from 'sharp'
import { BaseOptions, validFiles } from './baseImage.js'

interface ConvertOptions extends BaseOptions {
    format: string
}

export async function convertImages(options: ConvertOptions): Promise<void> {
    const { format } = options

    await validFiles(
        options,
        async (file, outputFile) => {
            await sharp(file)
                .toFormat(format as keyof FormatEnum)
                .toFile(outputFile)
            console.log(`Compressed: ${file} -> ${outputFile}`)
        },
        () => {
            if (!['jpg', 'png', 'webp'].includes(format.toLowerCase())) {
                console.error('Unsupported format. Use jpg, png, or webp.')
                process.exit(1)
            }
        }
    )
}

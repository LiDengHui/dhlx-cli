import sharp from 'sharp'
import { BaseOptions, validFiles } from './baseImage.js'

interface CompressOptions extends BaseOptions {
    quality: number
}

export async function compressImages(options: CompressOptions): Promise<void> {
    const { quality } = options

    await validFiles(options, async (file, outputFile) => {
        await sharp(file).jpeg({ quality }).toFile(outputFile)
        console.log(`Compressed: ${file} -> ${outputFile}`)
    })
}

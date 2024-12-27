import sharp from 'sharp'
import { BaseOptions, validFiles } from './baseImage.js'
import path from 'path'

interface CompressOptions extends BaseOptions {
    quality: number
}

export async function compressImages(options: CompressOptions): Promise<void> {
    const { quality } = options

    await validFiles(options, async (file, output) => {
        const outputFile = path.join(output, path.basename(file))
        await sharp(file).jpeg({ quality }).toFile(outputFile)
        console.log(`Compressed: ${file} -> ${outputFile}`)
    })
}

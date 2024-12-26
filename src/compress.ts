import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

interface CompressOptions {
    input: string
    output: string
    quality: number
}

export async function compressImages(options: CompressOptions): Promise<void> {
    const { input, output, quality } = options

    if (!input) {
        console.error('Input path is required.')
        process.exit(1)
    }

    const files = fs.statSync(input).isDirectory() ? fs.readdirSync(input).map((file) => path.join(input, file)) : [input]

    fs.mkdirSync(output, { recursive: true })

    for (const file of files) {
        const ext = path.extname(file)
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
            console.log(`Skipping unsupported file: ${file}`)
            continue
        }

        const outputFile = path.join(output, path.basename(file))
        await sharp(file).jpeg({ quality }).toFile(outputFile)
        console.log(`Compressed: ${file} -> ${outputFile}`)
    }
}

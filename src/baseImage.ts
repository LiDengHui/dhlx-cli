import fs from 'fs'
import path from 'path'

export interface BaseOptions {
    input: string
    output: string
}
export async function validFiles<T extends BaseOptions>(options: T, eachHandle: (file: string, outputFile: string) => Promise<void>, beforeValid?: (options: T) => void): Promise<void> {
    const { input, output } = options

    if (!input) {
        console.error('Input path is required.')
        process.exit(1)
    }

    beforeValid && beforeValid(options)

    const files = fs.statSync(input).isDirectory() ? fs.readdirSync(input).map((file) => path.join(input, file)) : [input]

    fs.mkdirSync(output, { recursive: true })

    for (const file of files) {
        const ext = path.extname(file)
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
            console.log(`Skipping unsupported file: ${file}`)
            continue
        }

        const outputFile = path.join(output, path.basename(file))
        await eachHandle(file, outputFile)
        console.log(`Compressed: ${file} -> ${outputFile}`)
    }
}

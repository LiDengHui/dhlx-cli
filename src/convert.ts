import fs from 'fs'
import path from 'path'
import sharp, { FormatEnum } from 'sharp'

interface ConvertOptions {
  input: string
  output: string
  format: string
}

export async function convertImages(options: ConvertOptions): Promise<void> {
  const { input, output, format } = options

  if (!input) {
    console.error('Input path is required.')
    process.exit(1)
  }
  if (!['jpg', 'png', 'webp'].includes(format.toLowerCase())) {
    console.error('Unsupported format. Use jpg, png, or webp.')
    process.exit(1)
  }

  const files = fs.statSync(input).isDirectory()
    ? fs.readdirSync(input).map((file) => path.join(input, file))
    : [input]

  fs.mkdirSync(output, { recursive: true })

  for (const file of files) {
    const ext = path.extname(file)
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
      console.log(`Skipping unsupported file: ${file}`)
      continue
    }

    const outputFile = path.join(
      output,
      `${path.basename(file, ext)}.${format}`
    )
    await sharp(file)
      .toFormat(format as keyof FormatEnum)
      .toFile(outputFile)
    console.log(`Converted: ${file} -> ${outputFile}`)
  }
}

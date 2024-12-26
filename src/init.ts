import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export function copyConfigFile(type: string): void {
    const files: Record<string, string> = {
        prettier: '../prettier.config.js',
        ts: '../tsconfig.json'
    }

    const file = files[type]

    if (!file) {
        console.error(`Invalid type: ${type}. Supported types are: prettier, ts`)
        return
    }

    const sourcePath = path.resolve(__dirname, file)
    const destinationPath = path.resolve(process.cwd(), file)

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`)
        return
    }

    // Copy the file
    try {
        fs.copyFileSync(sourcePath, destinationPath)
        console.log(`Copied ${file} to ${destinationPath}`)
    } catch (error) {
        console.error(`Failed to copy ${file}:`, error)
    }
}

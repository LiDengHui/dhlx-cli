import figlet from 'figlet'
import Printer from '@darkobits/lolcatjs'
import { readJson } from './utils/json.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 获取当前文件的 URL
const __filename = fileURLToPath(import.meta.url)

// 获取当前文件的目录路径
const __dirname = dirname(__filename)

const packageJson = readJson(path.join(__dirname, '../package.json'))

const versionStr = figlet.textSync('DHLX')

const input = [`${versionStr}`, packageJson.version]

export const transformed = Printer.fromString(input.join('\n'))

export const version = packageJson.version

import fs from 'fs'
import path from 'path'
export const readJson = (pathStr: string) => {
  const p = path.resolve(pathStr)
  const x = fs.readFileSync(p, 'utf8')
  return JSON.parse(x) as any
}

export const writeJson = (pathStr: string, data: any) => {
  const p = path.resolve(pathStr)
  const modifiedData = JSON.stringify(data, null, 2)
  fs.writeFileSync(p, modifiedData, 'utf8')
}

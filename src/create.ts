import color from './utils/color.js'
import inquirer from 'inquirer'
import resolver from '@dhlx/resolver'
import log from './utils/log.js'
import path from 'path'
import gitclone from 'git-clone/promise.js'
import ora from 'ora'
import fs from 'fs'
import _ from 'lodash'
import { readJson, writeJson } from './utils/json.js'
interface Template {
  url: string
}
const Dictionary: Record<string, Template> = {
  'vite-lib': {
    url: 'https://github.com/LiDengHui/format-size-units.git',
  },
  'ts-lib': {
    url: 'https://github.com/LiDengHui/resolver.git',
  },
}

interface CreateProjectConfig {
  template: string
  project: string
}

const getOptions = async (config: Partial<CreateProjectConfig>) => {
  const questions = []

  if (!config?.project) {
    questions.push({
      type: 'input',
      message: color('① 请输入文件夹名称'),
      name: 'project',
      default: 'my-project',
    })
  }

  if (!config?.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: color('② 请选择开发语言'),
      choices: ['vite-lib', 'ts-lib'],
    })
  }

  const answers = await inquirer.prompt(questions as any)

  return {
    ...config,
    ...answers,
  } as CreateProjectConfig
}

const downloadTemplate = async (config: CreateProjectConfig) => {
  const template = Dictionary[config.template]

  if (!template) {
    return Promise.reject(`${config.template} is not exists`)
  }

  const projectPath = path.resolve(process.cwd(), config.project)

  fs.mkdirSync(projectPath)
  log.info('文件夹创建成功！')

  const spinner = ora(color(`downloading template ${template.url}`))

  spinner.start()

  await gitclone(template.url, projectPath)

  spinner.stop()

  fs.rmSync(path.join(projectPath, './.git'), {
    recursive: true,
    force: true,
  })
  log.info('下载模板成功')
}

const writePackageJSON = async (config: CreateProjectConfig) => {
  const projectPath = path.resolve(process.cwd(), config.project)
  const packageJSONPath = path.join(projectPath, './package.json')

  const jsonData = await readJson(packageJSONPath)

  jsonData.name = `@dhlx/${config.project}`
  jsonData.version = '0.0.1'
  _.set(jsonData, 'repository.url', '')

  writeJson(packageJSONPath, jsonData)
}

export default async function createProject(
  config: Partial<CreateProjectConfig>
) {
  const [_, option] = await resolver(getOptions)(config)
  if (!option) return

  const [err] = await resolver(downloadTemplate)(option!)
  if (err) {
    log.error(err)
    return
  }
  await writePackageJSON(option!)
}

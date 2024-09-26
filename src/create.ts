import color from './utils/color.js'
import inquirer from 'inquirer'
import resolver from '@dhlx/resolver'
import log from './utils/log.js'
import path from 'path'
import download from 'download-git-repo'
import ora from 'ora'
import fs from 'fs'
import _ from 'lodash'
interface Template {
    url: string
}
const Dictionary: Record<string, Template> = {
    'vite-lib': {
        url: 'direct:https://github.com/LiDengHui/format-size-units.git',
    },
    'ts-lib': {
        url: 'direct:https://github.com/LiDengHui/resolver.git',
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
        log.error(`${config.template} is not exists`)
        return
    }

    const projectPath = path.resolve(process.cwd(), config.project)
    try {
        fs.mkdirSync(projectPath)
        console.log('文件夹创建成功！')
    } catch (err) {
        log.info('文件夹已经存在')
        return
    }
    const spinner = ora(color(`downloading template ${template.url}`))

    console.log(projectPath)
    spinner.start()
    return new Promise((resolve, reject) => {
        download(template.url, projectPath, { clone: true }, (err) => {
            spinner.stop()
            if (err) {
                log.error(`下载失败:${err}`)
                reject(err)
            } else {
                log.info('下载模板成功')
                resolve(void 0)
            }
        })
    })
}

const writePackageJSON = async (config: CreateProjectConfig) => {
    const projectPath = path.resolve(process.cwd(), config.project)
    const packageJSONPath = path.join(projectPath, './package.json')
    let jsonData
    try {
        const data = fs.readFileSync(packageJSONPath, 'utf8')
        jsonData = JSON.parse(data)
    } catch (parseError) {
        log.error('找不到 package.json', parseError)
        return
    }

    jsonData.name = `@dhlx/${config.project}`
    jsonData.version = '0.0.1'
    _.set(jsonData, 'repository.url', '')
    const modifiedData = JSON.stringify(jsonData, null, 4)
    try {
        fs.writeFileSync(packageJSONPath, modifiedData, 'utf8')
        log.info('修改package.json成功')
    } catch (e) {
        log.error('修改package.json失败')
    }
}

export default async function createProject(
    config: Partial<CreateProjectConfig>
) {
    const [_, option] = await resolver(getOptions)(config)
    if (!option) return
    console.log(option)

    await downloadTemplate(option!)

    await writePackageJSON(option!)
}

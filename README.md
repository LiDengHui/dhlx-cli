# dhlx-cli

## 一、简介

dhlx 命令行工具

## 二、安装

使用以下命令通过 NPM 安装：

```shell
npm install @dhlx/dhlx-cli
```

## 三、使用示例

```text
Usage: dhlx [options] [command]

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  create [template] [project]  创建项目
  process [options]            处理 Excel 文件
  compress [options]           Compress images
  image-size [options]         Change images size
  word-to-html [options]       Change word to html
  convert [options]            Convert image formats
  init <type>                  Copy a specific configuration file [prettier,tsconfig,jscpd,deploy,process] from the project to the current working directory
  deploy [options]             Compress specified directories and upload to server
  excel2json [options]         将 Excel 文件转换为 JSON 格式
  json2excel [options]         将  JSON 文件转换为 Excel 格式
  gh-pages [options]           部署git hub page 页面
  code-line [options]          统计代码行数
  help [command]               display help for command

```

## 四、参数

### create

* template: 创建项目类型 ["vite-lib", "ts-lib"]

* project: 创建项目名称



### 复制配置文件

```bash
dhlx init prettier // 代码格式化配置
dhlx init tsconfig // 代码ts配置
dhlx init deploy // 代码部署配置
dhlx init process // xlsx对比配置
```


### 批量将word转换成excel
```shell
dhlx word-to-html -i ./input -o ./output
```

### 部署github pages 页面， 将发布新的分支到 gh-pages分支

```shell
dhlx gh-pages -i dist
```
### 统计代码行数

```shell

dhlx code-line -e .report,node_modules,idea,.git,.github,.dist --detail
```
| 参数                  | 简写   | 类型         | 默认值                                            | 描述              |
|---------------------|------|------------|------------------------------------------------|-----------------|
| `--input`           | `-i` | `<path>`   | `./`                                           | 指定要扫描的目录        |
| `--excludes`        | `-e` | `<string>` | `node_modules,.git,dist,build`                 | 要排除的目录，使用逗号分隔   |
| `--extensions`      | `-t` | `<string>` | `.js,.ts,.jsx,.tsx,.vue,.html,.css,.scss,.mjs` | 要统计的文件扩展名，逗号分隔  |
| `--detail`          | `-d` | `flag`     | -                                              | 输出详细的配置信息（用于调试） |
| `--no-empty-line`   | -    | `flag`     | -                                              | 排除空行统计          |
| `--no-comment-line` | -    | `flag`     | -                                              | 排除注释行统计         |


### [图片格式转换与压缩](./README_IMAGE.md)
### [deploy命令-文件ssh上传](./README_DEPLOY.md) 
### [process命令-excel数据处理](./README_PROCESS.md)
### [excel与json-相互转换](./README_EXCEL_JSON.md)


## 五、贡献

如果您发现任何问题或有改进的建议，欢迎提交 issue 或 pull request。

## 六、许可证

本项目遵循 [MIT License](./LICENSE)。

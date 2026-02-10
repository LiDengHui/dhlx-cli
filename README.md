# dhlx-cli

## 一、简介

dhlx 命令行工具，提供项目创建、文件处理、部署管理、微应用发布等功能。

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
  pdf2html [options]           Change pdf to html
  convert [options]            Convert image formats
  init <type>                  Copy a specific configuration file [prettier,tsconfig,jscpd,deploy,process] from the project to the current working directory
  deploy [options]             Compress specified directories and upload to server
  excel2json [options]         将 Excel 文件转换为 JSON 格式
  json2excel [options]         将 JSON 文件转换为 Excel 格式
  gh-pages [options]           部署git hub page 页面
  code-line [options]          统计代码行数
  code-map [options]           生成代码依赖图
  config [options]             配置管理
  login [options]              登录 nest-serve 后台
  logout                       退出登录
  status                       查看登录状态
  micro [options]              微应用管理
  help [command]               display help for command
```

## 四、核心功能

### 4.1 配置管理

dhlx-cli 支持全局配置管理，可以设置默认的服务器地址等配置项。

```bash
# 设置默认服务器地址
dhlx config set source http://localhost:9000

# 查看所有配置
dhlx config list

# 获取特定配置项
dhlx config get source

# 删除配置项
dhlx config delete source

# 清空所有配置
dhlx config clear
```

配置文件位置：`~/.dhlxrc`

### 4.2 认证管理

支持登录 nest-serve 后台系统，自动使用配置中的服务器地址。

```bash
# 登录（使用配置的服务器地址）
dhlx login -u admin -p 123456

# 登录（指定服务器地址）
dhlx login -u admin -p 123456 -s http://localhost:9000

# 查看登录状态
dhlx status

# 退出登录
dhlx logout
```

### 4.3 微应用管理

支持微应用的发布和配置验证。

```bash
# 发布微应用（使用配置的服务器地址）
dhlx micro publish

# 发布微应用（指定服务器地址）
dhlx micro publish -s http://localhost:9000

# 发布微应用（指定dist目录）
dhlx micro publish -d ./dist

# 验证微应用配置
dhlx micro validate -d ./dist
```

### 4.4 项目创建

```bash
# 创建项目
dhlx create vite-lib my-project
dhlx create ts-lib my-library
```

### 4.5 复制配置文件

```bash
dhlx init prettier // 代码格式化配置
dhlx init tsconfig // 代码ts配置
dhlx init deploy   // 代码部署配置
dhlx init process  // xlsx对比配置
```

### 4.6 文件格式转换

```bash
# 批量将word转换成html
dhlx word-to-html -i ./input -o ./output

# 批量将pdf转换成html
brew install poppler
dhlx pdf2html -i ./input -o ./output

# 图片格式转换
dhlx convert -i ./input -o ./output -f webp

# 图片压缩
dhlx compress -i ./input -o ./output -q 80

# 图片尺寸调整
dhlx image-size -i ./input -o ./output -w 800 -h 600
```

### 4.7 部署功能

```bash
# 部署github pages页面
dhlx gh-pages -i dist

# SSH部署
dhlx deploy -h example.com -u username -p password -r /var/www
```

### 4.8 代码统计

```bash
# 统计代码行数
dhlx code-line -e .report,node_modules,idea,.git,.github,.dist --detail

# 生成代码依赖图
dhlx code-map -i ./src -t g6 -d 2
```

| 参数                  | 简写   | 类型         | 默认值                                            | 描述              |
|---------------------|------|------------|------------------------------------------------|-----------------|
| `--input`           | `-i` | `<path>`   | `./`                                           | 指定要扫描的目录        |
| `--excludes`        | `-e` | `<string>` | `node_modules,.git,dist,build`                 | 要排除的目录，使用逗号分隔   |
| `--extensions`      | `-t` | `<string>` | `.js,.ts,.jsx,.tsx,.vue,.html,.css,.scss,.mjs` | 要统计的文件扩展名，逗号分隔  |
| `--detail`          | `-d` | `flag`     | -                                              | 输出详细的配置信息（用于调试） |
| `--no-empty-line`   | -    | `flag`     | -                                              | 排除空行统计          |
| `--no-comment-line` | -    | `flag`     | -                                              | 排除注释行统计         |

### 4.9 Excel处理

```bash
# Excel转JSON
dhlx excel2json -i input.xlsx -o output.json

# JSON转Excel
dhlx json2excel -i input.json -o output.xlsx

# Excel数据处理
dhlx process -i input.xlsx -o output.xlsx -b "2025/6/1" -t "2025/5/1"
```

## 五、详细文档

### [图片格式转换与压缩](./README_IMAGE.md)
### [deploy命令-文件ssh上传](./README_DEPLOY.md) 
### [process命令-excel数据处理](./README_PROCESS.md)
### [excel与json-相互转换](./README_EXCEL_JSON.md)

## 开发者文档

- **架构说明**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **最佳实践**: [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- **重构说明**: [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)

## 六、配置说明

### 6.1 配置文件位置

- 全局配置和登录凭证：`~/.dhlxrc`（统一管理）
- 项目配置：`./deployConfig.json`（部署相关）

### 6.2 支持的配置项

| 配置项 | 描述 | 示例 |
|--------|------|------|
| `source` | 默认服务器地址 | `http://localhost:9000` |
| `username` | 默认用户名 | `admin` |

### 6.3 配置优先级

1. 命令行参数（最高优先级）
2. 配置文件中的设置
3. 默认值（最低优先级）

## 七、常见问题

### 7.1 登录失败

确保：
- 服务器地址正确
- 用户名和密码正确
- 服务器正在运行

### 7.2 微应用发布失败

检查：
- 是否已登录
- dist目录是否存在
- micro.config.json 配置是否正确

### 7.3 配置文件问题

如果配置文件损坏，可以：
```bash
dhlx config clear  # 清空配置
dhlx config set source http://your-server  # 重新设置
```

## 八、贡献

如果您发现任何问题或有改进的建议，欢迎提交 issue 或 pull request。

## 九、许可证

本项目遵循 [MIT License](./LICENSE)。

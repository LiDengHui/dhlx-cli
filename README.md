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
  compress [options]           Compress images
  convert [options]            Convert image formats
  init <type>                  Copy a specific configuration file (prettier or tsconfig) from the project to the current working directory
  help [command]               display help for command
```

## 四、参数

### create

* template: 创建项目类型 ["vite-lib", "ts-lib"]

* project: 创建项目名称

### 压缩图片

通过 `compress` 命令压缩图片。

#### 使用语法

```bash
dhlx compress -i <输入路径> -o <输出路径> -q <质量>
```

#### 参数说明

- `-i, --input <路径>`：输入文件或目录路径（必填）。
- `-o, --output <路径>`：输出目录路径（默认值：`./output`）。
- `-q, --quality <数值>`：图片质量，范围为 1-100（默认值：80）。

#### 示例

1. 压缩单张图片：

```bash
dhlx compress -i ./image.jpg -o ./compressed -q 75
```

2. 批量压缩目录中的图片：

```bash
dhlx compress -i ./images -o ./compressed
```

### 转换图片格式

通过 `convert` 命令将图片格式转换为 JPG、PNG 或 WebP。

#### 使用语法

```bash
dhlx convert -i <输入路径> -o <输出路径> -f <格式>
```

#### 参数说明

- `-i, --input <路径>`：输入文件或目录路径（必填）。
- `-o, --output <路径>`：输出目录路径（默认值：`./output`）。
- `-f, --format <格式>`：目标图片格式，支持 `jpg`、`png`、`webp`（默认值：`jpg`）。

#### 示例

1. 将单张图片转换为 WebP 格式：

```bash
dhlx convert -i ./image.jpg -o ./converted -f webp
```

2. 批量转换目录中的图片为 PNG 格式：

```bash
dhlx convert -i ./images -o ./converted -f png
```

### 复制配置文件

1. prettier

```bash
dhlx init prettier
```

2. tsconfig

```bash
dhlx init tsconfig
```

### 用于压缩指定目录并上传到服务器

```shell
  dhlx deploy -m dev
```

---

#### **Options:**

| 选项               | 参数           | 说明               | 默认值                   |
|------------------|--------------|------------------|-----------------------|
| `-c, --config`   | `<file>`     | 指定配置文件路径         | `./deployConfig.json` |
| `-m, --mode`     | `<mode>`     | 从配置文件中选择部署模式     | -                     |
| `-s, --source`   | `<dir>`      | 逗号分隔的目录列表，需要打包上传 | -                     |
| `-z, --zip`      | `<filename>` | 生成的 zip 文件名称     | `archive.zip`         |
| `-h, --host`     | `<host>`     | 目标服务器的 SSH 地址    | -                     |
| `-u, --user`     | `<user>`     | SSH 登录用户名        | -                     |
| `-p, --password` | `<password>` | SSH 登录密码         | -                     |
| `-r, --remote`   | `<path>`     | 服务器上的上传目录路径      | `/var/www/uploads`    |
| `-e, --extract`  | `<path>`     | 服务器上解压缩目录路径      | `/var/www/static`     |
| `--help`         | 无            | 显示帮助信息           | -                     |

---

#### **示例用法**

##### **1. 使用默认配置文件进行部署**

```sh
dhlx deploy -s dist,public -h example.com -u admin -p password
```

此命令会：

1. 将 `dist` 和 `public` 目录压缩为 `archive.zip`
2. 上传到 `example.com` 服务器的 `/var/www/uploads`
3. 在 `/var/www/static` 目录下解压

---

#### **2. 指定配置文件**

```sh
dhlx deploy -c ./customConfig.json -m production
```

此命令使用 `customConfig.json` 进行部署，并选择 `production` 模式。

---

#### **3. 自定义压缩包名称**

```sh
dhlx deploy -s build -z myapp.zip -h 192.168.1.100 -u root -p secret
```

此命令会：

1. 将 `build` 目录打包为 `myapp.zip`
2. 上传到 `192.168.1.100` 的 `/var/www/uploads`
3. 在 `/var/www/static` 解压

## 五、贡献

如果您发现任何问题或有改进的建议，欢迎提交 issue 或 pull request。

## 六、许可证

本项目遵循 [MIT License](./LICENSE)。

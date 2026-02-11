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

3. 批量图片size

```shell
dhlx image-size -i ./images -o ./converted -w 500 -h 600
```

## 命令介绍

### `excel2json` - Excel 转 JSON

```bash
dhlx excel2json [选项]
```

#### 功能

将 Excel 文件转换为 JSON 格式数据，支持输出到文件或直接打印到控制台。

#### 选项

| 选项                  | 说明                                                                |
| --------------------- | ------------------------------------------------------------------- |
| `-c, --config <path>` | 指定配置文件路径（默认 `excel2json.js`），可覆盖默认数据处理规则    |
| `-i, --input <path>`  | **必填** Excel 输入文件路径，支持 `.xlsx/.xls`（默认 `input.xlsx`） |
| `-o, --output <path>` | 输出 JSON 文件路径，未提供时直接打印 JSON 到控制台                  |
| `-s, --sheet <name>`  | 指定 sheet 名称，不填时默认第一个 sheet                             |

#### 示例

```bash
# 从 input.xlsx 转换并打印 JSON
dhlx excel2json -i input.xlsx

# 指定 sheet 并输出到文件
dhlx excel2json -i data.xlsx -o result.json -s "Sheet2"

# 使用自定义配置文件处理
dhlx excel2json -i input.xlsx -c myconfig.js
```

---

### `json2excel` - JSON 转 Excel

```bash
dhlx json2excel [选项]
```

#### 功能

将 JSON/JS 数据转换为 Excel 文件，支持从文件、JS 模块或直接传参读取数据。

#### 选项

| 选项                  | 说明                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `-c, --config <path>` | 指定配置文件路径（默认 `excel2json.js`），可覆盖默认数据映射规则 |
| `-i, --input <path>`  | 输入来源（JSON 文件路径 `.json` 或 JS 文件路径 `.js`）           |
| `-d, --data <json>`   | **直接传入 JSON 字符串**（优先级高于 `-i`）                      |
| `-o, --output <path>` | 输出 Excel 文件路径（默认 `output.xlsx`）                        |
| `-s, --sheet <name>`  | 指定 sheet 名称（默认 `Sheet1`）                                 |

#### 示例

```bash
# 从 JSON 文件转换
dhlx json2excel -i data.json -o output.xlsx

# 直接传入 JSON 字符串
dhlx json2excel --data '[{"id":1,"name":"测试"}]' -o result.xlsx

# 从 JS 模块导出数据（需 export default）
dhlx json2excel -i dataset.js -s "数据表"

# 使用自定义配置文件
dhlx json2excel -c customconfig.js -o custom.xlsx
```

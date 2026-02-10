# DHLX CLI - 代码优化最佳实践指南

## 📚 目录

1. [架构概述](#架构概述)
2. [代码组织规范](#代码组织规范)
3. [命令开发指南](#命令开发指南)
4. [错误处理](#错误处理)
5. [测试策略](#测试策略)
6. [性能优化](#性能优化)
7. [安全考虑](#安全考虑)

---

## 架构概述

### 分层架构

```
CLI Interface (用户)
        ↓
    Commands       ← 命令定义、参数解析
    ├── project/
    ├── image/
    ├── document/
    ├── util/
    ├── deploy/
    ├── config/
    └── auth/
        ↓
    Handlers        ← 业务逻辑处理 (预留扩展)
        ↓
    Core            ← 通用功能模块 (预留扩展)
        ↓
    Utils           ← 工具函数、常用库
    ├── auth.ts
    ├── color.ts
    ├── excel.ts
    ├── json.ts
    ├── log.ts
    ├── micro.ts
    └── normalize-url.ts
        ↓
    Types           ← 类型定义
```

    > 参考：项目架构说明 [ARCHITECTURE.md](./ARCHITECTURE.md)

### 关键特点

- ✅ **清晰的分层**：职责分明，易于维护
- ✅ **模块化设计**：各类命令独立管理
- ✅ **统一注册**：`register.ts` 集中管理
- ✅ **简洁入口**：`index.ts` 优雅简洁
- ✅ **可扩展性**：易于添加新命令或新分类

---

## 代码组织规范

### 1. 命令文件结构

每个命令分类下的 `index.ts` 应该遵循以下结构：

```typescript
// src/commands/[category]/index.ts

import { Command } from 'commander';
import { businessLogicFunction } from '../../[handler-or-logic-file].js';

/**
 * 注册该分类的所有命令
 * @param program - Commander 程序实例
 */
export function register[Category]Commands(program: Command): void {
    // 命令1
    program
        .command('[name]')
        .description('[description]')
        .option('[options]')
        .action(async (args, options) => {
            await businessLogicFunction(options);
        });

    // 命令2
    program
        .command('[name2]')
        // ...
}
```

**规范要点：**
- 导出函数名必须是 `register[Category]Commands`
- 优先使用异步操作 (`async/await`)
- 业务逻辑应该分离到对应的处理文件
- 添加 JSDoc 注释说明函数职责

### 2. 命令分类规则

| 分类 | 职责 | 包含命令 |
|------|------|---------|
| `project/` | 项目创建和初始化 | create, init |
| `image/` | 图片处理 | compress, convert, image-size |
| `document/` | 文档转换 | word-to-html, pdf2html, excel2json, json2excel, process |
| `util/` | 开发工具 | code-line, code-map, gh-pages |
| `deploy/` | 部署和发布 | deploy, micro publish, micro validate |
| `config/` | 配置管理 | config set/get/list/delete/clear |
| `auth/` | 身份认证 | login, logout, status |

**添加新分类时：**
- 确保有明确的功能主题
- 预期至少包含 2 个以上相关命令
- 在 `register.ts` 中添加注册代码

### 3. 文件命名规范

```
src/
├── commands/
│   ├── [category]/
│   │   └── index.ts              # 命令注册文件（导出 register[Category]Commands）
│   │
│   └── [category-with-many-cmds]/
│       ├── index.ts              # 主命令注册
│       ├── [sub-command-1].ts    # 子命令1 (可选，如果很复杂)
│       └── [sub-command-2].ts    # 子命令2 (可选，如果很复杂)
│
├── handlers/                      # 业务逻辑处理层
│   ├── [domain]/
│   │   ├── [entity].ts
│   │   └── [service].ts
│
├── core/                          # 核心功能模块
│   ├── [domain]/
│   │   ├── processor.ts
│   │   └── validator.ts
│
├── utils/                         # 工具函数
├── types/                         # 类型定义
└── [feature].ts                   # 具体业务实现
```

---

## 命令开发指南

### 创建新命令的步骤

#### 步骤 1: 确定命令分类

```typescript
// 例：添加 "dhlx image thumbnail" 命令

// 该命令属于 image 分类 → 放在 commands/image/index.ts
```

#### 步骤 2: 在对应分类中添加命令定义

```typescript
// src/commands/image/index.ts

export function registerImageCommands(program: Command): void {
    // 现有命令...

    // 新命令：生成缩略图
    program
        .command('thumbnail')
        .description('生成图片缩略图')
        .option('-i, --input <path>', '输入图片目录', './')
        .option('-o, --output <path>', '输出目录', './output')
        .option('-s, --size <string>', '缩略图尺寸 (WxH)', '200x200')
        .option('-q, --quality <number>', '质量（1-100）', '80')
        .action(async (options) => {
            // 调用业务逻辑
            await generateThumbnail({
                input: options.input,
                output: options.output,
                size: options.size,
                quality: parseInt(options.quality),
            });
        });
}
```

#### 步骤 3: 实现业务逻辑

```typescript
// src/thumbnail.ts

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import log from './utils/log.js';

interface ThumbnailOptions {
    input: string;
    output: string;
    size: string;
    quality: number;
}

/**
 * 生成缩略图
 * @param options - 缩略图生成选项
 */
export async function generateThumbnail(options: ThumbnailOptions): Promise<void> {
    const { input, output, size, quality } = options;
    
    // 解析尺寸
    const [width, height] = size.split('x').map(Number);
    
    if (!width || !height) {
        log.error('无效的尺寸格式，请使用 WxH 格式（如 200x200）');
        return;
    }

    // 创建输出目录
    fs.mkdirSync(output, { recursive: true });

    // 读取输入目录
    const files = fs.readdirSync(input);

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

        const inputPath = path.join(input, file);
        const outputName = `thumbnail_${file}`;
        const outputPath = path.join(output, outputName);

        try {
            await sharp(inputPath)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center',
                })
                .jpeg({ quality, progressive: true })
                .toFile(outputPath);
            
            log.success(`✓ 已生成: ${outputName}`);
        } catch (error) {
            log.error(`✗ 生成失败: ${file} - ${error}`);
        }
    }

    log.success(`\n所有缩略图已保存到: ${output}`);
}
```

#### 步骤 4: 编译和测试

```bash
# 编译
npm run build

# 测试新命令
npx dhlx image thumbnail -i ./test-images -o ./thumbs -s 150x150
```

### 命令选项最佳实践

**好的做法：**
```typescript
program
    .command('compress')
    .description('压缩图片')
    .option('-i, --input <path>', '输入路径（必需）')
    .option('-o, --output <path>', '输出路径', './output')
    .option('-q, --quality <number>', '质量（1-100）', '80')
    .option('-f, --force', '强制覆盖现有文件')
    .action(async (options) => {
        // 实现逻辑
    });
```

**避免的做法：**
```typescript
// ❌ 参数描述不清楚
.option('-q <number>', 'quality')

// ❌ 没有默认值
.option('-o, --output <path>')

// ❌ 短选项冲突
.command('c')  // 与 compress 冲突
```

---

## 错误处理

### 统一的错误处理模式

```typescript
// src/handlers/error-handler.ts

export class AppError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function handleError(error: unknown): void {
    if (error instanceof AppError) {
        log.error(`[${error.code}] ${error.message}`);
        if (error.details) {
            console.error(error.details);
        }
    } else if (error instanceof Error) {
        log.error(`错误: ${error.message}`);
    } else {
        log.error('未知错误发生');
    }
    process.exit(1);
}
```

### 使用示例

```typescript
export async function compressImages(options: CompressOptions): Promise<void> {
    try {
        if (!options.input) {
            throw new AppError(
                'INVALID_INPUT',
                '缺少必需的输入路径',
                { option: '--input' }
            );
        }

        // 业务逻辑...

    } catch (error) {
        handleError(error);
    }
}
```

---

## 测试策略

### 单元测试示例

```typescript
// __tests__/commands/image/compress.test.ts

import { test } from 'ava';
import { compressImages } from '../../../src/compress.js';
import fs from 'fs';
import path from 'path';

test('压缩图片', async (t) => {
    const inputDir = path.join(__dirname, 'fixtures');
    const outputDir = path.join(__dirname, 'output');

    await compressImages({
        input: inputDir,
        output: outputDir,
        quality: 80,
    });

    const files = fs.readdirSync(outputDir);
    t.assert(files.length > 0);
});

test('处理无效输入', async (t) => {
    const error = await t.throwsAsync(
        () => compressImages({
            input: '/non/existent/path',
            output: './output',
        })
    );

    t.is(error.name, 'AppError');
});
```

### 命令集成测试

```bash
# 测试单个命令
npx dhlx compress -i ./test-images -o ./output

# 测试所有图片命令
npx dhlx image --help
npx dhlx compress --help
npx dhlx convert --help
```

---

## 性能优化

### 1. 异步处理优化

```typescript
// ❌ 不好：顺序处理，串行执行
for (const file of files) {
    await processFile(file);  // 等待每个文件处理完成
}

// ✅ 好：并行处理，提高效率
await Promise.all(
    files.map(file => processFile(file))
);

// ✅ 更好：控制并发数量
const limit = 5;
const chunks = chunk(files, limit);
for (const batch of chunks) {
    await Promise.all(batch.map(file => processFile(file)));
}
```

### 2. 内存优化

```typescript
// ❌ 不好：一次性加载所有文件到内存
const allFiles = fs.readdirSync(largeDir);
const processed = await Promise.all(
    allFiles.map(processFile)  // 可能导致内存溢出
);

// ✅ 好：分批处理，流式处理
const batchSize = 100;
for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    await Promise.all(batch.map(processFile));
}
```

### 3. 缓存利用

```typescript
// 为 Excel 处理添加缓存
const cache = new Map<string, any>();

function readExcelCached(path: string) {
    if (cache.has(path)) {
        return cache.get(path);
    }
    
    const data = readExcel(path);
    cache.set(path, data);
    return data;
}
```

---

## 安全考虑

### 1. 路径安全

```typescript
import path from 'path';

// ❌ 不安全：可能导致目录遍历
const filePath = `./user-files/${userInput}`;

// ✅ 安全：规范化路径，阻止目录遍历
function safeResolvePath(basePath: string, userPath: string): string {
    const resolved = path.resolve(basePath, userPath);
    const base = path.resolve(basePath);
    
    // 确保 resolved 在 base 目录内
    if (!resolved.startsWith(base)) {
        throw new Error('非法的路径');
    }
    
    return resolved;
}

const filePath = safeResolvePath('./user-files', userInput);
```

### 2. 命令注入防护

```typescript
// ❌ 不安全：直接使用用户输入执行命令
const { exec } = require('child_process');
exec(`convert ${userInput}.jpg output.jpg`);

// ✅ 安全：使用 execFile 或参数化
const { execFile } = require('child_process');
execFile('convert', [`${userInput}.jpg`, 'output.jpg']);
```

### 3. 敏感信息保护

```typescript
// ❌ 不好：打印敏感信息
console.log('密码:', password);

// ✅ 好：隐藏敏感信息
if (key === 'password' || key === 'token') {
    console.log(`${key}: [已隐藏]`);
} else {
    console.log(`${key}: ${value}`);
}
```

### 4. 输入验证

```typescript
// 创建验证工具
export function validateFilePath(filePath: string): boolean {
    // 检查路径是否以正确的扩展名结尾
    const validExtensions = ['.jpg', '.png', '.gif'];
    return validExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
}

export function validateQuality(quality: any): number {
    const num = parseInt(quality);
    if (isNaN(num) || num < 1 || num > 100) {
        throw new Error('质量必须在 1-100 之间');
    }
    return num;
}

// 使用
try {
    if (!validateFilePath(options.input)) {
        throw new Error('无效的文件格式');
    }
    const quality = validateQuality(options.quality);
} catch (error) {
    log.error(error.message);
    process.exit(1);
}
```

---

## 常见问题 (FAQ)

### Q1: 如何添加新的命令分类？

**A:** 按以下步骤：
1. 创建 `src/commands/[new-category]/index.ts`
2. 实现 `register[NewCategory]Commands(program: Command)` 导出函数
3. 在 `src/register.ts` 中添加导入和注册代码

### Q2: 如何修改现有命令的选项？

**A:** 直接编辑对应命令分类的 `index.ts` 文件，然后重新编译。

### Q3: 如何测试新命令？

**A:** 
```bash
npm run build
npx dhlx [command] --help
npx dhlx [command] [options]
```

### Q4: handlers 层何时需要实现？

**A:** 当业务逻辑变得复杂时：
- 多个命令共享相同的逻辑
- 业务逻辑需要独立测试
- 需要清晰分离命令定义和业务逻辑

### Q5: 如何处理命令间的依赖关系？

**A:** 在 `handlers` 层处理，通过服务或工厂模式管理依赖。

---

## 总结与建议

### 现状总结

✅ 架构已完全重构，结构清晰
✅ 命令系统按功能分类管理
✅ 入口文件已简化到极致
✅ 编译通过无误

### 后续建议

1. **立即实施** (高优先级)
   - 按照本指南规范编写新命令
   - 定期检查代码组织是否符合规范

2. **近期实施** (中优先级)
   - 提取 handlers 层
   - 添加单元测试
   - 增强错误处理

3. **可选实施** (低优先级)
   - 建立 core 模块
   - 优化性能指标
   - 扩展文档

---

**文档版本**: 1.0  
**最后更新**: 2026 年 2 月 10 日  
**维护者**: [架构优化团队]

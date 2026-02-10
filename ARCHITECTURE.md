# Project Architecture

This document describes the reorganized structure of the CLI project and how to add or modify commands.

Overview
- `src/commands/`: Command registration only — each file declares CLI flags and calls into handlers.
- `src/handlers/`: Implementation layer — pure functions that perform work (image, document, project, deploy, util, auth).
- `src/utils/`: Small helpers shared across handlers (excel, auth, logging, etc.).
- `bin/index.js`: CLI entrypoint that loads `src/register.ts` and starts Commander.

Guidelines
- Keep `src/commands/*` focused on argument parsing and wiring only.
- Implement business logic in `src/handlers/*` and export from each handler's `index.ts`.
- Re-export types as `export type { ... } from './module'` when needed by commands to keep `isolatedModules` happy.
- When adding a new command:
  1. Add `src/handlers/<area>/yourAction.ts` and export it from `src/handlers/<area>/index.ts`.
  2. Add `src/commands/<area>/index.ts` to register flags and wire to the handler function.
  3. Update `src/register.ts` to include the new registrar.

Build & Test
- Build: `npm run build` (TypeScript compiler)
- Quick smoke: `node ./bin/index.js --help` and `node ./bin/index.js <command> --help`

Why this layout
- Separates CLI concerns (parsing) from implementation (handlers), improving testability and maintainability.

Notes
- Many legacy root-level files were moved into `src/handlers/`; the root `src/` now contains only orchestration and small helpers.
# DHLX CLI - 架构优化说明

## 📚 概述

本文档记录了 dhlx-cli 项目的从 0.3.12 版本开始的架构优化工作。主要目标是提高代码组织结构的清晰度、提升代码可维护性和可扩展性。

## 🔄 优化前后对比

### 优化前的问题

```
src/
├── create.ts              ❌ 直接在顶层堆砌
├── compress.ts            ❌ 命令和逻辑混淆在一起
├── convert.ts             ❌ 缺乏分类管理
├── config.ts              ❌ 功能分组不清晰
├── excel2json.ts
├── json2excel.ts
├── wordToHtml.ts
├── pdfToHtml.ts
├── codeLine.ts
├── codeMap.ts
├── micro.ts
├── uploadService.ts
├── login.ts
├── imageSize.ts
└── index.ts (374 行)      ❌ 代码冗长，全是命令注册
```

**主要问题：**
1. 📍 所有命令处理文件平铺在 src 目录
2. 🔀 功能类别混乱，相关功能散落各处
3. 📝 入口文件 (index.ts) 包含 374 行代码，全是重复的命令注册
4. ❌ 缺乏清晰的分层架构 (commands/handlers/core)
5. 🔗 代码依赖关系不明确
6. 🛠️ 维护和扩展新功能困难

### 优化后的架构

```
src/
├── commands/                    # 命令层 (命令定义和选项处理)
│   ├── project/                 # 项目管理相关命令
│   │   └── index.ts            # create, init
│   ├── image/                   # 图片处理相关命令
│   │   └── index.ts            # compress, convert, imageSize
│   ├── document/                # 文档转换相关命令
│   │   └── index.ts            # wordToHtml, pdfToHtml, excel2json, json2excel, process
│   ├── util/                    # 工具类命令
│   │   └── index.ts            # codeLine, codeMap, ghPages
│   ├── deploy/                  # 部署相关命令
│   │   └── index.ts            # deploy, micro publish/validate
│   ├── config/                  # 配置管理命令
│   │   └── index.ts            # config set/get/list/delete/clear
│   └── auth/                    # 认证相关命令
│       └── index.ts            # login, logout, status
│
├── handlers/                    # 业务处理层 (核心业务逻辑) - 预留位置
│
├── core/                        # 核心功能模块 - 预留位置
│
├── utils/                       # 工具函数 (保留现有)
│   ├── auth.ts
│   ├── color.ts
│   ├── excel.ts
│   ├── json.ts
│   ├── log.ts
│   ├── micro.ts
│   └── normalize-url.ts
│
├── types/                       # 类型定义 (保留现有)
│   └── function.ts
│
├── create.ts                    # 原有功能文件 (保留)
├── compress.ts                  # 原有功能文件 (保留)
├── convert.ts                   # 原有功能文件 (保留)
├── ... (其他功能文件)
│
├── register.ts                  ✨ 新增: 命令注册器
├── index.ts                     ✨ 大幅简化 (从 374 行 → ~20 行)
├── config.ts                    # 配置管理 (保留)
└── version.ts                   # 版本信息 (保留)
```

## 🎯 改进点详解

### 1. 命令分类化 (Commands Layer)

**目标**：按功能域收集相关命令

```typescript
// 新的结构
commands/
  ├── project/     → 创建、初始化项目
  ├── image/       → 图片压缩、转换、调整大小
  ├── document/    → 文档转换（Word、PDF、Excel、JSON）
  ├── util/        → 代码分析工具
  ├── deploy/      → 部署和发布
  ├── config/      → 配置管理
  └── auth/        → 身份认证
```

**优势**：
- 新增命令时，直接在对应的分类目录中添加
- 相关命令的选项和处理逻辑集中在一起
- 易于理解命令的功能分组

### 2. 命令注册系统 (register.ts)

**核心构件**：
```typescript
// src/register.ts
export async function registerAllCommands(program: Command): void {
    const { registerProjectCommands } = await import('./commands/project/index.js');
    registerProjectCommands(program);
    
    const { registerImageCommands } = await import('./commands/image/index.js');
    registerImageCommands(program);
    
    // ... 其他命令分类
}
```

**优势**：
- 统一的命令注册入口
- 易于查看有哪些命令分类
- 可以轻松启用/禁用某个命令分类
- 为未来的命令组织扩展提供基础

### 3. 简化入口文件 (index.ts)

**优化前**：374 行，全是命令注册代码
```typescript
// 优化前 (现在已删除，保留作示例)
program.command('compress')...
program.command('convert')...
program.command('image-size')...
// ... 重复的模式 30+ 次
program.parse(process.argv);
```

**优化后**：~20 行
```typescript
// src/index.ts (新)
import { transformed, version } from './version.js';
import { program } from 'commander';
import { registerAllCommands } from './register.js';

console.info(transformed);
program.version(version);

async function bootstrap() {
    await registerAllCommands(program);
    program.parse(process.argv);
}

bootstrap().catch((error) => {
    console.error('Failed to bootstrap CLI:', error);
    process.exit(1);
});
```

**改进**：
- 代码行数减少 95%
- 逻辑清晰，易于理解
- 便于添加初始化逻辑（日志、配置等）

### 4. 单一职责原则 (SRP)

各层功能划分：

| 层级 | 职责 | 示例 |
|------|------|------|
| **Commands** | 命令注册、选项解析 | `program.command('compress').option(...)` |
| **Handlers** | 业务逻辑处理 | `compressImages()`, `deployAction()` |
| **Core** | 通用功能模块 | 图片处理核心、文件操作封装 |
| **Utils** | 工具函数 | 日志、认证、Excel 读写 |
| **Types** | 类型定义 | 接口、类型别名 |

## 📊 代码量对比

| 指标 | 优化前 | 优化后 | 变化 |
|------|------|------|------|
| index.ts 行数 | 374 | ~20 | ⬇️ 95% |
| 命令注册重复代码 | 大量 | 0 | ⬇️ 100% |
| 命令分类文件 | 0 | 7 | ⬆️ 新增 |
| 项目结构清晰度 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⬆️ |
| 维护难度 | 高 | 低 | ⬇️ |

## 🚀 如何添加新命令

### 场景 1: 添加新命令到现有分类

以添加图片命令 `thumbnail` 为例：

```typescript
// src/commands/image/index.ts - 添加以下代码

program
    .command('thumbnail')
    .description('生成图片缩略图')
    .option('-i, --input <path>', '输入图片路径')
    .option('-o, --output <path>', '输出路径', './output')
    .option('-s, --size <string>', '缩略图大小', '200x200')
    .action(async (options) => {
        await generateThumbnail(options);
    });

// 在 src/thumbnail.ts 或相关处理文件中实现 generateThumbnail()
```

### 场景 2: 添加新的命令分类

以添加视频处理为例：

```bash
# 1. 创建目录
mkdir -p src/commands/video

# 2. 创建 src/commands/video/index.ts
# 3. 在 src/register.ts 中注册
```

```typescript
// src/register.ts - 添加新的分类
export async function registerAllCommands(program: Command): Promise<void> {
    // ... 现有的分类
    
    const { registerVideoCommands } = await import('./commands/video/index.js');
    registerVideoCommands(program);
}
```

## 🔧 编译和测试

```bash
# 编译
npm run build

# 查看编译结果
dist/index.js        # 编译后的入口文件
dist/commands/       # 编译后的命令目录
dist/register.ts     # 编译后的注册器

# 测试命令
npx dhlx --help      # 查看所有命令
npx dhlx compress    # 执行压缩命令
```

## 📝 后续优化建议

### 1. 提取 handlers 层（推荐）
当前业务逻辑还在原有文件中，可以逐步提取到 `handlers/` 目录：

```typescript
handlers/
├── image/
│   ├── compress.ts    # compressImages() 的纯业务逻辑
│   ├── convert.ts
│   └── resize.ts
├── document/
│   ├── excel.ts
│   └── word.ts
└── deploy/
    └── upload.ts
```

### 2. 建立 core 模块（推荐）
提取通用的功能模块：

```typescript
core/
├── image/
│   ├── processor.ts   # 图片处理核心
│   └── validator.ts   # 图片验证逻辑
├── file/
│   ├── archiver.ts    # 压缩文件逻辑
│   └── uploader.ts    # 上传逻辑
└── excel/
    └── transformer.ts # Excel 转换逻辑
```

### 3. 配置文件管理（推荐）
集中管理默认配置：

```typescript
config/
├── defaults.ts        # 默认配置
├── schema.ts          # 配置 schema 验证
└── loader.ts          # 配置加载器
```

### 4. 错误处理标准化
建立统一的错误处理机制：

```typescript
errors/
├── AppError.ts        # 基础错误类
├── ValidationError.ts
└── handler.ts         # 全局错误处理
```

### 5. 日志系统增强
已有 `utils/log.ts`，可以标准化日志使用

### 6. 测试覆盖
为各个命令和处理函数添加单元测试：

```
__tests__/
├── commands/
├── handlers/
└── utils/
```

## ✅ 迁移检查清单

- [x] 创建新目录结构
- [x] 将命令处理分组到 `commands/` 目录
- [x] 创建 `register.ts` 命令注册器
- [x] 简化 `index.ts` 入口文件
- [ ] 验证编译成功 (下一步)
- [ ] 验证所有命令正常运行
- [ ] 更新 README 和文档
- [ ] 后续按需实施 handlers 层提取

## 📞 相关文件

- [src/index.ts](../index.ts) - 新的入口文件
- [src/register.ts](../register.ts) - 命令注册器
- [src/commands/](../commands/) - 命令分类目录

---

**优化时间**：2026 年 2 月 10 日  
**优化版本**：0.3.12+ (架构重构版)

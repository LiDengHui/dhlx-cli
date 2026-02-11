# Excel 数据处理工具使用说明书

---

## 目录

1. [工具简介](#工具简介)
2. [快速开始](#快速开始)
3. [配置文件详解](#配置文件详解)
4. [输入文件要求](#输入文件要求)
5. [分组与合并逻辑](#分组与合并逻辑)
6. [对比结果生成](#对比结果生成)
7. [高级配置示例](#高级配置示例)
8. [注意事项](#注意事项)

---

## 工具简介

本工具用于处理包含多版本数据的 Excel 文件，支持以下核心功能：

- **多维度分组**：按 `id` + `category` 等组合字段分组
- **版本合并**：聚合同一分组的多个版本数据（如 v1/v2）
- **差异对比**：生成版本间差异报告
- **自定义输出**：灵活定义合并策略和对比逻辑

---

## 快速开始

### 1. 安装依赖

```bash
npm install @dhlx/dhlx-cli
```

### 2. 准备输入文件

创建 `input.xlsx`，示例数据：

| id  | category | version | sales | comment       |
| --- | -------- | ------- | ----- | ------------- |
| 1   | A        | v1      | 100   | Initial data  |
| 1   | A        | v2      | 150   | Updated value |
| 2   | B        | v1      | 200   | -             |

### 3. 创建配置文件 `config.js`

```javascript
export default {
  file: "input.xlsx",
  out: "result.xlsx",
  key: ["id", "category"], // 分组字段
  baseValue: "v1", // 基准版本
  compareValue: "v2", // 对比版本

  // 合并同组数据（示例：数值求和，文本取最新）
  merge: (groupKey, items) => {
    return items.reduce(
      (acc, cur) => ({
        id: cur.id,
        category: cur.category,
        version: cur.version,
        sales: (acc.sales || 0) + cur.sales,
        comment: cur.comment || acc.comment,
      }),
      {},
    );
  },

  // 生成对比结果（示例：数值差异）
  result: (groupKey, baseData, compareData) => {
    return {
      id_category: groupKey,
      sales_v1: baseData?.sales || 0,
      sales_v2: compareData?.sales || 0,
      sales_diff: (compareData?.sales || 0) - (baseData?.sales || 0),
      comment_changed: baseData?.comment !== compareData?.comment,
    };
  },
};
```

### 4. 运行命令

```bash
node dhlx process -c ./config.js
```

### 5. 查看输出

生成 `result.xlsx`，示例结果：

| id_category | sales_v1 | sales_v2 | sales_diff | comment_changed |
| ----------- | -------- | -------- | ---------- | --------------- |
| 1_A         | 100      | 150      | 50         | true            |
| 2_B         | 200      | 0        | -200       | false           |

---

## 配置文件详解

```javascript
export default {
  file: "input.xlsx", // 输入文件路径
  out: "output.xlsx", // 输出文件路径
  key: ["id", "category"], // 分组字段（支持多字段）
  baseValue: "v1", // 基准版本标识
  compareValue: "v2", // 对比版本标识
  merge: (groupKey, items) => {
    /* 合并逻辑 */
  },
  result: (groupKey, baseData, compareData) => {
    /* 对比逻辑 */
  },
};
```

---

## 输入文件要求

| 字段     | 说明                                 |
| -------- | ------------------------------------ |
| 分组字段 | 如 `id` + `category`                 |
| 版本字段 | 包含 `baseValue`/`compareValue` 的值 |
| 数值字段 | 需合并的数值型数据（如 sales）       |
| 文本字段 | 需对比的文本型数据（如 comment）     |

---

## 分组与合并逻辑

### 分组过程

1. **生成组合键**  
   使用 `key` 字段生成唯一标识，例如：

   ```javascript
   // key: ["id", "category"]
   generateKey({ id: 1, category: "A" }); // => "1_A"
   ```

2. **分组存储**
   ```javascript
   {
       "1_A": [v1数据, v2数据],
       "2_B": [v1数据]
   }
   ```

### 合并策略

通过 `merge` 函数自定义逻辑：

```javascript
// 示例：累加数值字段，保留最新文本
merge: (groupKey, items) => {
  return items.reduce(
    (acc, cur) => ({
      sales: acc.sales + cur.sales,
      comment: cur.comment || acc.comment,
    }),
    { sales: 0, comment: "" },
  );
};
```

---

## 对比结果生成

### 结果函数模板

```javascript
result: (groupKey, baseData, compareData) => {
  // baseData: 基准版本合并结果（可能为 undefined）
  // compareData: 对比版本合并结果（可能为 undefined）
  return {
    /* 自定义字段 */
  };
};
```

### 空值处理技巧

```javascript
// 使用可选链操作符（?.）和空值合并（??）
const value = baseData?.sales ?? 0;
```

---

## 高级配置示例

### 场景1：变更记录追踪

```javascript
result: (groupKey, base, compare) => {
  const changes = [];
  for (const key in base) {
    if (base[key] !== compare?.[key]) {
      changes.push({ field: key, old: base[key], new: compare[key] });
    }
  }
  return { id: groupKey, changes, status: changes.length ? "MODIFIED" : "UNCHANGED" };
};
```

### 场景2：多版本平均值计算

```javascript
merge: (groupKey, items) => {
  const sum = items.reduce((acc, cur) => acc + cur.value, 0);
  return { value: sum / items.length };
};
```

---

## 注意事项

1. **版本字段一致性**  
   确保输入文件中的版本字段值与配置中的 `baseValue`/`compareValue` 完全匹配（包括大小写）

2. **分组键唯一性**  
   `key` 字段组合必须能唯一标识一个业务实体

3. **空数据场景**

   ```javascript
   // 当某版本无数据时，baseData/compareData 为 undefined
   result: (groupKey, base, compare) => {
     const baseValue = base?.sales ?? "N/A";
   };
   ```

4. **性能优化**  
   处理 10万+ 数据时建议：
   - 优化 `merge` 函数复杂度
   - 分批次处理数据

---

通过本工具，您可以轻松实现多版本数据的聚合分析与差异追踪。根据实际业务需求调整 `merge` 和 `result` 函数，即可快速生成定制化报告。

import * as fs from 'node:fs';
import * as path from 'node:path';

const extensions = ['.js', '.ts', '.jsx', '.tsx'];

const graph: Record<string, string[]> = {};
const visited = new Set();

function isCodeFile(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    return extensions.includes(ext);
}

const excludeDirs = ['src/pages/.umi', 'src/pages/.umi-production'];

function isExcludedDir(dirPath: string) {
    return excludeDirs.some((excludeDir) => dirPath.includes(excludeDir));
}

function walk(dir: string) {
    if (isExcludedDir(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (isCodeFile(filePath)) {
            analyzeFile(filePath);
        }
    }
}

interface TreeNode {
    id: string;
    children: TreeNode[];
}

function convertToTree(graph: Record<string, string[]>): TreeNode[] {
    // 收集所有节点（键和子节点）
    const allNodes = new Set<string>();
    Object.keys(graph).forEach((key) => allNodes.add(key));
    Object.values(graph)
        .flat()
        .forEach((child) => allNodes.add(child));

    // 收集所有子节点（非根节点）
    const childNodes = new Set(Object.values(graph).flat());

    // 根节点 = 所有节点 - 子节点
    const rootNodes = Array.from(allNodes).filter((node) => !childNodes.has(node));
    const visited = new Set<string>();
    const trees: TreeNode[] = [];

    function buildTree(node: string): TreeNode | null {
        if (visited.has(node)) {
            console.warn(`Detected duplicate or cycle for node '${node}'. Skipping.`);
            return null;
        }
        visited.add(node);

        const children = graph[node] || [];
        const childTreeNodes: TreeNode[] = [];

        children.forEach((child) => {
            const childTree = buildTree(child);
            if (childTree) childTreeNodes.push(childTree);
        });

        return { id: node, children: childTreeNodes };
    }

    rootNodes.forEach((root) => {
        if (!visited.has(root)) {
            const tree = buildTree(root);
            if (tree) trees.push(tree);
        }
    });

    return trees;
}

function analyzeFile(filePath: string) {
    if (visited.has(filePath)) {
        return;
    }
    visited.add(filePath);

    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];

    const importRegex = /import\s+(\S+),*\{*(\s*\S+\s*)\}*\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        imports.push(getPath(match[3]));
    }
    while ((match = requireRegex.exec(content)) !== null) {
        imports.push(getPath(match[1]));
    }

    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`File: ${relativePath}`);
    console.log(`Imports: ${imports.join(', ')}`);
    console.log('');

    graph[getPath(relativePath)] = [...new Set(handleImports(relativePath, imports))];
}

const getPath = (str: string) => {
    return str.replace(/\.(jsx?|tsx?)$/, '')
}

// 处理导入语句
// 如果是相对路径，则转换为绝对路径
// 如果是绝对路径，则保持不变
// 如果是模块路径，则转换为绝对路径
// 如果是 URL，则保持不变
function handleImports(relativePath: string, urls: string[]) {
    const dir = path.parse(relativePath).dir;
    return urls.map((url) => {
        if (url.startsWith('.')) {
            return path.join(dir, url).replace(process.cwd() + '/', '');
        }
        if (url.startsWith('@/')) {
            return path.join(url.replace('@/', './src/'));
        }
        return url;
    });
}

function generateMermaid(graph: Record<string, string[]>) {
    let mermaid = '```mermaid\n';
    mermaid += 'graph TD\n';
    for (const [file, deps] of Object.entries(graph)) {
        const from = file;
        for (const dep of deps) {
            mermaid += `  ${from} --> ${dep}\n`;
        }
    }
    mermaid += '```\n';
    return mermaid;
}

function generateG6(graph: Record<string, string[]>) {
    const nodes = [] as string[];

    const edges = [] as { source: string; target: string }[];

    for (const [file, deps] of Object.entries(graph)) {
        const from = file;
        if (!nodes.includes(file)) {
            nodes.push(file);
        }

        for (const dep of deps) {
            if (!nodes.includes(dep)) {
                nodes.push(dep);
            }

            edges.push({ source: from, target: dep });
        }
    }

    return {
        nodes: nodes.map((item) => {
            return {
                id: item,
                label: item,
            };
        }),
        edges,
    };
}

interface CodeMapConfig {
    input: string;
    type: 'md' | 'g6' | 'json';
    deep: string;
}

export function codeMap(config: CodeMapConfig) {
    const inputPath = path.join(process.cwd(), './src');
    console.log(inputPath);
    if (!fs.existsSync(inputPath)) {
        console.error(`Input directory ${inputPath} does not exist.`);
        return;
    }

    walk(inputPath);
    console.log(graph);

    if (config.type === 'g6') {
        const mermaidOutput = generateG6(graph);
        fs.writeFileSync('import-graph.json', JSON.stringify(mermaidOutput), 'utf-8');
    } else if (config.type === 'json') {



        const mermaidOutput = convertToTree(graph);
        fs.writeFileSync('import-graph.json', JSON.stringify(mermaidOutput), 'utf-8');
    } else {
        const mermaidOutput = generateMermaid(graph);
        fs.writeFileSync('import-graph.md', mermaidOutput, 'utf-8');
    }

    console.log('✅ Mermaid 依赖图生成成功: import-graph.mmd');
    console.log('📌 可在 Markdown 工具（如 VSCode 插件、Obsidian、Typora）或 Mermaid Live Editor 查看');
}

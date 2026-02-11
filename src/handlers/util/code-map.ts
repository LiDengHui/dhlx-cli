import fs from 'fs';
import path from 'path';

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
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else if (isCodeFile(full)) {
            analyzeFile(full);
        }
    }
}

function analyzeFile(filePath: string) {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    const content = fs.readFileSync(filePath, 'utf-8');
    const imports: string[] = [];

    const importRegex = /import\s+[^'";]+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(content)) !== null) {
        imports.push(getPath(match[1]));
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
    return str.replace(/\.(jsx?|tsx?)$/, '');
};

function handleImports(relativePath: string, urls: string[]) {
    const dir = path.parse(relativePath).dir;
    const result: string[] = [];
    for (const url of urls) {
        if (url.startsWith('.') || url.startsWith('/')) {
            const resolved = path.resolve(dir, url);
            const file = resolved.replace(/\.(jsx?|tsx?)$/, '');
            result.push(file);
            continue;
        }
        // module or other
        result.push(url);
    }
    return result;
}

function generateMermaid(graph: Record<string, string[]>) {
    const lines: string[] = ['graph TD'];
    for (const [k, v] of Object.entries(graph)) {
        if (v.length === 0) continue;
        for (const child of v) {
            lines.push(`  "${k}" --> "${child}"`);
        }
    }
    return lines.join('\n');
}

function generateG6(graph: Record<string, string[]>) {
    const nodes = new Set<string>();
    const edges: Array<{ source: string; target: string }> = [];
    for (const [k, v] of Object.entries(graph)) {
        nodes.add(k);
        for (const child of v) {
            nodes.add(child);
            edges.push({ source: k, target: child });
        }
    }
    return {
        nodes: Array.from(nodes).map((id) => ({ id })),
        edges,
    };
}

interface CodeMapConfig {
    input?: string;
    type?: 'mermaid' | 'g6';
}

export function codeMap(config: CodeMapConfig = {}) {
    const input = config.input || process.cwd();
    walk(input);
    if (config.type === 'g6') {
        const g6 = generateG6(graph);
        console.log(JSON.stringify(g6, null, 2));
    } else {
        console.log(generateMermaid(graph));
    }
}

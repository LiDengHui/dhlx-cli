import fs from 'fs';
import pkg from 'xlsx';

const { readFile, utils, writeFile } = pkg;

interface ReadExcelConfig {
    sheetName?: string;
}

/**
 * 读取 Excel 文件，并将第一行作为 JSON 的 key
 * @param {string} filePath - Excel 文件路径
 * @param readExcelConfig
 * @returns {Array} - 解析后的 JSON 数据
 */
export function readExcel(filePath: string, readExcelConfig: ReadExcelConfig = {}): any[] {
    if (!fs.existsSync(filePath)) {
        console.error(`文件不存在: ${filePath}`);
        process.exit(1);
    }

    const workbook = readFile(filePath, {
        // cellDates: true,
        dateNF: 'yyyy-mm-dd', // 指定日期格式
    });

    const sheetName = readExcelConfig.sheetName ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        console.error('excel sheetName 不存在');
        process.exit(1);
    }

    const jsonData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
        console.error('Excel 文件内容不足，至少需要一行表头和一行数据');
    }

    // 第一行作为 key，后续行作为数据
    const headers = jsonData[0] as string[];
    return jsonData.slice(1).map((row) => {
        let obj: Record<string, any> = {};
        headers.forEach((key, index) => {
            obj[key] = row[index] || '';
        });
        return obj;
    });
}

interface WriteExcelConfig {
    sheetName?: string;
}

/**
 * 写入 Excel 文件
 * @param {string} filePath - 输出 Excel 文件路径
 * @param {Array} data - JSON 数据
 * @param writeExcelConfig
 */
export function writeExcel(filePath: string, data: any[], writeExcelConfig: WriteExcelConfig = {}): void {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, writeExcelConfig.sheetName ?? 'Sheet1');
    writeFile(workbook, filePath);
}

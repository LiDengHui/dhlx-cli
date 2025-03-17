import fs from 'fs';
import pkg from 'xlsx';
const { readFile, utils, writeFile } = pkg;

/**
 * 读取 Excel 文件，并将第一行作为 JSON 的 key
 * @param {string} filePath - Excel 文件路径
 * @returns {Array} - 解析后的 JSON 数据
 */
export function readExcel(filePath: string): any[] {
    if (!fs.existsSync(filePath)) {
        console.error(`文件不存在: ${filePath}`);
        process.exit(1);
    }

    const workbook = readFile(filePath, {
        // cellDates: true,
        dateNF: 'yyyy-mm-dd', // 指定日期格式
    });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
        console.error('Excel 文件内容不足，至少需要一行表头和一行数据');
        process.exit(1);
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

/**
 * 写入 Excel 文件
 * @param {string} filePath - 输出 Excel 文件路径
 * @param {Array} data - JSON 数据
 */
export function writeExcel(filePath: string, data: any[]): void {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    writeFile(workbook, filePath);
}

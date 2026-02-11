import { readExcel, writeExcel } from '../../utils/excel';

export interface Config<T = any> {
    file: string;
    out: string;
    sheetName?: string;
    key: string[];
    merge: (key: string, items: any[]) => T;
    baseValue: string;
    compareValue: string;
    result: (groupKey: string, baseData?: T, compareData?: T) => any;
}

function generateKey(data: Record<string, any>, keys: string[]) {
    return keys.map((key) => data[key]).join('_');
}

export default async function processExcel<T extends object>(config: Config<T>): Promise<void> {
    console.log(config);
    console.log('读取 Excel 文件...');
    const inputData = readExcel(config.file, { sheetName: config.sheetName });
    console.log('处理 Excel 数据...');

    const groupedData: Record<string, any[]> = {};
    inputData.forEach((item) => {
        const groupKey = generateKey(item, config.key);
        if (!groupedData[groupKey]) groupedData[groupKey] = [];
        groupedData[groupKey].push(item);
    });

    const results: any[] = [];
    const keys = Object.keys(groupedData);
    const groupedData2: Record<string, any> = {};
    keys.forEach((item) => {
        const x = config.merge(item, groupedData[item]);
        groupedData2[item] = x;
    });

    const baseKeys = keys
        .filter((e) => e.startsWith(config.baseValue))
        .map((e) => e.replace(config.baseValue + '_', ''));
    const compareKeys = keys
        .filter((e) => e.startsWith(config.compareValue))
        .map((e) => e.replace(config.compareValue + '_', ''));

    const commonKeys = [...new Set([...baseKeys, ...compareKeys])];
    console.log(commonKeys);

    commonKeys.forEach((groupKey) => {
        const baseData = groupedData2[`${config.baseValue}_${groupKey}`];
        const compareData = groupedData2[`${config.compareValue}_${groupKey}`];
        const resultData = config.result(groupKey, baseData, compareData);
        results.push(resultData);
    });

    console.log('写入 Excel 文件...');
    writeExcel(config.out, results, {
        sheetName: config.sheetName,
    });
    console.log('Excel 处理完成！');
}

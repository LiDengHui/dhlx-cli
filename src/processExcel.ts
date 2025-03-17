import path from 'path';
import { readExcel, writeExcel } from './utils/excel.js';

export interface Config<T = any> {
    file: string;
    out: string;
    key: string[];
    baseValue: string;
    compareValue: string;
    result: (groupKey: string, baseData: T, compareData: T) => any;
    merge: (key: string, items: T[]) => T;
}

/**
 * 生成唯一 Key
 * @param {Object} data - 数据对象
 * @param {Array} keys - 关键字段数组
 * @returns {string} - 生成的唯一 Key
 */
function generateKey(data: Record<string, any>, keys: string[]): string {
    return keys.map((key) => data[key]).join('_');
}

/**
 * 处理 Excel 数据
 */
export default async function processExcel<T extends object>(config: Config<T>) {
    console.log(config);
    console.log('读取 Excel 文件...');
    const inputData: T[] = readExcel(config.file);

    console.log('处理 Excel 数据...');
    const groupedData: Record<string, T[]> = {};

    // 按 key（数组）进行分组
    inputData.forEach((item) => {
        const groupKey: string = generateKey(item, config.key);
        if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
        }
        groupedData[groupKey].push(item);
    });

    const results: any[] = [];

    const keys = Object.keys(groupedData);

    const groupedData2: Record<string, T> = {};
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

    commonKeys.forEach((groupKey) => {
        const baseData = groupedData2[`${config.baseValue}_${groupKey}`] as T;
        const compareData = groupedData2[`${config.compareValue}_${groupKey}`] as T;
        const resultData = config.result(groupKey, baseData, compareData);
        results.push(resultData);
    });

    console.log('写入 Excel 文件...');
    writeExcel(config.out, results);

    console.log('Excel 处理完成！');
}

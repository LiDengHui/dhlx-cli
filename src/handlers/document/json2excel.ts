import { BaseOptions } from '../image/baseImage.js';
import path from 'path';
import { readJson } from '../../utils/json.js';
import { writeExcel } from '../../utils/excel.js';
import log from '../../utils/log.js';

interface Json2excelConfig extends BaseOptions {
    sheet?: string;
    data?: object | string;
}
export function json2excel(config: Json2excelConfig) {
    let inputData;
    if (config.data) {
        if (typeof config.data === 'string') {
            inputData = JSON.parse(config.data);
        } else {
            inputData = config.data;
        }
    } else if (config.input) {
        const inputPath = path.resolve(process.cwd(), config.input);
        inputData = readJson(inputPath);
    } else {
        throw new Error('input path or data is not exist ');
    }

    if (inputData) {
        if (!config.output) throw new Error('output is not exist');
        const outputPath = path.resolve(process.cwd(), config.output);
        writeExcel(outputPath, inputData, {
            sheetName: config.sheet,
        });
        log.info('write excel success');
    }
}

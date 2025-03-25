import { BaseOptions } from './baseImage.js';
import { readExcel } from './utils/excel.js';
import { writeJson } from './utils/json.js';
import path from 'path';
import log from './utils/log.js';

interface Excel2jsonConfig extends BaseOptions {
    sheet?: string;
}

export function excel2json<T>(config: Excel2jsonConfig) {
    if (!config.input) throw new Error('file not exist');

    const inputPath = path.resolve(process.cwd(), config.input);
    const inputData: T[] = readExcel(inputPath, { sheetName: config.sheet });

    if (!config.output) {
        console.log(inputData);
    } else {
        if (config.output) {
            const projectPath = path.resolve(process.cwd(), config.output);
            writeJson(projectPath, inputData);
        } else {
            throw new Error('output is not exist');
        }
    }

    log.info('write json success');
}

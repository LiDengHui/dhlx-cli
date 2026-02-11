import { Command } from 'commander';
import { BaseOptions } from '../../handlers/image/baseImage';
import { excel2json, json2excel, wordToHtml, pdfToHtml, processExcel } from '../../handlers/document/index';
import type { Config as ProcessExcelConfig } from '../../handlers/document/index';
import { loadConfigModule } from '../shared/config';

type ConfigurableOptions<TOptions extends object> = TOptions & { config?: string };

async function mergeOptionsWithConfig<TOptions extends object>(
    options: ConfigurableOptions<TOptions>,
): Promise<TOptions> {
    const config = await loadConfigModule<TOptions>(options.config);
    return { ...config, ...options } as TOptions;
}

export function registerDocumentCommands(program: Command): void {
    program
        .command('word-to-html')
        .description('Change word to html')
        .option('-i, --input <path>', 'Input file or folder path')
        .option('-o, --output <path>', 'Output folder path', './output')
        .action(async (options) => {
            await wordToHtml({
                input: options.input,
                output: options.output,
            });
        });

    program
        .command('pdf2html')
        .description('Change pdf to html')
        .option('-i, --input <path>', 'Input file or folder path')
        .option('-o, --output <path>', 'Output folder path', './output')
        .action(async (options) => {
            await pdfToHtml({
                input: options.input,
                output: options.output,
            });
        });

    program
        .command('process')
        .description('处理 Excel 文件')
        .option('-c, --config <path>', '指定配置文件路径 {process.js}', 'process.js')
        .option('-i, --file <path>', '输入文件 {input.excel}')
        .option('-o, --out <path>', '输出文件 {output.excel}')
        .option('-b, --baseValue <string>', '对比源, {2025/6/1}')
        .option('-t, --compareValue <string>', '对比项 {2025/5/1}')
        .option('-s, --sheet <string>', 'sheetName 默认第一个')
        .action(async (options: ConfigurableOptions<Partial<ProcessExcelConfig>>) => {
            const mergedOptions = await mergeOptionsWithConfig<ProcessExcelConfig>(
                options as ConfigurableOptions<ProcessExcelConfig>,
            );
            await processExcel(mergedOptions);
        });

    program
        .command('excel2json')
        .description('将 Excel 文件转换为 JSON 格式')
        .option('-c, --config <path>', '配置文件路径 {excel2json.js}')
        .option('-i, --input <path>', '输入 Excel 文件路径 {input.xlsx}')
        .option('-o, --output <path>', '输出 JSON 文件路径，未提供时打印到控制台')
        .option('-s, --sheet <name>', '指定 sheet 名称，默认第一个')
        .action(async (options) => {
            const mergedOptions = await mergeOptionsWithConfig<BaseOptions>(options);
            excel2json(mergedOptions);
        });

    program
        .command('json2excel')
        .description('将  JSON 文件转换为 Excel 格式')
        .option('-c, --config <path>', '配置文件路径 {excel2json.js}')
        .option('-i, --input <path>', '输入 Excel 文件路径 {input.xlsx}')
        .option('-o, --output <path>', '输出 JSON 文件路径，未提供时打印到控制台')
        .option('-s, --sheet <name>', '指定 sheet 名称，默认第一个')
        .option('-d, --data <object| string>', '数据')
        .action(async (options) => {
            const mergedOptions = await mergeOptionsWithConfig<BaseOptions>(options);
            json2excel(mergedOptions);
        });
}

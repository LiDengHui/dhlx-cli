import createProject from './create.js'
import { compressImages } from './compress.js'
import { transformed, version } from './version.js'
import { program } from 'commander'
import { convertImages } from './convert.js'

console.info(transformed)

program.version(version)

program
  .command('create [template] [project]')
  .description('创建项目')
  .action(async (template, project) => {
    await createProject({
      template,
      project,
    })
  })

program
  .command('compress')
  .description('Compress images')
  .option('-i, --input <path>', 'Input file or folder path')
  .option('-o, --output <path>', 'Output folder path', './output')
  .option('-q, --quality <number>', 'Image quality (default: 80)', '80')
  .action(async (options) => {
    await compressImages({
      input: options.input,
      output: options.output,
      quality: parseInt(options.quality, 10),
    })
  })

// 转换子命令
program
  .command('convert')
  .description('Convert image formats')
  .option('-i, --input <path>', 'Input file or folder path')
  .option('-o, --output <path>', 'Output folder path', './output')
  .option(
    '-f, --format <format>',
    'Target image format (jpg, png, webp)',
    'jpg'
  )
  .action(async (options) => {
    await convertImages({
      input: options.input,
      output: options.output,
      format: options.format,
    })
  })

program.parse(process.argv)

import createProject from './create.js'
import { transformed, version } from './version.js'
import { program } from 'commander'
console.info(transformed)

program.version(version)

program
  .command('create [template] [project]')
  .description('创建项目')
  .action((template, project) => {
    createProject({
      template,
      project,
    })
  })

program.parse(process.argv)

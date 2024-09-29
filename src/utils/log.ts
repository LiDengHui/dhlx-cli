import color from './color.js'

const log = {
  error: (...args: any[]) =>
    console.error(color('[ERROR]'), ...args.map((e) => color(e))),
  info: (...args: any[]) =>
    console.info(color('[INFO]'), ...args.map((e) => color(e))),
}

export default log

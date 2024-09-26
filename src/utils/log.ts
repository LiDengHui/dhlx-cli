import color from './color.js'

const log = {
    error: (...args: any[]) => console.error(color('[ERROR]'), ...args),
    info: (...args: any[]) => console.info(color('[INFO]'), ...args),
}

export default log

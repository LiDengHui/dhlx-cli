import color from './color';

const log = {
    error: (...args: any[]) => console.error(color('[ERROR]'), ...args.map((e) => color(e))),
    info: (...args: any[]) => console.info(color('[INFO]'), ...args.map((e) => color(e))),
    success: (...args: any[]) => console.info(color('[SUCCESS]'), ...args.map((e) => color(e))),
    warn: (...args: any[]) => console.warn(color('[WARN]'), ...args.map((e) => color(e))),
};

export default log;

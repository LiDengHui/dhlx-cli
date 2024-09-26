import figlet from 'figlet';
import Printer from '@darkobits/lolcatjs';
import packageJson from '../package.json' with { type: 'json' };

const versionStr = figlet.textSync('DHLX');

const input = [`${versionStr}`, packageJson.version];

export const transformed = Printer.fromString(input.join('\n'));

export const version = packageJson.version;
import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth/index.js';
import { registerConfigCommands } from './commands/config/index.js';
import { registerDeployCommands } from './commands/deploy/index.js';
import { registerDocumentCommands } from './commands/document/index.js';
import { registerImageCommands } from './commands/image/index.js';
import { registerProjectCommands } from './commands/project/index.js';
import { applyRegistrars, CommandRegistrar } from './commands/shared/command.js';
import { registerUtilCommands } from './commands/util/index.js';

const COMMAND_REGISTRARS: ReadonlyArray<CommandRegistrar> = [
    registerProjectCommands,
    registerImageCommands,
    registerDocumentCommands,
    registerUtilCommands,
    registerDeployCommands,
    registerConfigCommands,
    registerAuthCommands,
];

export function registerAllCommands(program: Command): void {
    applyRegistrars(program, COMMAND_REGISTRARS);
}

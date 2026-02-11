import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth/index';
import { registerConfigCommands } from './commands/config/index';
import { registerDeployCommands } from './commands/deploy/index';
import { registerDocumentCommands } from './commands/document/index';
import { registerImageCommands } from './commands/image/index';
import { registerProjectCommands } from './commands/project/index';
import { applyRegistrars, CommandRegistrar } from './commands/shared/command';
import { registerUtilCommands } from './commands/util/index';

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

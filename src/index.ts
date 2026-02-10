import { program } from 'commander';
import { registerAllCommands } from './register.js';
import { transformed, version } from './version.js';

console.info(transformed);

program.version(version);

async function bootstrap(): Promise<void> {
    registerAllCommands(program);
    await program.parseAsync(process.argv);
}

bootstrap().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to bootstrap CLI: ${message}`);
    process.exit(1);
});

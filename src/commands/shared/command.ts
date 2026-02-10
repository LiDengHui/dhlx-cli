import { Command } from 'commander';

export type CommandRegistrar = (program: Command) => void;

export function applyRegistrars(program: Command, registrars: ReadonlyArray<CommandRegistrar>): void {
    for (const reg of registrars) {
        try {
            reg(program);
        } catch (err) {
            // Log and continue applying other registrars
            // eslint-disable-next-line no-console
            console.error('Failed to apply registrar:', err);
        }
    }
}

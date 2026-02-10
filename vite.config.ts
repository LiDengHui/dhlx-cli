import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { builtinModules } from 'module';

// Vite config to bundle the CLI for Node (ESM).
export default defineConfig({
    plugins: [tsconfigPaths()],
    build: {
        target: 'es2020',
        outDir: 'dist',
        lib: { entry: 'src/index.ts', formats: ['es'] },
        rollupOptions: {
            // keep node builtins and major runtime deps external
            external: [
                ...builtinModules,
                'commander',
                'inquirer',
                'lodash',
                'ora',
                'git-clone',
                'mammoth',
                'archiver',
                'node-ssh',
                'gh-pages',
                'sharp',
                'xlsx',
                '@dhlx/resolver',
            ],
            output: { entryFileNames: '[name].js' },
        },
    },
});

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { builtinModules } from 'module';

// Vite config to bundle the CLI for Node (ESM).
export default defineConfig({
    plugins: [tsconfigPaths()],
    build: {
        // Build an SSR bundle for Node to avoid browser externals
        ssr: 'src/index.ts',
        target: 'node18',
        outDir: 'dist',
        rollupOptions: {
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
            output: { entryFileNames: '[name].js', format: 'es' },
        },
    },
});

import { builtinModules } from 'node:module';
import { defineConfig } from 'vite-plus';

const external = [
    ...builtinModules,
    ...builtinModules.map((moduleName) => `node:${moduleName}`),
    '@darkobits/lolcatjs',
    '@dhlx/resolver',
    'archiver',
    'commander',
    'figlet',
    'gh-pages',
    'git-clone',
    'git-clone/promise',
    'inquirer',
    'lodash',
    'mammoth',
    'node-ssh',
    'ora',
    'readline-sync',
    'sharp',
    'xlsx',
];

export default defineConfig({
    fmt: {
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'always',
        proseWrap: 'preserve',
        endOfLine: 'lf',
        ignorePatterns: ['dist/**', 'node_modules/**'],
    },
    lint: {
        plugins: null,
        categories: {},
        rules: {},
        settings: {
            'jsx-a11y': {
                polymorphicPropName: null,
                components: {},
                attributes: {},
            },
            next: {
                rootDir: [],
            },
            react: {
                formComponents: [],
                linkComponents: [],
                version: null,
                componentWrapperFunctions: [],
            },
            jsdoc: {
                ignorePrivate: false,
                ignoreInternal: false,
                ignoreReplacesDocs: true,
                overrideReplacesDocs: true,
                augmentsExtendsReplacesDocs: false,
                implementsReplacesDocs: false,
                exemptDestructuredRootsFromChecks: false,
                tagNamePreference: {},
            },
            vitest: {
                typecheck: false,
            },
        },
        env: {
            builtin: true,
        },
        globals: {},
        ignorePatterns: ['dist/**', 'node_modules/**'],
    },
    staged: {
        '*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}': ['vp fmt --write', 'vp lint'],
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.mjs'],
    },
    build: {
        ssr: 'src/index.ts',
        target: 'node18',
        outDir: 'dist',
        rollupOptions: {
            external,
            output: {
                entryFileNames: '[name].js',
                format: 'es',
            },
        },
    },
});

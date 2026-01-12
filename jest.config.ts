import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/**/*.test.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
};

export default config;

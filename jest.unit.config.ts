import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.spec.ts'], // Match em .spec.ts files em qualquer lugar do projeto
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^uuid$': '<rootDir>/tests/mocks/uuid.ts',
    },
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/services/user.service.ts',
        'src/services/wallet.service.ts',
        'src/services/transaction.service.ts',
    ],
    coverageDirectory: 'coverage/unit',
    coverageReporters: ['text', 'lcov'],
    transformIgnorePatterns: ['node_modules/(?!(uuid|date-fns)/)'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

export default config;

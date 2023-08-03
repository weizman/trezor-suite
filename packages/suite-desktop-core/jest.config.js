// eslint-disable-next-line import/extensions
const sharedConfig = require('../../jest.config.base.js');

module.exports = {
    ...sharedConfig,
    rootDir: './',
    coverageDirectory: './coverage',
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/libs/*'],
    testPathIgnorePatterns: [...sharedConfig.testPathIgnorePatterns, 'e2e'],
    coverageThreshold: {
        global: {
            statements: 25,
            branches: 25,
            functions: 20,
            lines: 25,
        },
    },
};

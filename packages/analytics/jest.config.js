// eslint-disable-next-line import/extensions
const sharedConfig = require('../../jest.config.base.js');

module.exports = {
    ...sharedConfig,
    rootDir: './',
    coverageDirectory: './coverage',
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**'],
    coverageThreshold: {
        global: {
            statements: 75,
            branches: 60,
            functions: 80,
            lines: 80,
        },
    },
};

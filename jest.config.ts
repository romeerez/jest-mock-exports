import type { Config } from "jest";

const config: Config = {
    testEnvironment: "node",
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest", {}],
    },
    moduleFileExtensions: ["ts", "js"],
    runtime: '<rootDir>/dist/jest.runtime.js',
    testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default config;
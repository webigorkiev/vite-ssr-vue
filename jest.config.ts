import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  moduleFileExtensions: [
    "js",
    "ts",
    "json",
    "vue",
    "node"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.vue$": "vue-jest"
  },
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1"
  },
  setupFiles: ["./scripts/jest.setup.ts"],
  globalSetup: "./scripts/jest.global.setup.ts",
  globalTeardown: "./scripts/jest.global.teardown.ts",
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  },
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ['<rootDir>/dist']
};

export default config;
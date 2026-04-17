/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Import reflect-metadata before any test file so TypeORM decorators
  // can run when entity modules are loaded.
  setupFiles: ["reflect-metadata"],
  roots: ["<rootDir>/src"],
};

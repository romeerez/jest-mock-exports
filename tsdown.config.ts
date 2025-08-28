import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/jest.runtime.ts'],
  platform: 'node',
  format: ["cjs"],
  dts: {
    oxc: true,
  },
})

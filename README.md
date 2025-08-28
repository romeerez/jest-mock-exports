# Jest Mock Exports

Simplifies mocking exports for Jest.

```ts
import { libFn } from 'some-library';
import { doStuff, logicFn, someConfig } from './my/file';
import { whatAreWeTesting } from './file';
import { mockExportedFn, mockExportedObject, spyOnExportedFn } from 'jest-mock-exports';

// mocks with jest.fn() by default:
const mocked1 = mockExportedFn(libFn)

// provide implementation:
const mocked2 = mockExportedFn(doStuff, () => 'mock implementation')

// mocking objects:
mockExportedObject(someConfig, { new: 'value' })

// spying on functions without changing their implementation:
const spy = spyOnExportedFn(logicFn)

it('works', async () => {
    mocked2.mockResolvedValueOnce('return for this test')
    
    await whatAreWeTesting()
    
    expect(mocked1).toHaveBeenCalledTimes(1)
    expect(mocked2).toHaveBeenCalledWith('params')
    expect(spy).toHaveBeenCalledWith('params')
})
```

For convenience, you can group the mocks:

```ts
const mocks = {
    fn1: mockExportedFn(fn1),
    fn2: mockExportedFn(fn1, () => 'mock implementation'),
    obj: mockExportedObject(obj, { new: 'value' }),
}

it('works', async () => {
    mocks.fn1.mockResolvedValueOnce('return for this test')
    
    await whatAreWeTesting()
    
    expect(mocks.fn2).toHaveBeenCalledWith('params')
})
```

## Installation

```sh
npm i -D jest-mock-exports
```

Add to `jest.config.ts` (or `.js`) in the root:

```ts
import type { Config } from "jest";

const config: Config = {
    runtime: 'jest-mock-exports/jest.runtime',
};

export default config;
```

import Runtime from 'jest-runtime'

type Exports = Object
type UnknownRecord = { [K: string]: unknown }

/**
 * Requiring a module wraps it into a proxy.
 * `proxies` cache the proxies to not create a new one on a sequential require of the same module.
 */
const proxies = new Map<Exports, Exports>();

/**
 * Every exported object or function gets its metadata:
 * - mocks: an object to store a mock for the object or function;
 * - as: the name how the object or function was exported.
 */
const exportedItemsMeta = new Map();

/**
 * Caches modules mocks.
 * Importing a module at the top and then importing the same module inside a test results in two different exoprt objects,
 * both of them will be linked with the same `mocks` object by the module id.
 */
const mocksStore = new Map();

const injectedGlobals = {
    mockExportedFn(fn: (...args: unknown[]) => unknown, mockFn?: (...args: unknown[]) => unknown) {
        const exportMeta = exportedItemsMeta.get(fn);

        if (!exportMeta) {
            throw new Error(`Cannot mock ${typeof fn === 'function' ? fn.name : fn}`);
        }

        exportMeta.mocks[exportMeta.as] = mockFn;
    },

    mockExportedObject(original: unknown, replaceWith: unknown) {
        const exportMeta = exportedItemsMeta.get(original);

        if (!exportMeta) {
            throw new Error(`Cannot mock ${original}`);
        }

        exportMeta.mocks[exportMeta.as] = replaceWith;
    }
}

export default class PatchedJestRuntime extends Runtime {
    setGlobalsForRuntime: typeof Runtime.prototype.setGlobalsForRuntime = (globals) => {
       super.setGlobalsForRuntime(globals);
       (globals as unknown as UnknownRecord).__patchedJestRuntime__ = injectedGlobals;
    }

    /**
     * Runs after a single test file is done, need to clear all mocks for the next file to run clearly.
     */
    async teardown(): Promise<void> {
        proxies.clear();
        exportedItemsMeta.clear();
        mocksStore.clear();
    }

    requireModule: typeof Runtime.prototype.requireModule = (from, path, options, isRequireActual) => {
        const exports = super.requireModule(from, path, options, isRequireActual);

        if (path && exports && typeof exports === 'object') {
            return this.proxifyModule(exports, from, path) as never;
        } else if (typeof exports === 'function' && exports.name === 'PatchedJestRuntime') {
            return PatchedJestRuntime as never;
        }

        return exports as never;
    }

    // eslint-disable-next-line max-params
    requireMock: typeof Runtime.prototype.requireModule = (from, path, options, isRequireActual) => {
        const exports = (super.requireMock as typeof Runtime.prototype.requireModule)(from, path, options, isRequireActual);
        return (exports && path ? this.proxifyModule(exports, from, path) : exports) as never;
    }

    proxifyModule(exports: Exports, from: string, path: string): Exports {
        let wrapped = proxies.get(exports);

        if (!wrapped) {
            // @ts-expect-error it's private, so what
            const moduleID = this._resolver.getModuleID(
                // @ts-expect-error it's private, so what
                this._virtualMocks,
                from,
                path,
                {
                    // @ts-expect-error it's private, so what
                    conditions: this.cjsConditions,
                },
            );
            let mocks = mocksStore.get(moduleID);

            if (!mocks) {
                mocks = {};
                mocksStore.set(moduleID, mocks);
            }

            wrapped = new Proxy(exports, {
                get(target, prop, receiver) {
                    if (prop === '__esModule') {
                        return (target as UnknownRecord)[prop];
                    }

                    const value = prop in mocks ? mocks[prop] : Reflect.get(target, prop, receiver);

                    if (value && (typeof value === 'object' || typeof value === 'function')) {
                        exportedItemsMeta.set(value, { mocks, as: prop });
                    }

                    return value;
                },

                // eslint-disable-next-line max-params
                set(target, prop, value, receiver) {
                    return Reflect.set(target, prop, value, receiver);
                },
            });
            proxies.set(exports, wrapped);
        }

        return wrapped;
    }
};

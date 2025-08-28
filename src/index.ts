type ExportedFn = (...args: never[]) => unknown;

type Implementation<Item extends ExportedFn> =
    Item extends ((this: infer This, ...args: infer Args) => infer Returns)
        ? (this: This, ...args: Args) => Returns
        : Item;

export function mockExportedFn<Item extends ExportedFn>(
    fn: Item,
    implementation?: Implementation<Item>,
): jest.Mock {
    if (jest.isMockFunction(fn)) {
        if (implementation) {
            fn.mockImplementation(implementation);
        }

        return fn;
    }

    const mockFn = jest.fn(implementation as never);

    // @ts-ignore
    global.__patchedJestRuntime__.mockExportedFn(fn, mockFn);

    return mockFn;
}

export function mockExportedObject<Original>(
    obj: Original,
    replaceWith?: unknown,
): Original {
    // @ts-ignore
    global.__patchedJestRuntime__.mockExportedObject(obj, replaceWith);

    return replaceWith as Original;
}

export function spyOnExportedFn<Fn extends ExportedFn>(fn: Fn): Fn {
    if (jest.isMockFunction(fn)) {
        return fn;
    }

    const mockFn = jest.fn(fn);

    // @ts-ignore
    global.__patchedJestRuntime__.mockExportedFn(fn, mockFn);

    return mockFn as never;
}

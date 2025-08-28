import {callFunctions, showObjects} from "./other-file";
import {mockExportedFn, mockExportedObject, spyOnExportedFn} from "../index";
import {obj1, one, two} from "./file";

describe('mockExportedFn', () => {
    it('should mock one function without mocking other function', () => {
        mockExportedFn(one, () => 'mocked' as unknown as number)

        const result = callFunctions()

        expect(result).toEqual({
            oneReturned: 'mocked',
            twoReturned: 2,
        })
    })
})

describe('mockExportedObject', () => {
    it('should mock one object without mocking other object', () => {
        mockExportedObject(obj1, { mocked: true })

        const result = showObjects()

        expect(result).toEqual({
            first: { mocked: true },
            second: { key: 'value' },
        })
    })
})

describe('spyOnExportedFn', () => {
    it('should spy on the exported function without mocking its implementation', () => {
        spyOnExportedFn(two);

        const { twoReturned } = callFunctions()

        expect(twoReturned).toEqual(2)
        expect(two).toHaveBeenCalledTimes(1)
        expect(two).toHaveBeenCalledWith()
    })
})

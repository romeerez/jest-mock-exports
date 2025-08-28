import {obj1, obj2, one, two} from "./file";

export const callFunctions = () => {
    return {
        oneReturned: one(),
        twoReturned: two(),
    }
}

export const showObjects = () => {
    return {
        first: obj1,
        second: obj2,
    }
}

var _a;
import { IMMUTABLE_STRING } from "./constants.js";
export class ImmutableString {
    constructor(val) {
        // Used to detect whether a value is a ImmutableString object rather than using an instanceof check
        this[_a] = true;
        this.val = val;
    }
    /**
     * Returns the content of the ImmutableString object as a simple string
     */
    toString() {
        return this.val;
    }
    toJSON() {
        return this.val;
    }
}
_a = IMMUTABLE_STRING;

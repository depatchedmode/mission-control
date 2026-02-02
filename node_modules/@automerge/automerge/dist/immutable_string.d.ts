import { IMMUTABLE_STRING } from "./constants.js";
export declare class ImmutableString {
    [IMMUTABLE_STRING]: boolean;
    val: string;
    constructor(val: string);
    /**
     * Returns the content of the ImmutableString object as a simple string
     */
    toString(): string;
    toJSON(): string;
}

import * as sha256 from "fast-sha256";
import { mergeArrays } from "../helpers/mergeArrays.js";
export function keyHash(binary) {
    // calculate hash
    const hash = sha256.hash(binary);
    return bufferToHexString(hash);
}
export function headsHash(heads) {
    const encoder = new TextEncoder();
    const headsbinary = mergeArrays(heads.map((h) => encoder.encode(h)));
    return keyHash(headsbinary);
}
function bufferToHexString(data) {
    return Array.from(data, byte => byte.toString(16).padStart(2, "0")).join("");
}

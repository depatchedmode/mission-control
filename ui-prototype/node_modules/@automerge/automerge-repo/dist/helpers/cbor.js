import { Encoder, decode as cborXdecode } from "cbor-x";
export function encode(obj) {
    const encoder = new Encoder({ tagUint8Array: false, useRecords: false });
    return encoder.encode(obj);
}
export function decode(buf) {
    return cborXdecode(buf);
}

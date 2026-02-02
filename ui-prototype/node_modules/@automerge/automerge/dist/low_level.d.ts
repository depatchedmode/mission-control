import type { API } from "./wasm_types.js";
export type { ChangeToEncode } from "./wasm_types.js";
export declare function UseApi(api: API): void;
export declare const ApiHandler: API;
/**
 * Initialize the wasm module
 *
 * @param wasmBlob - The wasm module as a Uint8Array, Request, Promise<Uint8Array> or string. If this argument is a string then it is assumed to be a URL and the library will attempt to fetch the wasm module from that URL.
 *
 * @remarks
 * If you are using the `/slim` subpath export then this function must be
 * called before any other functions in the library. If you are using any of
 * the other subpath exports then it will have already been called for you.
 */
export declare function initializeWasm(wasmBlob: Uint8Array | Request | Promise<Uint8Array> | string): Promise<void>;
/**
 * Initialize the wasm module from a base64 encoded string
 *
 * @param wasmBase64 - The bytes of the wasm file as a base64 encoded string
 */
export declare function initializeBase64Wasm(wasmBase64: string): Promise<void>;
/**
 * A promise which resolves when the web assembly module has been initialized
 * (or immediately if it has already been initialized)
 */
export declare function wasmInitialized(): Promise<void>;
/**
 * Check if the wasm module has been initialized
 *
 * @returns true if the wasm module has been initialized
 */
export declare function isWasmInitialized(): boolean;

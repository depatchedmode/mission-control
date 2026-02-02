
    import { automergeWasmBase64 } from "./automerge_wasm_bg_base64.js";
    import { initSync } from "./automerge_wasm.js";
    const wasmBlob = Uint8Array.from(atob(automergeWasmBase64), c => c.charCodeAt(0));
    initSync(wasmBlob);
    export * from "./automerge_wasm.js";
    
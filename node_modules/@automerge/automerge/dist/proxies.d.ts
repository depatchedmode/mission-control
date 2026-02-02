import type { Automerge, ObjID, Prop } from "./wasm_types.js";
import type { MapValue, ListValue } from "./types.js";
import { Counter } from "./counter.js";
import { ImmutableString } from "./immutable_string.js";
export declare function mapProxy(context: Automerge, objectId: ObjID, path: Prop[]): MapValue;
export declare function listProxy(context: Automerge, objectId: ObjID, path: Prop[]): ListValue;
export declare function rootProxy<T>(context: Automerge): T;
export declare function isImmutableString(obj: any): obj is ImmutableString;
export declare function isCounter(obj: any): obj is Counter;

import { AutomergeValue } from "./types.js";
import type { Automerge, Prop, ObjID } from "./wasm_types.js";
export type Conflicts = {
    [key: string]: AutomergeValue;
};
/**
 * The conflicting values at a particular property in an object
 *
 * The return value of this function is a map. The values of the map are the
 * conflicting values and the keys are the op IDs which set those values. Most of
 * the time all you care about is the values.
 *
 * One important note is that the return type of this function differs based on
 * whether we are inside a change callback or not. Inside a change callback we
 * return proxies, just like anywhere else in the document. This allows the user to
 * make changes inside a conflicted value without being forced to first resolve the
 * conflict. Outside of a change callback we return frozen POJOs.
 *
 * @param context The underlying automerge-wasm document
 * @param objectId The object ID within which we are looking up conflicts
 * @param prop The property inside the object which we are looking up conflicts for
 * @param withinChangeCallback Whether we are inside a currently running change callback
 *
 * @returns A map from op ID to the value for that op ID
 */
export declare function conflictAt(context: Automerge, objectId: ObjID, prop: Prop, withinChangeCallback: boolean): Conflicts | undefined;

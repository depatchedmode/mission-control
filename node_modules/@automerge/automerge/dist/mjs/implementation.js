var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { isImmutableString, rootProxy } from "./proxies.js";
export { isImmutableString, isCounter } from "./proxies.js";
import { STATE } from "./constants.js";
import { Counter, } from "./types.js";
export { Counter, Int, Uint, Float64, } from "./types.js";
const _SyncStateSymbol = Symbol("_syncstate");
import { ApiHandler, UseApi } from "./low_level.js";
import { JS_GIT_HEAD } from "./generated/release-info.js";
export { initializeWasm, initializeBase64Wasm, wasmInitialized, isWasmInitialized, } from "./low_level.js";
import { ImmutableString } from "./immutable_string.js";
export { ImmutableString } from "./immutable_string.js";
import { _state, _is_proxy, _clear_cache, _trace, _obj, } from "./internal_state.js";
export { applyPatch, applyPatches } from "./apply_patches.js";
import { conflictAt } from "./conflicts.js";
/**
 * Function for use in {@link change} which inserts values into a list at a given index
 * @param list
 * @param index
 * @param values
 */
export function insertAt(list, index, ...values) {
    if (!_is_proxy(list)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    //eslint-disable-next-line no-extra-semi
    ;
    list.insertAt(index, ...values);
}
/**
 * Function for use in {@link change} which deletes values from a list at a given index
 * @param list
 * @param index
 * @param numDelete
 */
export function deleteAt(list, index, numDelete) {
    if (!_is_proxy(list)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    //eslint-disable-next-line no-extra-semi
    ;
    list.deleteAt(index, numDelete);
}
/** @hidden **/
export function use(api) {
    UseApi(api);
}
/** @hidden */
export function getBackend(doc) {
    return _state(doc).handle;
}
function importOpts(_actor) {
    if (typeof _actor === "object") {
        return _actor;
    }
    else {
        return { actor: _actor };
    }
}
export function getChangesSince(state, heads) {
    const n = _state(state);
    return n.handle.getChanges(heads);
}
export function getChangesMetaSince(state, heads) {
    const n = _state(state);
    return n.handle.getChangesMeta(heads);
}
function cursorToIndex(state, value, index) {
    if (typeof index == "string") {
        if (/^-?[0-9]+@[0-9a-zA-Z]+$|^[se]$/.test(index)) {
            return state.handle.getCursorPosition(value, index);
        }
        else {
            throw new RangeError("index must be a number or cursor");
        }
    }
    else {
        return index;
    }
}
/**
 * Create a new automerge document
 *
 * @typeParam T - The type of value contained in the document. This will be the
 *     type that is passed to the change closure in {@link change}
 * @param _opts - Either an actorId or an {@link InitOptions} (which may
 *     contain an actorId). If this is null the document will be initialised with a
 *     random actor ID
 */
export function init(_opts) {
    const opts = importOpts(_opts);
    const freeze = !!opts.freeze;
    const patchCallback = opts.patchCallback;
    const actor = opts.actor;
    const handle = ApiHandler.create({ actor });
    handle.enableFreeze(!!opts.freeze);
    registerDatatypes(handle);
    const doc = handle.materialize("/", undefined, {
        handle,
        heads: undefined,
        freeze,
        patchCallback,
    });
    return doc;
}
/**
 * Make an immutable view of an automerge document as at `heads`
 *
 * @remarks
 * The document returned from this function cannot be passed to {@link change}.
 * This is because it shares the same underlying memory as `doc`, but it is
 * consequently a very cheap copy.
 *
 * Note that this function will throw an error if any of the hashes in `heads`
 * are not in the document.
 *
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to create a view of
 * @param heads - The hashes of the heads to create a view at
 */
export function view(doc, heads) {
    const state = _state(doc);
    const handle = state.handle;
    return state.handle.materialize("/", heads, Object.assign(Object.assign({}, state), { handle,
        heads }));
}
/**
 * Make a full writable copy of an automerge document
 *
 * @remarks
 * Unlike {@link view} this function makes a full copy of the memory backing
 * the document and can thus be passed to {@link change}. It also generates a
 * new actor ID so that changes made in the new document do not create duplicate
 * sequence numbers with respect to the old document. If you need control over
 * the actor ID which is generated you can pass the actor ID as the second
 * argument
 *
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to clone
 * @param _opts - Either an actor ID to use for the new doc or an {@link InitOptions}
 */
export function clone(doc, _opts) {
    const state = _state(doc);
    const heads = state.heads;
    const opts = importOpts(_opts);
    const handle = state.handle.fork(opts.actor, heads);
    handle.updateDiffCursor();
    // `change` uses the presence of state.heads to determine if we are in a view
    // set it to undefined to indicate that this is a full fat document
    const { heads: _oldHeads } = state, stateSansHeads = __rest(state, ["heads"]);
    stateSansHeads.patchCallback = opts.patchCallback;
    return handle.applyPatches(doc, Object.assign(Object.assign({}, stateSansHeads), { handle }));
}
/** Explicity free the memory backing a document. Note that this is note
 * necessary in environments which support
 * [`FinalizationRegistry`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry)
 */
export function free(doc) {
    return _state(doc).handle.free();
}
/**
 * Create an automerge document from a POJO
 *
 * @param initialState - The initial state which will be copied into the document
 * @typeParam T - The type of the value passed to `from` _and_ the type the resulting document will contain
 * @typeParam actor - The actor ID of the resulting document, if this is null a random actor ID will be used
 *
 * @example
 * ```
 * const doc = automerge.from({
 *     tasks: [
 *         {description: "feed dogs", done: false}
 *     ]
 * })
 * ```
 */
export function from(initialState, _opts) {
    return _change(init(_opts), "from", {}, d => Object.assign(d, initialState))
        .newDoc;
}
/**
 * Update the contents of an automerge document
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to update
 * @param options - Either a message, an {@link ChangeOptions}, or a {@link ChangeFn}
 * @param callback - A `ChangeFn` to be used if `options` was a `string`
 *
 * Note that if the second argument is a function it will be used as the `ChangeFn` regardless of what the third argument is.
 *
 * @example A simple change
 * ```
 * let doc1 = automerge.init()
 * doc1 = automerge.change(doc1, d => {
 *     d.key = "value"
 * })
 * assert.equal(doc1.key, "value")
 * ```
 *
 * @example A change with a message
 *
 * ```
 * doc1 = automerge.change(doc1, "add another value", d => {
 *     d.key2 = "value2"
 * })
 * ```
 *
 * @example A change with a message and a timestamp
 *
 * ```
 * doc1 = automerge.change(doc1, {message: "add another value", time: 1640995200}, d => {
 *     d.key2 = "value2"
 * })
 * ```
 *
 * @example responding to a patch callback
 * ```
 * let patchedPath
 * let patchCallback = patch => {
 *    patchedPath = patch.path
 * }
 * doc1 = automerge.change(doc1, {message: "add another value", time: 1640995200, patchCallback}, d => {
 *     d.key2 = "value2"
 * })
 * assert.equal(patchedPath, ["key2"])
 * ```
 */
export function change(doc, options, callback) {
    if (typeof options === "function") {
        return _change(doc, "change", {}, options).newDoc;
    }
    else if (typeof callback === "function") {
        if (typeof options === "string") {
            options = { message: options };
        }
        return _change(doc, "change", options, callback).newDoc;
    }
    else {
        throw RangeError("Invalid args for change");
    }
}
/**
 * Make a change to the document as it was at a particular point in history
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to update
 * @param scope - The heads representing the point in history to make the change
 * @param options - Either a message or a {@link ChangeOptions} for the new change
 * @param callback - A `ChangeFn` to be used if `options` was a `string`
 *
 * @remarks
 * This function is similar to {@link change} but allows you to make changes to
 * the document as if it were at a particular point in time. To understand this
 * imagine a document created with the following history:
 *
 * ```ts
 * let doc = automerge.from({..})
 * doc = automerge.change(doc, () => {...})
 *
 * const heads = automerge.getHeads(doc)
 *
 * // fork the document make a change
 * let fork = automerge.fork(doc)
 * fork = automerge.change(fork, () => {...})
 * const headsOnFork = automerge.getHeads(fork)
 *
 * // make a change on the original doc
 * doc = automerge.change(doc, () => {...})
 * const headsOnOriginal = automerge.getHeads(doc)
 *
 * // now merge the changes back to the original document
 * doc = automerge.merge(doc, fork)
 *
 * // The heads of the document will now be (headsOnFork, headsOnOriginal)
 * ```
 *
 * {@link ChangeAt} produces an equivalent history, but without having to
 * create a fork of the document. In particular the `newHeads` field of the
 * returned {@link ChangeAtResult} will be the same as `headsOnFork`.
 *
 * Why would you want this? It's typically used in conjunction with {@link diff}
 * to reconcile state which is managed concurrently with the document. For
 * example, if you have a text editor component which the user is modifying
 * and you can't send the changes to the document synchronously you might follow
 * a workflow like this:
 *
 * * On initialization save the current heads of the document in the text editor state
 * * Every time the user makes a change record the change in the text editor state
 *
 * Now from time to time reconcile the editor state and the document
 * * Load the last saved heads from the text editor state, call them `oldHeads`
 * * Apply all the unreconciled changes to the document using `changeAt(doc, oldHeads, ...)`
 * * Get the diff from the resulting document to the current document using {@link diff}
 *   passing the {@link ChangeAtResult.newHeads} as the `before` argument and the
 *   heads of the entire document as the `after` argument.
 * * Apply the diff to the text editor state
 * * Save the current heads of the document in the text editor state
 */
export function changeAt(doc, scope, options, callback) {
    if (typeof options === "function") {
        return _change(doc, "changeAt", {}, options, scope);
    }
    else if (typeof callback === "function") {
        if (typeof options === "string") {
            options = { message: options };
        }
        return _change(doc, "changeAt", options, callback, scope);
    }
    else {
        throw RangeError("Invalid args for changeAt");
    }
}
function progressDocument(doc, source, heads, callback) {
    if (heads == null) {
        return doc;
    }
    const state = _state(doc);
    const nextState = Object.assign(Object.assign({}, state), { heads: undefined });
    const { value: nextDoc, patches } = state.handle.applyAndReturnPatches(doc, nextState);
    if (patches.length > 0) {
        if (callback != null) {
            callback(patches, { before: doc, after: nextDoc, source });
        }
        const newState = _state(nextDoc);
        newState.mostRecentPatch = {
            before: _state(doc).heads,
            after: newState.handle.getHeads(),
            patches,
        };
    }
    state.heads = heads;
    return nextDoc;
}
function _change(doc, source, options, callback, scope) {
    if (typeof callback !== "function") {
        throw new RangeError("invalid change function");
    }
    const state = _state(doc);
    if (doc === undefined || state === undefined) {
        throw new RangeError("must be the document root");
    }
    if (state.heads) {
        throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    let heads = state.handle.getHeads();
    if (scope && headsEqual(scope, heads)) {
        scope = undefined;
    }
    if (scope) {
        state.handle.isolate(scope);
        heads = scope;
    }
    if (!("time" in options)) {
        options.time = Math.floor(Date.now() / 1000);
    }
    try {
        state.heads = heads;
        const root = rootProxy(state.handle);
        callback(root);
        if (state.handle.pendingOps() === 0) {
            state.heads = undefined;
            if (scope) {
                state.handle.integrate();
            }
            return {
                newDoc: doc,
                newHeads: null,
            };
        }
        else {
            const newHead = state.handle.commit(options.message, options.time);
            state.handle.integrate();
            return {
                newDoc: progressDocument(doc, source, heads, options.patchCallback || state.patchCallback),
                newHeads: newHead != null ? [newHead] : null,
            };
        }
    }
    catch (e) {
        state.heads = undefined;
        state.handle.rollback();
        throw e;
    }
}
/**
 * Make a change to a document which does not modify the document
 *
 * @param doc - The doc to add the empty change to
 * @param options - Either a message or a {@link ChangeOptions} for the new change
 *
 * Why would you want to do this? One reason might be that you have merged
 * changes from some other peers and you want to generate a change which
 * depends on those merged changes so that you can sign the new change with all
 * of the merged changes as part of the new change.
 */
export function emptyChange(doc, options) {
    if (options === undefined) {
        options = {};
    }
    if (typeof options === "string") {
        options = { message: options };
    }
    if (!("time" in options)) {
        options.time = Math.floor(Date.now() / 1000);
    }
    const state = _state(doc);
    if (state.heads) {
        throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    const heads = state.handle.getHeads();
    state.handle.emptyChange(options.message, options.time);
    return progressDocument(doc, "emptyChange", heads);
}
/**
 * Load an automerge document from a compressed document produce by {@link save}
 *
 * @typeParam T - The type of the value which is contained in the document.
 *                Note that no validation is done to make sure this type is in
 *                fact the type of the contained value so be a bit careful
 * @param data  - The compressed document
 * @param _opts - Either an actor ID or some {@link InitOptions}, if the actor
 *                ID is null a random actor ID will be created
 *
 * Note that `load` will throw an error if passed incomplete content (for
 * example if you are receiving content over the network and don't know if you
 * have the complete document yet). If you need to handle incomplete content use
 * {@link init} followed by {@link loadIncremental}.
 */
export function load(data, _opts) {
    const opts = importOpts(_opts);
    if (opts.patchCallback) {
        return loadIncremental(init(opts), data);
    }
    const actor = opts.actor;
    const patchCallback = opts.patchCallback;
    const unchecked = opts.unchecked || false;
    const allowMissingDeps = opts.allowMissingChanges || false;
    const convertImmutableStringsToText = opts.convertImmutableStringsToText || false;
    const handle = ApiHandler.load(data, {
        actor,
        unchecked,
        allowMissingDeps,
        convertImmutableStringsToText,
    });
    handle.enableFreeze(!!opts.freeze);
    registerDatatypes(handle);
    const doc = handle.materialize("/", undefined, {
        handle,
        heads: undefined,
        patchCallback,
    });
    return doc;
}
/**
 * Load changes produced by {@link saveIncremental}, or partial changes
 *
 * @typeParam T - The type of the value which is contained in the document.
 *                Note that no validation is done to make sure this type is in
 *                fact the type of the contained value so be a bit careful
 * @param data  - The compressedchanges
 * @param opts  - an {@link ApplyOptions}
 *
 * This function is useful when staying up to date with a connected peer.
 * Perhaps the other end sent you a full compresed document which you loaded
 * with {@link load} and they're sending you the result of
 * {@link getLastLocalChange} every time they make a change.
 *
 * Note that this function will succesfully load the results of {@link save} as
 * well as {@link getLastLocalChange} or any other incremental change.
 */
export function loadIncremental(doc, data, opts) {
    if (!opts) {
        opts = {};
    }
    const state = _state(doc);
    if (state.heads) {
        throw new RangeError("Attempting to change an out of date document - set at: " + _trace(doc));
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    const heads = state.handle.getHeads();
    state.handle.loadIncremental(data);
    return progressDocument(doc, "loadIncremental", heads, opts.patchCallback || state.patchCallback);
}
/**
 * Create binary save data to be appended to a save file or fed into {@link loadIncremental}
 *
 * @typeParam T - The type of the value which is contained in the document.
 *                Note that no validation is done to make sure this type is in
 *                fact the type of the contained value so be a bit careful
 *
 * This function is useful for incrementally saving state.  The data can be appended to a
 * automerge save file, or passed to a document replicating its state.
 *
 */
export function saveIncremental(doc) {
    const state = _state(doc);
    if (state.heads) {
        throw new RangeError("Attempting to change an out of date document - set at: " + _trace(doc));
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    return state.handle.saveIncremental();
}
/**
 * Export the contents of a document to a compressed format
 *
 * @param doc - The doc to save
 *
 * The returned bytes can be passed to {@link load} or {@link loadIncremental}
 */
export function save(doc) {
    return _state(doc).handle.save();
}
/**
 * Merge `remote` into `local`
 * @typeParam T - The type of values contained in each document
 * @param local - The document to merge changes into
 * @param remote - The document to merge changes from
 *
 * @returns - The merged document
 *
 * Often when you are merging documents you will also need to clone them. Both
 * arguments to `merge` are frozen after the call so you can no longer call
 * mutating methods (such as {@link change}) on them. The symtom of this will be
 * an error which says "Attempting to change an out of date document". To
 * overcome this call {@link clone} on the argument before passing it to {@link
 * merge}.
 */
export function merge(local, remote) {
    const localState = _state(local);
    if (localState.heads) {
        throw new RangeError("Attempting to change an out of date document - set at: " + _trace(local));
    }
    const heads = localState.handle.getHeads();
    const remoteState = _state(remote);
    const changes = localState.handle.getChangesAdded(remoteState.handle);
    localState.handle.applyChanges(changes);
    return progressDocument(local, "merge", heads, localState.patchCallback);
}
/**
 * Get the actor ID associated with the document
 */
export function getActorId(doc) {
    const state = _state(doc);
    return state.handle.getActorId();
}
/**
 * Get the conflicts associated with a property
 *
 * The values of properties in a map in automerge can be conflicted if there
 * are concurrent "put" operations to the same key. Automerge chooses one value
 * arbitrarily (but deterministically, any two nodes who have the same set of
 * changes will choose the same value) from the set of conflicting values to
 * present as the value of the key.
 *
 * Sometimes you may want to examine these conflicts, in this case you can use
 * {@link getConflicts} to get the conflicts for the key.
 *
 * @example
 * ```
 * import * as automerge from "@automerge/automerge"
 *
 * type Profile = {
 *     pets: Array<{name: string, type: string}>
 * }
 *
 * let doc1 = automerge.init<Profile>("aaaa")
 * doc1 = automerge.change(doc1, d => {
 *     d.pets = [{name: "Lassie", type: "dog"}]
 * })
 * let doc2 = automerge.init<Profile>("bbbb")
 * doc2 = automerge.merge(doc2, automerge.clone(doc1))
 *
 * doc2 = automerge.change(doc2, d => {
 *     d.pets[0].name = "Beethoven"
 * })
 *
 * doc1 = automerge.change(doc1, d => {
 *     d.pets[0].name = "Babe"
 * })
 *
 * const doc3 = automerge.merge(doc1, doc2)
 *
 * // Note that here we pass `doc3.pets`, not `doc3`
 * let conflicts = automerge.getConflicts(doc3.pets[0], "name")
 *
 * // The two conflicting values are the keys of the conflicts object
 * assert.deepEqual(Object.values(conflicts), ["Babe", Beethoven"])
 * ```
 */
export function getConflicts(doc, prop) {
    const state = _state(doc, false);
    const objectId = _obj(doc);
    if (objectId != null) {
        const withinChangeCallback = _is_proxy(doc);
        return conflictAt(state.handle, objectId, prop, withinChangeCallback);
    }
    else {
        return undefined;
    }
}
/**
 * Get the binary representation of the last change which was made to this doc
 *
 * This is most useful when staying in sync with other peers, every time you
 * make a change locally via {@link change} you immediately call {@link
 * getLastLocalChange} and send the result over the network to other peers.
 */
export function getLastLocalChange(doc) {
    const state = _state(doc);
    return state.handle.getLastLocalChange() || undefined;
}
/**
 * Return the object ID of an arbitrary javascript value
 *
 * This is useful to determine if something is actually an automerge document,
 * if `doc` is not an automerge document this will return null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getObjectId(doc, prop) {
    if (prop) {
        const state = _state(doc, false);
        const objectId = _obj(doc);
        if (!state || !objectId) {
            return null;
        }
        return state.handle.get(objectId, prop);
    }
    else {
        return _obj(doc);
    }
}
/**
 * Get the changes which are in `newState` but not in `oldState`. The returned
 * changes can be loaded in `oldState` via {@link applyChanges}.
 *
 * Note that this will crash if there are changes in `oldState` which are not in `newState`.
 */
export function getChanges(oldState, newState) {
    const n = _state(newState);
    return n.handle.getChanges(getHeads(oldState));
}
/**
 * Get all the changes in a document
 *
 * This is different to {@link save} because the output is an array of changes
 * which can be individually applied via {@link applyChanges}`
 *
 */
export function getAllChanges(doc) {
    const state = _state(doc);
    return state.handle.getChanges([]);
}
/**
 * Apply changes received from another document
 *
 * `doc` will be updated to reflect the `changes`. If there are changes which
 * we do not have dependencies for yet those will be stored in the document and
 * applied when the depended on changes arrive.
 *
 * You can use the {@link ApplyOptions} to pass a patchcallback which will be
 * informed of any changes which occur as a result of applying the changes
 *
 */
export function applyChanges(doc, changes, opts) {
    const state = _state(doc);
    if (!opts) {
        opts = {};
    }
    if (state.heads) {
        throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    const heads = state.handle.getHeads();
    state.handle.applyChanges(changes);
    state.heads = heads;
    return [
        progressDocument(doc, "applyChanges", heads, opts.patchCallback || state.patchCallback),
    ];
}
/** @hidden */
export function getHistory(doc) {
    const history = getAllChanges(doc);
    return history.map((change, index) => ({
        get change() {
            return decodeChange(change);
        },
        get snapshot() {
            const [state] = applyChanges(init(), history.slice(0, index + 1));
            return state;
        },
    }));
}
/**
 * Create a set of patches representing the change from one set of heads to another
 *
 * If either of the heads are missing from the document the returned set of patches will be empty
 */
export function diff(doc, before, after) {
    checkHeads(before, "before heads");
    checkHeads(after, "after heads");
    const state = _state(doc);
    if (state.mostRecentPatch &&
        equals(state.mostRecentPatch.before, before) &&
        equals(state.mostRecentPatch.after, after)) {
        return state.mostRecentPatch.patches;
    }
    return state.handle.diff(before, after);
}
/**
 * Create a set of patches representing the change from one set of heads to another at a given path
 * @experimental
 * @param doc - The document to update
 * @param path - path of the object to diff
 * @param before - before Heads for the diff
 * @param after - after Heads for the diff
 * @param opts - Options is { recursive: bool } to diff sub objects as well.  Default is true
 *
 * This is an experimental API
 */
export function diffPath(doc, path, before, after, opts) {
    checkHeads(before, "before");
    checkHeads(after, "after");
    const state = _state(doc);
    const objPath = absoluteObjPath(doc, path, "diff");
    return state.handle.diffPath(objPath, before, after, opts);
}
function headsEqual(heads1, heads2) {
    if (heads1.length !== heads2.length) {
        return false;
    }
    for (let i = 0; i < heads1.length; i++) {
        if (heads1[i] !== heads2[i]) {
            return false;
        }
    }
    return true;
}
function checkHeads(heads, fieldname) {
    if (!Array.isArray(heads)) {
        throw new Error(`invalid ${fieldname}: must be an array`);
    }
}
/** @hidden */
// FIXME : no tests
// FIXME can we just use deep equals now?
export function equals(val1, val2) {
    if (!isObject(val1) || !isObject(val2))
        return val1 === val2;
    const keys1 = Object.keys(val1).sort(), keys2 = Object.keys(val2).sort();
    if (keys1.length !== keys2.length)
        return false;
    for (let i = 0; i < keys1.length; i++) {
        if (keys1[i] !== keys2[i])
            return false;
        if (!equals(val1[keys1[i]], val2[keys2[i]]))
            return false;
    }
    return true;
}
/**
 * encode a {@link SyncState} into binary to send over the network
 *
 * @group sync
 * */
export function encodeSyncState(state) {
    const sync = ApiHandler.importSyncState(state);
    const result = ApiHandler.encodeSyncState(sync);
    sync.free();
    return result;
}
/**
 * Decode some binary data into a {@link SyncState}
 *
 * @group sync
 */
export function decodeSyncState(state) {
    const sync = ApiHandler.decodeSyncState(state);
    const result = ApiHandler.exportSyncState(sync);
    sync.free();
    return result;
}
/**
 * Generate a sync message to send to the peer represented by `inState`
 * @param doc - The doc to generate messages about
 * @param inState - The {@link SyncState} representing the peer we are talking to
 *
 * @group sync
 *
 * @returns An array of `[newSyncState, syncMessage | null]` where
 * `newSyncState` should replace `inState` and `syncMessage` should be sent to
 * the peer if it is not null. If `syncMessage` is null then we are up to date.
 */
export function generateSyncMessage(doc, inState) {
    const state = _state(doc);
    const syncState = ApiHandler.importSyncState(inState);
    const message = state.handle.generateSyncMessage(syncState);
    const outState = ApiHandler.exportSyncState(syncState);
    return [outState, message];
}
/**
 * Update a document and our sync state on receiving a sync message
 *
 * @group sync
 *
 * @param doc     - The doc the sync message is about
 * @param inState - The {@link SyncState} for the peer we are communicating with
 * @param message - The message which was received
 * @param opts    - Any {@link ApplyOption}s, used for passing a
 *                  {@link PatchCallback} which will be informed of any changes
 *                  in `doc` which occur because of the received sync message.
 *
 * @returns An array of `[newDoc, newSyncState, null]` where
 * `newDoc` is the updated state of `doc`, `newSyncState` should replace
 * `inState`.
 *
 * @remarks Note that this function has three return values for legacy reasons.
 * The third value used to be a sync message to send back but this is now
 * always null and you should instead call `generateSyncMessage` after calling
 * `receiveSyncMessage` to see if there are new messages to send.
 */
export function receiveSyncMessage(doc, inState, message, opts) {
    const syncState = ApiHandler.importSyncState(inState);
    if (!opts) {
        opts = {};
    }
    const state = _state(doc);
    if (state.heads) {
        throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
    }
    if (_is_proxy(doc)) {
        throw new RangeError("Calls to Automerge.change cannot be nested");
    }
    const heads = state.handle.getHeads();
    state.handle.receiveSyncMessage(syncState, message);
    const outSyncState = ApiHandler.exportSyncState(syncState);
    return [
        progressDocument(doc, "receiveSyncMessage", heads, opts.patchCallback || state.patchCallback),
        outSyncState,
        null,
    ];
}
/**
 * Check whether the replica represented by `remoteState` has all our changes
 *
 * @param doc - The doc to check whether the remote has changes for
 * @param remoteState - The {@link SyncState} representing the peer we are talking to
 *
 * @group sync
 *
 * @returns true if the remote has all of our changes
 */
export function hasOurChanges(doc, remoteState) {
    const state = _state(doc);
    const syncState = ApiHandler.importSyncState(remoteState);
    return state.handle.hasOurChanges(syncState);
}
/**
 * Create a new, blank {@link SyncState}
 *
 * When communicating with a peer for the first time use this to generate a new
 * {@link SyncState} for them
 *
 * @group sync
 */
export function initSyncState() {
    return ApiHandler.exportSyncState(ApiHandler.initSyncState());
}
/** @hidden */
export function encodeChange(change) {
    return ApiHandler.encodeChange(change);
}
/** @hidden */
export function decodeChange(data) {
    return ApiHandler.decodeChange(data);
}
/** @hidden */
export function encodeSyncMessage(message) {
    return ApiHandler.encodeSyncMessage(message);
}
/** @hidden */
export function decodeSyncMessage(message) {
    return ApiHandler.decodeSyncMessage(message);
}
/**
 * Get any changes in `doc` which are not dependencies of `heads`
 */
export function getMissingDeps(doc, heads) {
    const state = _state(doc);
    return state.handle.getMissingDeps(heads);
}
/**
 * Get the hashes of the heads of this document
 */
export function getHeads(doc) {
    const state = _state(doc);
    return state.heads || state.handle.getHeads();
}
/** @hidden */
export function dump(doc) {
    const state = _state(doc);
    state.handle.dump();
}
/** @hidden */
export function toJS(doc) {
    const state = _state(doc);
    const enabled = state.handle.enableFreeze(false);
    const result = state.handle.materialize("/", state.heads);
    state.handle.enableFreeze(enabled);
    return result;
}
export function isAutomerge(doc) {
    if (typeof doc == "object" && doc !== null) {
        return getObjectId(doc) === "_root" && !!Reflect.get(doc, STATE);
    }
    else {
        return false;
    }
}
function isObject(obj) {
    return typeof obj === "object" && obj !== null;
}
export function saveSince(doc, heads) {
    const state = _state(doc);
    const result = state.handle.saveSince(heads);
    return result;
}
/**
 * Returns true if the document has all of the given heads somewhere in its history
 */
export function hasHeads(doc, heads) {
    const state = _state(doc);
    for (const hash of heads) {
        if (!state.handle.getChangeByHash(hash)) {
            return false;
        }
    }
    return true;
}
function registerDatatypes(handle) {
    handle.registerDatatype("counter", (n) => new Counter(n), n => {
        if (n instanceof Counter) {
            return n.value;
        }
    });
    handle.registerDatatype("str", (n) => {
        return new ImmutableString(n);
    }, s => {
        if (isImmutableString(s)) {
            return s.val;
        }
    });
}
/**
 * @hidden
 */
export function topoHistoryTraversal(doc) {
    const state = _state(doc);
    return state.handle.topoHistoryTraversal();
}
/**
 * Decode a change hash into the details of this change
 *
 * This should be considered a semi-stable API. We try not to change the
 * encoding in backwards incompatible ways but we won't bump a major version if
 * we do have to change it
 */
export function inspectChange(doc, changeHash) {
    const state = _state(doc);
    return state.handle.getDecodedChangeByHash(changeHash);
}
/**
 * Return some internal statistics about the document
 */
export function stats(doc) {
    var _a, _b, _c, _d, _e, _f;
    const state = _state(doc);
    const wasmStats = state.handle.stats();
    const release = releaseInfo();
    return Object.assign(Object.assign({}, wasmStats), { cargoPackageName: (_b = (_a = release.wasm) === null || _a === void 0 ? void 0 : _a.cargoPackageName) !== null && _b !== void 0 ? _b : "unknown", cargoPackageVersion: (_d = (_c = release.wasm) === null || _c === void 0 ? void 0 : _c.cargoPackageVersion) !== null && _d !== void 0 ? _d : "unknown", rustcVersion: (_f = (_e = release.wasm) === null || _e === void 0 ? void 0 : _e.rustcVersion) !== null && _f !== void 0 ? _f : "unknown" });
}
/**
 * Get release information about the automerge library.
 *
 * Returns metadata about both the JavaScript wrapper and the WebAssembly
 * module, including git commit hashes. If js.gitHead !== wasm.gitHead,
 * the JS and WASM were built from different commits.
 *
 * If the WASM module has not been initialized, wasm will be null.
 */
export function releaseInfo() {
    let wasm = null;
    try {
        wasm = ApiHandler.wasmReleaseInfo();
    }
    catch (_a) {
        // WASM not initialized - leave as null
    }
    return {
        js: {
            gitHead: JS_GIT_HEAD,
        },
        wasm,
    };
}
/**
 * Modify a string
 *
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to modify
 * @param path - The path to the string to modify
 * @param index - The position (as a {@link Cursor} or index) to edit.
 *   If a cursor is used then the edit happens such that the cursor will
 *   now point to the end of the newText, so you can continue to reuse
 *   the same cursor for multiple calls to splice.
 * @param del - The number of code units to delete, a positive number
 *   deletes N characters after the cursor, a negative number deletes
 *   N characters before the cursor.
 * @param newText - The string to insert (if any).
 */
export function splice(doc, path, index, del, newText) {
    const objPath = absoluteObjPath(doc, path, "splice");
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const state = _state(doc, false);
    _clear_cache(doc);
    index = cursorToIndex(state, objPath, index);
    try {
        return state.handle.splice(objPath, index, del, newText);
    }
    catch (e) {
        throw new RangeError(`Cannot splice: ${e}`);
    }
}
/**
 * Update the value of a string
 *
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document to modify
 * @param path - The path to the string to modify
 * @param newText - The new text to update the value to
 *
 * @remarks
 * This will calculate a diff between the current value and the new value and
 * then convert that diff into calls to {@link splice}. This will produce results
 * which don't merge as well as directly capturing the user input actions, but
 * sometimes it's not possible to capture user input and this is the best you
 * can do.
 *
 * This is an experimental API and may change in the future.
 *
 * @beta
 */
export function updateText(doc, path, newText) {
    const objPath = absoluteObjPath(doc, path, "updateText");
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const state = _state(doc, false);
    _clear_cache(doc);
    try {
        return state.handle.updateText(objPath, newText);
    }
    catch (e) {
        throw new RangeError(`Cannot updateText: ${e}`);
    }
}
/**
 * Return the text + block markers at a given path
 *
 * @remarks
 * Rich text in automerge is represented as a sequence of characters with block
 * markers appearing inline with the text, and inline formatting spans overlaid
 * on the whole sequence. Block markers are normal automerge maps, but they are
 * only visible via either the {@link block} function or the {@link spans}
 * function. This function returns the current state of the spans
 */
export function spans(doc, path) {
    const state = _state(doc, false);
    const objPath = absoluteObjPath(doc, path, "spans");
    try {
        return state.handle.spans(objPath, state.heads);
    }
    catch (e) {
        throw new RangeError(`Cannot splice: ${e}`);
    }
}
/**
 * Get the block marker at the given index
 */
export function block(doc, path, index) {
    const objPath = absoluteObjPath(doc, path, "splitBlock");
    const state = _state(doc, false);
    index = cursorToIndex(state, objPath, index);
    try {
        return state.handle.getBlock(objPath, index);
    }
    catch (e) {
        throw new RangeError(`Cannot get block: ${e}`);
    }
}
/**
 * Insert a new block marker at the given index
 */
export function splitBlock(doc, path, index, block) {
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const objPath = absoluteObjPath(doc, path, "splitBlock");
    const state = _state(doc, false);
    _clear_cache(doc);
    index = cursorToIndex(state, objPath, index);
    try {
        state.handle.splitBlock(objPath, index, block);
    }
    catch (e) {
        throw new RangeError(`Cannot splice: ${e}`);
    }
}
/**
 * Delete the block marker at the given index
 */
export function joinBlock(doc, path, index) {
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const objPath = absoluteObjPath(doc, path, "joinBlock");
    const state = _state(doc, false);
    _clear_cache(doc);
    index = cursorToIndex(state, objPath, index);
    try {
        state.handle.joinBlock(objPath, index);
    }
    catch (e) {
        throw new RangeError(`Cannot joinBlock: ${e}`);
    }
}
/**
 * Update the block marker at the given index
 */
export function updateBlock(doc, path, index, block) {
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const objPath = absoluteObjPath(doc, path, "updateBlock");
    const state = _state(doc, false);
    _clear_cache(doc);
    index = cursorToIndex(state, objPath, index);
    try {
        state.handle.updateBlock(objPath, index, block);
    }
    catch (e) {
        throw new RangeError(`Cannot updateBlock: ${e}`);
    }
}
/**
 * Update the spans at the given path
 *
 * @remarks
 * Like {@link updateText} this will diff `newSpans` against the current state
 * of the text at `path` and perform a reasonably minimal number of operations
 * required to update the spans to the new state.
 *
 * When updating spans, we need to know what to set the "expand" behavior of
 * newly created marks to. By default we set it to "both", meaning that the
 * spans will expand on either, but this can be overridden by passing
 * `{ defaultExpand: "<expand>"}` as the final `config` parameter. You
 * can also pass `{perMarkExpand: {"<markname>": "<expand config>"}` to
 * set the expand configuration for specific marks where it should be
 * different from the default.
 */
export function updateSpans(doc, path, newSpans, config) {
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const objPath = absoluteObjPath(doc, path, "updateSpans");
    const state = _state(doc, false);
    _clear_cache(doc);
    try {
        state.handle.updateSpans(objPath, newSpans, config);
    }
    catch (e) {
        throw new RangeError(`Cannot updateSpans: ${e}`);
    }
}
/**
 * Returns a cursor for the given position in a string.
 *
 * @remarks
 * A cursor represents a relative position, "before character X",
 * rather than an absolute position. As the document is edited, the
 * cursor remains stable relative to its context, just as you'd expect
 * from a cursor in a concurrent text editor.
 *
 * The string representation is shareable, and so you can use this both
 * to edit the document yourself (using {@link splice}) or to share multiple
 * collaborator's current cursor positions over the network.
 *
 * The cursor's `position` can be an index in the string, `'start'` or `'end'`.
 * - `'start'` ensures this cursor always resolves to `0`
 * - `'end'` ensures this cursor always resolves to `string.length`
 *
 * Start cursors can be created by passing any negative number in `position`.
 *
 * End cursors can be created by passing a number `>= string.length` in `position`.
 *
 * `move` determines the position the cursor resolves to if the character at
 * `index` is removed:
 * - `'after'` causes the cursor to resolve towards `string.length`
 * - `'before'` causes the cursor to resolve towards `0`
 *
 * `move` is `'after'` by default.
 *
 * @typeParam T - The type of the value contained in the document
 * @param doc - The document
 * @param path - The path to the string
 * @param position - The position of the cursor, either an index, `'start'` or `'end'`
 * @param move - The direction the cursor should resolve to, defaults to 'after'
 */
export function getCursor(doc, path, position, move) {
    const objPath = absoluteObjPath(doc, path, "getCursor");
    const state = _state(doc, false);
    try {
        return state.handle.getCursor(objPath, position, state.heads, move);
    }
    catch (e) {
        throw new RangeError(`Cannot getCursor: ${e}`);
    }
}
/**
 * Returns the current index of the cursor.
 *
 * @typeParam T - The type of the value contained in the document
 *
 * @param doc - The document
 * @param path - The path to the string
 * @param index - The cursor
 */
export function getCursorPosition(doc, path, cursor) {
    const objPath = absoluteObjPath(doc, path, "getCursorPosition");
    const state = _state(doc, false);
    try {
        return state.handle.getCursorPosition(objPath, cursor, state.heads);
    }
    catch (e) {
        throw new RangeError(`Cannot getCursorPosition: ${e}`);
    }
}
export function mark(doc, path, range, name, value) {
    const objPath = absoluteObjPath(doc, path, "mark");
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const state = _state(doc, false);
    try {
        return state.handle.mark(objPath, range, name, value);
    }
    catch (e) {
        throw new RangeError(`Cannot mark: ${e}`);
    }
}
export function unmark(doc, path, range, name) {
    const objPath = absoluteObjPath(doc, path, "unmark");
    if (!_is_proxy(doc)) {
        throw new RangeError("object cannot be modified outside of a change block");
    }
    const state = _state(doc, false);
    try {
        return state.handle.unmark(objPath, range, name);
    }
    catch (e) {
        throw new RangeError(`Cannot unmark: ${e}`);
    }
}
export function marks(doc, path) {
    const objPath = absoluteObjPath(doc, path, "marks");
    const state = _state(doc, false);
    try {
        return state.handle.marks(objPath);
    }
    catch (e) {
        throw new RangeError(`Cannot call marks(): ${e}`);
    }
}
export function marksAt(doc, path, index) {
    const objPath = absoluteObjPath(doc, path, "marksAt");
    const state = _state(doc, false);
    try {
        return state.handle.marksAt(objPath, index);
    }
    catch (e) {
        throw new RangeError(`Cannot call marksAt(): ${e}`);
    }
}
function absoluteObjPath(doc, path, functionName) {
    path = path.slice();
    const objectId = _obj(doc);
    if (!objectId) {
        throw new RangeError(`invalid object for ${functionName}`);
    }
    path.unshift(objectId);
    return path.join("/");
}
/**
 * @deprecated This method has been renamed to {@link isImmutableString}
 */
export const isRawString = isImmutableString;
/**
 * @deprecated This type has been renamed to {@link ImmutableString}
 */
export const RawString = ImmutableString;
/**
 * EXPERIMENTAL: save a bundle of changes from a document to an encoded form
 * @experimental
 * @param doc - The document containing the changes to save
 * @param hashes - The hashes of the changes to save to a bundle
 * @returns
 */
export function saveBundle(doc, hashes) {
    const state = _state(doc, false);
    return state.handle.saveBundle(hashes);
}
/**
 * EXPERIMENTAL: Load a bundle of changes to examine them
 * @experimental
 * @param bundle - The encoded bundle to read
 */
export function readBundle(bundle) {
    return ApiHandler.readBundle(bundle);
}

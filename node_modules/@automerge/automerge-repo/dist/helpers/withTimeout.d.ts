/**
 * If `promise` is resolved before `t` ms elapse, the timeout is cleared and the result of the
 * promise is returned. If the timeout ends first, a `TimeoutError` is thrown.
 */
export declare const withTimeout: <T>(promise: Promise<T>, t: number) => Promise<T>;
export declare class TimeoutError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=withTimeout.d.ts.map
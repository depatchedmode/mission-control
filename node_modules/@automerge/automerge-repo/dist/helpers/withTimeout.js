/* c8 ignore start */
/**
 * If `promise` is resolved before `t` ms elapse, the timeout is cleared and the result of the
 * promise is returned. If the timeout ends first, a `TimeoutError` is thrown.
 */
export const withTimeout = async (promise, t) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new TimeoutError(`withTimeout: timed out after ${t}ms`)), t);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        clearTimeout(timeoutId);
    }
};
export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = "TimeoutError";
    }
}
/* c8 ignore end */

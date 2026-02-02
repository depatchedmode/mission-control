/** throttle( callback, rate )
 * Returns a throttle function with a build in debounce timer that runs after `wait` ms.
 *
 * Note that the args go inside the parameter and you should be careful not to
 * recreate the function on each usage. (In React, see useMemo().)
 *
 *
 * Example usage:
 * const callback = throttle((ev) => { doSomethingExpensiveOrOccasional() }, 100)
 * target.addEventListener('frequent-event', callback);
 *
 */
export const throttle = (fn, rate) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...args);
        }, rate);
    };
};

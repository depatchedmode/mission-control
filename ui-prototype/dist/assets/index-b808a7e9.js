(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);
        new MutationObserver((s)=>{
            for (const o of s)if (o.type === "childList") for (const i of o.addedNodes)i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function n(s) {
            const o = {};
            return s.integrity && (o.integrity = s.integrity), s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? o.credentials = "include" : s.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin", o;
        }
        function r(s) {
            if (s.ep) return;
            s.ep = !0;
            const o = n(s);
            fetch(s.href, o);
        }
    })();
    var C_ = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
    function fc(e) {
        return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
    }
    var $h = {
        exports: {}
    }, ga = {}, Vh = {
        exports: {}
    }, oe = {};
    var jo = Symbol.for("react.element"), E_ = Symbol.for("react.portal"), I_ = Symbol.for("react.fragment"), A_ = Symbol.for("react.strict_mode"), O_ = Symbol.for("react.profiler"), T_ = Symbol.for("react.provider"), j_ = Symbol.for("react.context"), M_ = Symbol.for("react.forward_ref"), R_ = Symbol.for("react.suspense"), P_ = Symbol.for("react.memo"), D_ = Symbol.for("react.lazy"), $f = Symbol.iterator;
    function L_(e) {
        return e === null || typeof e != "object" ? null : (e = $f && e[$f] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    var Wh = {
        isMounted: function() {
            return !1;
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
    }, Kh = Object.assign, Gh = {};
    function bs(e, t, n) {
        this.props = e, this.context = t, this.refs = Gh, this.updater = n || Wh;
    }
    bs.prototype.isReactComponent = {};
    bs.prototype.setState = function(e, t) {
        if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, e, t, "setState");
    };
    bs.prototype.forceUpdate = function(e) {
        this.updater.enqueueForceUpdate(this, e, "forceUpdate");
    };
    function Qh() {}
    Qh.prototype = bs.prototype;
    function dc(e, t, n) {
        this.props = e, this.context = t, this.refs = Gh, this.updater = n || Wh;
    }
    var hc = dc.prototype = new Qh;
    hc.constructor = dc;
    Kh(hc, bs.prototype);
    hc.isPureReactComponent = !0;
    var Vf = Array.isArray, Jh = Object.prototype.hasOwnProperty, pc = {
        current: null
    }, Yh = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
    };
    function Xh(e, t, n) {
        var r, s = {}, o = null, i = null;
        if (t != null) for(r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (o = "" + t.key), t)Jh.call(t, r) && !Yh.hasOwnProperty(r) && (s[r] = t[r]);
        var a = arguments.length - 2;
        if (a === 1) s.children = n;
        else if (1 < a) {
            for(var l = Array(a), f = 0; f < a; f++)l[f] = arguments[f + 2];
            s.children = l;
        }
        if (e && e.defaultProps) for(r in a = e.defaultProps, a)s[r] === void 0 && (s[r] = a[r]);
        return {
            $$typeof: jo,
            type: e,
            key: o,
            ref: i,
            props: s,
            _owner: pc.current
        };
    }
    function U_(e, t) {
        return {
            $$typeof: jo,
            type: e.type,
            key: t,
            ref: e.ref,
            props: e.props,
            _owner: e._owner
        };
    }
    function gc(e) {
        return typeof e == "object" && e !== null && e.$$typeof === jo;
    }
    function F_(e) {
        var t = {
            "=": "=0",
            ":": "=2"
        };
        return "$" + e.replace(/[=:]/g, function(n) {
            return t[n];
        });
    }
    var Wf = /\/+/g;
    function Ja(e, t) {
        return typeof e == "object" && e !== null && e.key != null ? F_("" + e.key) : t.toString(36);
    }
    function pi(e, t, n, r, s) {
        var o = typeof e;
        (o === "undefined" || o === "boolean") && (e = null);
        var i = !1;
        if (e === null) i = !0;
        else switch(o){
            case "string":
            case "number":
                i = !0;
                break;
            case "object":
                switch(e.$$typeof){
                    case jo:
                    case E_:
                        i = !0;
                }
        }
        if (i) return i = e, s = s(i), e = r === "" ? "." + Ja(i, 0) : r, Vf(s) ? (n = "", e != null && (n = e.replace(Wf, "$&/") + "/"), pi(s, t, n, "", function(f) {
            return f;
        })) : s != null && (gc(s) && (s = U_(s, n + (!s.key || i && i.key === s.key ? "" : ("" + s.key).replace(Wf, "$&/") + "/") + e)), t.push(s)), 1;
        if (i = 0, r = r === "" ? "." : r + ":", Vf(e)) for(var a = 0; a < e.length; a++){
            o = e[a];
            var l = r + Ja(o, a);
            i += pi(o, t, n, l, s);
        }
        else if (l = L_(e), typeof l == "function") for(e = l.call(e), a = 0; !(o = e.next()).done;)o = o.value, l = r + Ja(o, a++), i += pi(o, t, n, l, s);
        else if (o === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
        return i;
    }
    function Bo(e, t, n) {
        if (e == null) return e;
        var r = [], s = 0;
        return pi(e, r, "", "", function(o) {
            return t.call(n, o, s++);
        }), r;
    }
    function z_(e) {
        if (e._status === -1) {
            var t = e._result;
            t = t(), t.then(function(n) {
                (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
            }, function(n) {
                (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
            }), e._status === -1 && (e._status = 0, e._result = t);
        }
        if (e._status === 1) return e._result.default;
        throw e._result;
    }
    var it = {
        current: null
    }, gi = {
        transition: null
    }, H_ = {
        ReactCurrentDispatcher: it,
        ReactCurrentBatchConfig: gi,
        ReactCurrentOwner: pc
    };
    function Zh() {
        throw Error("act(...) is not supported in production builds of React.");
    }
    oe.Children = {
        map: Bo,
        forEach: function(e, t, n) {
            Bo(e, function() {
                t.apply(this, arguments);
            }, n);
        },
        count: function(e) {
            var t = 0;
            return Bo(e, function() {
                t++;
            }), t;
        },
        toArray: function(e) {
            return Bo(e, function(t) {
                return t;
            }) || [];
        },
        only: function(e) {
            if (!gc(e)) throw Error("React.Children.only expected to receive a single React element child.");
            return e;
        }
    };
    oe.Component = bs;
    oe.Fragment = I_;
    oe.Profiler = O_;
    oe.PureComponent = dc;
    oe.StrictMode = A_;
    oe.Suspense = R_;
    oe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = H_;
    oe.act = Zh;
    oe.cloneElement = function(e, t, n) {
        if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
        var r = Kh({}, e.props), s = e.key, o = e.ref, i = e._owner;
        if (t != null) {
            if (t.ref !== void 0 && (o = t.ref, i = pc.current), t.key !== void 0 && (s = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
            for(l in t)Jh.call(t, l) && !Yh.hasOwnProperty(l) && (r[l] = t[l] === void 0 && a !== void 0 ? a[l] : t[l]);
        }
        var l = arguments.length - 2;
        if (l === 1) r.children = n;
        else if (1 < l) {
            a = Array(l);
            for(var f = 0; f < l; f++)a[f] = arguments[f + 2];
            r.children = a;
        }
        return {
            $$typeof: jo,
            type: e.type,
            key: s,
            ref: o,
            props: r,
            _owner: i
        };
    };
    oe.createContext = function(e) {
        return e = {
            $$typeof: j_,
            _currentValue: e,
            _currentValue2: e,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
            _defaultValue: null,
            _globalName: null
        }, e.Provider = {
            $$typeof: T_,
            _context: e
        }, e.Consumer = e;
    };
    oe.createElement = Xh;
    oe.createFactory = function(e) {
        var t = Xh.bind(null, e);
        return t.type = e, t;
    };
    oe.createRef = function() {
        return {
            current: null
        };
    };
    oe.forwardRef = function(e) {
        return {
            $$typeof: M_,
            render: e
        };
    };
    oe.isValidElement = gc;
    oe.lazy = function(e) {
        return {
            $$typeof: D_,
            _payload: {
                _status: -1,
                _result: e
            },
            _init: z_
        };
    };
    oe.memo = function(e, t) {
        return {
            $$typeof: P_,
            type: e,
            compare: t === void 0 ? null : t
        };
    };
    oe.startTransition = function(e) {
        var t = gi.transition;
        gi.transition = {};
        try {
            e();
        } finally{
            gi.transition = t;
        }
    };
    oe.unstable_act = Zh;
    oe.useCallback = function(e, t) {
        return it.current.useCallback(e, t);
    };
    oe.useContext = function(e) {
        return it.current.useContext(e);
    };
    oe.useDebugValue = function() {};
    oe.useDeferredValue = function(e) {
        return it.current.useDeferredValue(e);
    };
    oe.useEffect = function(e, t) {
        return it.current.useEffect(e, t);
    };
    oe.useId = function() {
        return it.current.useId();
    };
    oe.useImperativeHandle = function(e, t, n) {
        return it.current.useImperativeHandle(e, t, n);
    };
    oe.useInsertionEffect = function(e, t) {
        return it.current.useInsertionEffect(e, t);
    };
    oe.useLayoutEffect = function(e, t) {
        return it.current.useLayoutEffect(e, t);
    };
    oe.useMemo = function(e, t) {
        return it.current.useMemo(e, t);
    };
    oe.useReducer = function(e, t, n) {
        return it.current.useReducer(e, t, n);
    };
    oe.useRef = function(e) {
        return it.current.useRef(e);
    };
    oe.useState = function(e) {
        return it.current.useState(e);
    };
    oe.useSyncExternalStore = function(e, t, n) {
        return it.current.useSyncExternalStore(e, t, n);
    };
    oe.useTransition = function() {
        return it.current.useTransition();
    };
    oe.version = "18.3.1";
    Vh.exports = oe;
    var Lt = Vh.exports;
    var N_ = Lt, B_ = Symbol.for("react.element"), $_ = Symbol.for("react.fragment"), V_ = Object.prototype.hasOwnProperty, W_ = N_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, K_ = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
    };
    function qh(e, t, n) {
        var r, s = {}, o = null, i = null;
        n !== void 0 && (o = "" + n), t.key !== void 0 && (o = "" + t.key), t.ref !== void 0 && (i = t.ref);
        for(r in t)V_.call(t, r) && !K_.hasOwnProperty(r) && (s[r] = t[r]);
        if (e && e.defaultProps) for(r in t = e.defaultProps, t)s[r] === void 0 && (s[r] = t[r]);
        return {
            $$typeof: B_,
            type: e,
            key: o,
            ref: i,
            props: s,
            _owner: W_.current
        };
    }
    ga.Fragment = $_;
    ga.jsx = qh;
    ga.jsxs = qh;
    $h.exports = ga;
    var ee = $h.exports, Nl = {}, e0 = {
        exports: {}
    }, kt = {}, t0 = {
        exports: {}
    }, n0 = {};
    (function(e) {
        function t(M, v) {
            var T = M.length;
            M.push(v);
            e: for(; 0 < T;){
                var z = T - 1 >>> 1, V = M[z];
                if (0 < s(V, v)) M[z] = v, M[T] = V, T = z;
                else break e;
            }
        }
        function n(M) {
            return M.length === 0 ? null : M[0];
        }
        function r(M) {
            if (M.length === 0) return null;
            var v = M[0], T = M.pop();
            if (T !== v) {
                M[0] = T;
                e: for(var z = 0, V = M.length, de = V >>> 1; z < de;){
                    var Ie = 2 * (z + 1) - 1, Mr = M[Ie], Yt = Ie + 1, Rr = M[Yt];
                    if (0 > s(Mr, T)) Yt < V && 0 > s(Rr, Mr) ? (M[z] = Rr, M[Yt] = T, z = Yt) : (M[z] = Mr, M[Ie] = T, z = Ie);
                    else if (Yt < V && 0 > s(Rr, T)) M[z] = Rr, M[Yt] = T, z = Yt;
                    else break e;
                }
            }
            return v;
        }
        function s(M, v) {
            var T = M.sortIndex - v.sortIndex;
            return T !== 0 ? T : M.id - v.id;
        }
        if (typeof performance == "object" && typeof performance.now == "function") {
            var o = performance;
            e.unstable_now = function() {
                return o.now();
            };
        } else {
            var i = Date, a = i.now();
            e.unstable_now = function() {
                return i.now() - a;
            };
        }
        var l = [], f = [], c = 1, u = null, h = 3, d = !1, p = !1, m = !1, x = typeof setTimeout == "function" ? setTimeout : null, w = typeof clearTimeout == "function" ? clearTimeout : null, _ = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function g(M) {
            for(var v = n(f); v !== null;){
                if (v.callback === null) r(f);
                else if (v.startTime <= M) r(f), v.sortIndex = v.expirationTime, t(l, v);
                else break;
                v = n(f);
            }
        }
        function A(M) {
            if (m = !1, g(M), !p) if (n(l) !== null) p = !0, I(P);
            else {
                var v = n(f);
                v !== null && k(A, v.startTime - M);
            }
        }
        function P(M, v) {
            p = !1, m && (m = !1, w(F), F = -1), d = !0;
            var T = h;
            try {
                for(g(v), u = n(l); u !== null && (!(u.expirationTime > v) || M && !se());){
                    var z = u.callback;
                    if (typeof z == "function") {
                        u.callback = null, h = u.priorityLevel;
                        var V = z(u.expirationTime <= v);
                        v = e.unstable_now(), typeof V == "function" ? u.callback = V : u === n(l) && r(l), g(v);
                    } else r(l);
                    u = n(l);
                }
                if (u !== null) var de = !0;
                else {
                    var Ie = n(f);
                    Ie !== null && k(A, Ie.startTime - v), de = !1;
                }
                return de;
            } finally{
                u = null, h = T, d = !1;
            }
        }
        var j = !1, N = null, F = -1, J = 5, K = -1;
        function se() {
            return !(e.unstable_now() - K < J);
        }
        function H() {
            if (N !== null) {
                var M = e.unstable_now();
                K = M;
                var v = !0;
                try {
                    v = N(!0, M);
                } finally{
                    v ? y() : (j = !1, N = null);
                }
            } else j = !1;
        }
        var y;
        if (typeof _ == "function") y = function() {
            _(H);
        };
        else if (typeof MessageChannel < "u") {
            var L = new MessageChannel, S = L.port2;
            L.port1.onmessage = H, y = function() {
                S.postMessage(null);
            };
        } else y = function() {
            x(H, 0);
        };
        function I(M) {
            N = M, j || (j = !0, y());
        }
        function k(M, v) {
            F = x(function() {
                M(e.unstable_now());
            }, v);
        }
        e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(M) {
            M.callback = null;
        }, e.unstable_continueExecution = function() {
            p || d || (p = !0, I(P));
        }, e.unstable_forceFrameRate = function(M) {
            0 > M || 125 < M ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : J = 0 < M ? Math.floor(1e3 / M) : 5;
        }, e.unstable_getCurrentPriorityLevel = function() {
            return h;
        }, e.unstable_getFirstCallbackNode = function() {
            return n(l);
        }, e.unstable_next = function(M) {
            switch(h){
                case 1:
                case 2:
                case 3:
                    var v = 3;
                    break;
                default:
                    v = h;
            }
            var T = h;
            h = v;
            try {
                return M();
            } finally{
                h = T;
            }
        }, e.unstable_pauseExecution = function() {}, e.unstable_requestPaint = function() {}, e.unstable_runWithPriority = function(M, v) {
            switch(M){
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                default:
                    M = 3;
            }
            var T = h;
            h = M;
            try {
                return v();
            } finally{
                h = T;
            }
        }, e.unstable_scheduleCallback = function(M, v, T) {
            var z = e.unstable_now();
            switch(typeof T == "object" && T !== null ? (T = T.delay, T = typeof T == "number" && 0 < T ? z + T : z) : T = z, M){
                case 1:
                    var V = -1;
                    break;
                case 2:
                    V = 250;
                    break;
                case 5:
                    V = 1073741823;
                    break;
                case 4:
                    V = 1e4;
                    break;
                default:
                    V = 5e3;
            }
            return V = T + V, M = {
                id: c++,
                callback: v,
                priorityLevel: M,
                startTime: T,
                expirationTime: V,
                sortIndex: -1
            }, T > z ? (M.sortIndex = T, t(f, M), n(l) === null && M === n(f) && (m ? (w(F), F = -1) : m = !0, k(A, T - z))) : (M.sortIndex = V, t(l, M), p || d || (p = !0, I(P))), M;
        }, e.unstable_shouldYield = se, e.unstable_wrapCallback = function(M) {
            var v = h;
            return function() {
                var T = h;
                h = v;
                try {
                    return M.apply(this, arguments);
                } finally{
                    h = T;
                }
            };
        };
    })(n0);
    t0.exports = n0;
    var G_ = t0.exports;
    var Q_ = Lt, St = G_;
    function Q(e) {
        for(var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++)t += "&args[]=" + encodeURIComponent(arguments[n]);
        return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    var r0 = new Set, qs = {};
    function Or(e, t) {
        us(e, t), us(e + "Capture", t);
    }
    function us(e, t) {
        for(qs[e] = t, e = 0; e < t.length; e++)r0.add(t[e]);
    }
    var xn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Bl = Object.prototype.hasOwnProperty, J_ = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Kf = {}, Gf = {};
    function Y_(e) {
        return Bl.call(Gf, e) ? !0 : Bl.call(Kf, e) ? !1 : J_.test(e) ? Gf[e] = !0 : (Kf[e] = !0, !1);
    }
    function X_(e, t, n, r) {
        if (n !== null && n.type === 0) return !1;
        switch(typeof t){
            case "function":
            case "symbol":
                return !0;
            case "boolean":
                return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
            default:
                return !1;
        }
    }
    function Z_(e, t, n, r) {
        if (t === null || typeof t > "u" || X_(e, t, n, r)) return !0;
        if (r) return !1;
        if (n !== null) switch(n.type){
            case 3:
                return !t;
            case 4:
                return t === !1;
            case 5:
                return isNaN(t);
            case 6:
                return isNaN(t) || 1 > t;
        }
        return !1;
    }
    function at(e, t, n, r, s, o, i) {
        this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = s, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = o, this.removeEmptyString = i;
    }
    var Ge = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
        Ge[e] = new at(e, 0, !1, e, null, !1, !1);
    });
    [
        [
            "acceptCharset",
            "accept-charset"
        ],
        [
            "className",
            "class"
        ],
        [
            "htmlFor",
            "for"
        ],
        [
            "httpEquiv",
            "http-equiv"
        ]
    ].forEach(function(e) {
        var t = e[0];
        Ge[t] = new at(t, 1, !1, e[1], null, !1, !1);
    });
    [
        "contentEditable",
        "draggable",
        "spellCheck",
        "value"
    ].forEach(function(e) {
        Ge[e] = new at(e, 2, !1, e.toLowerCase(), null, !1, !1);
    });
    [
        "autoReverse",
        "externalResourcesRequired",
        "focusable",
        "preserveAlpha"
    ].forEach(function(e) {
        Ge[e] = new at(e, 2, !1, e, null, !1, !1);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
        Ge[e] = new at(e, 3, !1, e.toLowerCase(), null, !1, !1);
    });
    [
        "checked",
        "multiple",
        "muted",
        "selected"
    ].forEach(function(e) {
        Ge[e] = new at(e, 3, !0, e, null, !1, !1);
    });
    [
        "capture",
        "download"
    ].forEach(function(e) {
        Ge[e] = new at(e, 4, !1, e, null, !1, !1);
    });
    [
        "cols",
        "rows",
        "size",
        "span"
    ].forEach(function(e) {
        Ge[e] = new at(e, 6, !1, e, null, !1, !1);
    });
    [
        "rowSpan",
        "start"
    ].forEach(function(e) {
        Ge[e] = new at(e, 5, !1, e.toLowerCase(), null, !1, !1);
    });
    var yc = /[\-:]([a-z])/g;
    function mc(e) {
        return e[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
        var t = e.replace(yc, mc);
        Ge[t] = new at(t, 1, !1, e, null, !1, !1);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
        var t = e.replace(yc, mc);
        Ge[t] = new at(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
    });
    [
        "xml:base",
        "xml:lang",
        "xml:space"
    ].forEach(function(e) {
        var t = e.replace(yc, mc);
        Ge[t] = new at(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
    });
    [
        "tabIndex",
        "crossOrigin"
    ].forEach(function(e) {
        Ge[e] = new at(e, 1, !1, e.toLowerCase(), null, !1, !1);
    });
    Ge.xlinkHref = new at("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
    [
        "src",
        "href",
        "action",
        "formAction"
    ].forEach(function(e) {
        Ge[e] = new at(e, 1, !1, e.toLowerCase(), null, !0, !0);
    });
    function _c(e, t, n, r) {
        var s = Ge.hasOwnProperty(t) ? Ge[t] : null;
        (s !== null ? s.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Z_(t, n, s, r) && (n = null), r || s === null ? Y_(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : s.mustUseProperty ? e[s.propertyName] = n === null ? s.type === 3 ? !1 : "" : n : (t = s.attributeName, r = s.attributeNamespace, n === null ? e.removeAttribute(t) : (s = s.type, n = s === 3 || s === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
    }
    var En = Q_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, $o = Symbol.for("react.element"), Br = Symbol.for("react.portal"), $r = Symbol.for("react.fragment"), wc = Symbol.for("react.strict_mode"), $l = Symbol.for("react.profiler"), s0 = Symbol.for("react.provider"), o0 = Symbol.for("react.context"), vc = Symbol.for("react.forward_ref"), Vl = Symbol.for("react.suspense"), Wl = Symbol.for("react.suspense_list"), bc = Symbol.for("react.memo"), Ln = Symbol.for("react.lazy"), i0 = Symbol.for("react.offscreen"), Qf = Symbol.iterator;
    function Cs(e) {
        return e === null || typeof e != "object" ? null : (e = Qf && e[Qf] || e["@@iterator"], typeof e == "function" ? e : null);
    }
    var Se = Object.assign, Ya;
    function Ls(e) {
        if (Ya === void 0) try {
            throw Error();
        } catch (n) {
            var t = n.stack.trim().match(/\n( *(at )?)/);
            Ya = t && t[1] || "";
        }
        return `
` + Ya + e;
    }
    var Xa = !1;
    function Za(e, t) {
        if (!e || Xa) return "";
        Xa = !0;
        var n = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            if (t) if (t = function() {
                throw Error();
            }, Object.defineProperty(t.prototype, "props", {
                set: function() {
                    throw Error();
                }
            }), typeof Reflect == "object" && Reflect.construct) {
                try {
                    Reflect.construct(t, []);
                } catch (f) {
                    var r = f;
                }
                Reflect.construct(e, [], t);
            } else {
                try {
                    t.call();
                } catch (f) {
                    r = f;
                }
                e.call(t.prototype);
            }
            else {
                try {
                    throw Error();
                } catch (f) {
                    r = f;
                }
                e();
            }
        } catch (f) {
            if (f && r && typeof f.stack == "string") {
                for(var s = f.stack.split(`
`), o = r.stack.split(`
`), i = s.length - 1, a = o.length - 1; 1 <= i && 0 <= a && s[i] !== o[a];)a--;
                for(; 1 <= i && 0 <= a; i--, a--)if (s[i] !== o[a]) {
                    if (i !== 1 || a !== 1) do if (i--, a--, 0 > a || s[i] !== o[a]) {
                        var l = `
` + s[i].replace(" at new ", " at ");
                        return e.displayName && l.includes("<anonymous>") && (l = l.replace("<anonymous>", e.displayName)), l;
                    }
                    while (1 <= i && 0 <= a);
                    break;
                }
            }
        } finally{
            Xa = !1, Error.prepareStackTrace = n;
        }
        return (e = e ? e.displayName || e.name : "") ? Ls(e) : "";
    }
    function q_(e) {
        switch(e.tag){
            case 5:
                return Ls(e.type);
            case 16:
                return Ls("Lazy");
            case 13:
                return Ls("Suspense");
            case 19:
                return Ls("SuspenseList");
            case 0:
            case 2:
            case 15:
                return e = Za(e.type, !1), e;
            case 11:
                return e = Za(e.type.render, !1), e;
            case 1:
                return e = Za(e.type, !0), e;
            default:
                return "";
        }
    }
    function Kl(e) {
        if (e == null) return null;
        if (typeof e == "function") return e.displayName || e.name || null;
        if (typeof e == "string") return e;
        switch(e){
            case $r:
                return "Fragment";
            case Br:
                return "Portal";
            case $l:
                return "Profiler";
            case wc:
                return "StrictMode";
            case Vl:
                return "Suspense";
            case Wl:
                return "SuspenseList";
        }
        if (typeof e == "object") switch(e.$$typeof){
            case o0:
                return (e.displayName || "Context") + ".Consumer";
            case s0:
                return (e._context.displayName || "Context") + ".Provider";
            case vc:
                var t = e.render;
                return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
            case bc:
                return t = e.displayName || null, t !== null ? t : Kl(e.type) || "Memo";
            case Ln:
                t = e._payload, e = e._init;
                try {
                    return Kl(e(t));
                } catch  {}
        }
        return null;
    }
    function e1(e) {
        var t = e.type;
        switch(e.tag){
            case 24:
                return "Cache";
            case 9:
                return (t.displayName || "Context") + ".Consumer";
            case 10:
                return (t._context.displayName || "Context") + ".Provider";
            case 18:
                return "DehydratedFragment";
            case 11:
                return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
            case 7:
                return "Fragment";
            case 5:
                return t;
            case 4:
                return "Portal";
            case 3:
                return "Root";
            case 6:
                return "Text";
            case 16:
                return Kl(t);
            case 8:
                return t === wc ? "StrictMode" : "Mode";
            case 22:
                return "Offscreen";
            case 12:
                return "Profiler";
            case 21:
                return "Scope";
            case 13:
                return "Suspense";
            case 19:
                return "SuspenseList";
            case 25:
                return "TracingMarker";
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
                if (typeof t == "function") return t.displayName || t.name || null;
                if (typeof t == "string") return t;
        }
        return null;
    }
    function Zn(e) {
        switch(typeof e){
            case "boolean":
            case "number":
            case "string":
            case "undefined":
                return e;
            case "object":
                return e;
            default:
                return "";
        }
    }
    function a0(e) {
        var t = e.type;
        return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
    }
    function t1(e) {
        var t = a0(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
        if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
            var s = n.get, o = n.set;
            return Object.defineProperty(e, t, {
                configurable: !0,
                get: function() {
                    return s.call(this);
                },
                set: function(i) {
                    r = "" + i, o.call(this, i);
                }
            }), Object.defineProperty(e, t, {
                enumerable: n.enumerable
            }), {
                getValue: function() {
                    return r;
                },
                setValue: function(i) {
                    r = "" + i;
                },
                stopTracking: function() {
                    e._valueTracker = null, delete e[t];
                }
            };
        }
    }
    function Vo(e) {
        e._valueTracker || (e._valueTracker = t1(e));
    }
    function l0(e) {
        if (!e) return !1;
        var t = e._valueTracker;
        if (!t) return !0;
        var n = t.getValue(), r = "";
        return e && (r = a0(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
    }
    function Mi(e) {
        if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
        try {
            return e.activeElement || e.body;
        } catch  {
            return e.body;
        }
    }
    function Gl(e, t) {
        var n = t.checked;
        return Se({}, t, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: n ?? e._wrapperState.initialChecked
        });
    }
    function Jf(e, t) {
        var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
        n = Zn(t.value != null ? t.value : n), e._wrapperState = {
            initialChecked: r,
            initialValue: n,
            controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
        };
    }
    function u0(e, t) {
        t = t.checked, t != null && _c(e, "checked", t, !1);
    }
    function Ql(e, t) {
        u0(e, t);
        var n = Zn(t.value), r = t.type;
        if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
        else if (r === "submit" || r === "reset") {
            e.removeAttribute("value");
            return;
        }
        t.hasOwnProperty("value") ? Jl(e, t.type, n) : t.hasOwnProperty("defaultValue") && Jl(e, t.type, Zn(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
    }
    function Yf(e, t, n) {
        if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
            var r = t.type;
            if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
            t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
        }
        n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
    }
    function Jl(e, t, n) {
        (t !== "number" || Mi(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
    }
    var Us = Array.isArray;
    function rs(e, t, n, r) {
        if (e = e.options, t) {
            t = {};
            for(var s = 0; s < n.length; s++)t["$" + n[s]] = !0;
            for(n = 0; n < e.length; n++)s = t.hasOwnProperty("$" + e[n].value), e[n].selected !== s && (e[n].selected = s), s && r && (e[n].defaultSelected = !0);
        } else {
            for(n = "" + Zn(n), t = null, s = 0; s < e.length; s++){
                if (e[s].value === n) {
                    e[s].selected = !0, r && (e[s].defaultSelected = !0);
                    return;
                }
                t !== null || e[s].disabled || (t = e[s]);
            }
            t !== null && (t.selected = !0);
        }
    }
    function Yl(e, t) {
        if (t.dangerouslySetInnerHTML != null) throw Error(Q(91));
        return Se({}, t, {
            value: void 0,
            defaultValue: void 0,
            children: "" + e._wrapperState.initialValue
        });
    }
    function Xf(e, t) {
        var n = t.value;
        if (n == null) {
            if (n = t.children, t = t.defaultValue, n != null) {
                if (t != null) throw Error(Q(92));
                if (Us(n)) {
                    if (1 < n.length) throw Error(Q(93));
                    n = n[0];
                }
                t = n;
            }
            t == null && (t = ""), n = t;
        }
        e._wrapperState = {
            initialValue: Zn(n)
        };
    }
    function c0(e, t) {
        var n = Zn(t.value), r = Zn(t.defaultValue);
        n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
    }
    function Zf(e) {
        var t = e.textContent;
        t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
    }
    function f0(e) {
        switch(e){
            case "svg":
                return "http://www.w3.org/2000/svg";
            case "math":
                return "http://www.w3.org/1998/Math/MathML";
            default:
                return "http://www.w3.org/1999/xhtml";
        }
    }
    function Xl(e, t) {
        return e == null || e === "http://www.w3.org/1999/xhtml" ? f0(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
    }
    var Wo, d0 = function(e) {
        return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, s) {
            MSApp.execUnsafeLocalFunction(function() {
                return e(t, n, r, s);
            });
        } : e;
    }(function(e, t) {
        if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
        else {
            for(Wo = Wo || document.createElement("div"), Wo.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = Wo.firstChild; e.firstChild;)e.removeChild(e.firstChild);
            for(; t.firstChild;)e.appendChild(t.firstChild);
        }
    });
    function eo(e, t) {
        if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) {
                n.nodeValue = t;
                return;
            }
        }
        e.textContent = t;
    }
    var Bs = {
        animationIterationCount: !0,
        aspectRatio: !0,
        borderImageOutset: !0,
        borderImageSlice: !0,
        borderImageWidth: !0,
        boxFlex: !0,
        boxFlexGroup: !0,
        boxOrdinalGroup: !0,
        columnCount: !0,
        columns: !0,
        flex: !0,
        flexGrow: !0,
        flexPositive: !0,
        flexShrink: !0,
        flexNegative: !0,
        flexOrder: !0,
        gridArea: !0,
        gridRow: !0,
        gridRowEnd: !0,
        gridRowSpan: !0,
        gridRowStart: !0,
        gridColumn: !0,
        gridColumnEnd: !0,
        gridColumnSpan: !0,
        gridColumnStart: !0,
        fontWeight: !0,
        lineClamp: !0,
        lineHeight: !0,
        opacity: !0,
        order: !0,
        orphans: !0,
        tabSize: !0,
        widows: !0,
        zIndex: !0,
        zoom: !0,
        fillOpacity: !0,
        floodOpacity: !0,
        stopOpacity: !0,
        strokeDasharray: !0,
        strokeDashoffset: !0,
        strokeMiterlimit: !0,
        strokeOpacity: !0,
        strokeWidth: !0
    }, n1 = [
        "Webkit",
        "ms",
        "Moz",
        "O"
    ];
    Object.keys(Bs).forEach(function(e) {
        n1.forEach(function(t) {
            t = t + e.charAt(0).toUpperCase() + e.substring(1), Bs[t] = Bs[e];
        });
    });
    function h0(e, t, n) {
        return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || Bs.hasOwnProperty(e) && Bs[e] ? ("" + t).trim() : t + "px";
    }
    function p0(e, t) {
        e = e.style;
        for(var n in t)if (t.hasOwnProperty(n)) {
            var r = n.indexOf("--") === 0, s = h0(n, t[n], r);
            n === "float" && (n = "cssFloat"), r ? e.setProperty(n, s) : e[n] = s;
        }
    }
    var r1 = Se({
        menuitem: !0
    }, {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        embed: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0
    });
    function Zl(e, t) {
        if (t) {
            if (r1[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(Q(137, e));
            if (t.dangerouslySetInnerHTML != null) {
                if (t.children != null) throw Error(Q(60));
                if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(Q(61));
            }
            if (t.style != null && typeof t.style != "object") throw Error(Q(62));
        }
    }
    function ql(e, t) {
        if (e.indexOf("-") === -1) return typeof t.is == "string";
        switch(e){
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
                return !1;
            default:
                return !0;
        }
    }
    var eu = null;
    function xc(e) {
        return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
    }
    var tu = null, ss = null, os = null;
    function qf(e) {
        if (e = Po(e)) {
            if (typeof tu != "function") throw Error(Q(280));
            var t = e.stateNode;
            t && (t = va(t), tu(e.stateNode, e.type, t));
        }
    }
    function g0(e) {
        ss ? os ? os.push(e) : os = [
            e
        ] : ss = e;
    }
    function y0() {
        if (ss) {
            var e = ss, t = os;
            if (os = ss = null, qf(e), t) for(e = 0; e < t.length; e++)qf(t[e]);
        }
    }
    function m0(e, t) {
        return e(t);
    }
    function _0() {}
    var qa = !1;
    function w0(e, t, n) {
        if (qa) return e(t, n);
        qa = !0;
        try {
            return m0(e, t, n);
        } finally{
            qa = !1, (ss !== null || os !== null) && (_0(), y0());
        }
    }
    function to(e, t) {
        var n = e.stateNode;
        if (n === null) return null;
        var r = va(n);
        if (r === null) return null;
        n = r[t];
        e: switch(t){
            case "onClick":
            case "onClickCapture":
            case "onDoubleClick":
            case "onDoubleClickCapture":
            case "onMouseDown":
            case "onMouseDownCapture":
            case "onMouseMove":
            case "onMouseMoveCapture":
            case "onMouseUp":
            case "onMouseUpCapture":
            case "onMouseEnter":
                (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
                break e;
            default:
                e = !1;
        }
        if (e) return null;
        if (n && typeof n != "function") throw Error(Q(231, t, typeof n));
        return n;
    }
    var nu = !1;
    if (xn) try {
        var Es = {};
        Object.defineProperty(Es, "passive", {
            get: function() {
                nu = !0;
            }
        }), window.addEventListener("test", Es, Es), window.removeEventListener("test", Es, Es);
    } catch  {
        nu = !1;
    }
    function s1(e, t, n, r, s, o, i, a, l) {
        var f = Array.prototype.slice.call(arguments, 3);
        try {
            t.apply(n, f);
        } catch (c) {
            this.onError(c);
        }
    }
    var $s = !1, Ri = null, Pi = !1, ru = null, o1 = {
        onError: function(e) {
            $s = !0, Ri = e;
        }
    };
    function i1(e, t, n, r, s, o, i, a, l) {
        $s = !1, Ri = null, s1.apply(o1, arguments);
    }
    function a1(e, t, n, r, s, o, i, a, l) {
        if (i1.apply(this, arguments), $s) {
            if ($s) {
                var f = Ri;
                $s = !1, Ri = null;
            } else throw Error(Q(198));
            Pi || (Pi = !0, ru = f);
        }
    }
    function Tr(e) {
        var t = e, n = e;
        if (e.alternate) for(; t.return;)t = t.return;
        else {
            e = t;
            do t = e, t.flags & 4098 && (n = t.return), e = t.return;
            while (e);
        }
        return t.tag === 3 ? n : null;
    }
    function v0(e) {
        if (e.tag === 13) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
        }
        return null;
    }
    function ed(e) {
        if (Tr(e) !== e) throw Error(Q(188));
    }
    function l1(e) {
        var t = e.alternate;
        if (!t) {
            if (t = Tr(e), t === null) throw Error(Q(188));
            return t !== e ? null : e;
        }
        for(var n = e, r = t;;){
            var s = n.return;
            if (s === null) break;
            var o = s.alternate;
            if (o === null) {
                if (r = s.return, r !== null) {
                    n = r;
                    continue;
                }
                break;
            }
            if (s.child === o.child) {
                for(o = s.child; o;){
                    if (o === n) return ed(s), e;
                    if (o === r) return ed(s), t;
                    o = o.sibling;
                }
                throw Error(Q(188));
            }
            if (n.return !== r.return) n = s, r = o;
            else {
                for(var i = !1, a = s.child; a;){
                    if (a === n) {
                        i = !0, n = s, r = o;
                        break;
                    }
                    if (a === r) {
                        i = !0, r = s, n = o;
                        break;
                    }
                    a = a.sibling;
                }
                if (!i) {
                    for(a = o.child; a;){
                        if (a === n) {
                            i = !0, n = o, r = s;
                            break;
                        }
                        if (a === r) {
                            i = !0, r = o, n = s;
                            break;
                        }
                        a = a.sibling;
                    }
                    if (!i) throw Error(Q(189));
                }
            }
            if (n.alternate !== r) throw Error(Q(190));
        }
        if (n.tag !== 3) throw Error(Q(188));
        return n.stateNode.current === n ? e : t;
    }
    function b0(e) {
        return e = l1(e), e !== null ? x0(e) : null;
    }
    function x0(e) {
        if (e.tag === 5 || e.tag === 6) return e;
        for(e = e.child; e !== null;){
            var t = x0(e);
            if (t !== null) return t;
            e = e.sibling;
        }
        return null;
    }
    var S0 = St.unstable_scheduleCallback, td = St.unstable_cancelCallback, u1 = St.unstable_shouldYield, c1 = St.unstable_requestPaint, Ae = St.unstable_now, f1 = St.unstable_getCurrentPriorityLevel, Sc = St.unstable_ImmediatePriority, k0 = St.unstable_UserBlockingPriority, Di = St.unstable_NormalPriority, d1 = St.unstable_LowPriority, C0 = St.unstable_IdlePriority, ya = null, dn = null;
    function h1(e) {
        if (dn && typeof dn.onCommitFiberRoot == "function") try {
            dn.onCommitFiberRoot(ya, e, void 0, (e.current.flags & 128) === 128);
        } catch  {}
    }
    var Gt = Math.clz32 ? Math.clz32 : y1, p1 = Math.log, g1 = Math.LN2;
    function y1(e) {
        return e >>>= 0, e === 0 ? 32 : 31 - (p1(e) / g1 | 0) | 0;
    }
    var Ko = 64, Go = 4194304;
    function Fs(e) {
        switch(e & -e){
            case 1:
                return 1;
            case 2:
                return 2;
            case 4:
                return 4;
            case 8:
                return 8;
            case 16:
                return 16;
            case 32:
                return 32;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return e & 4194240;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
                return e & 130023424;
            case 134217728:
                return 134217728;
            case 268435456:
                return 268435456;
            case 536870912:
                return 536870912;
            case 1073741824:
                return 1073741824;
            default:
                return e;
        }
    }
    function Li(e, t) {
        var n = e.pendingLanes;
        if (n === 0) return 0;
        var r = 0, s = e.suspendedLanes, o = e.pingedLanes, i = n & 268435455;
        if (i !== 0) {
            var a = i & ~s;
            a !== 0 ? r = Fs(a) : (o &= i, o !== 0 && (r = Fs(o)));
        } else i = n & ~s, i !== 0 ? r = Fs(i) : o !== 0 && (r = Fs(o));
        if (r === 0) return 0;
        if (t !== 0 && t !== r && !(t & s) && (s = r & -r, o = t & -t, s >= o || s === 16 && (o & 4194240) !== 0)) return t;
        if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for(e = e.entanglements, t &= r; 0 < t;)n = 31 - Gt(t), s = 1 << n, r |= e[n], t &= ~s;
        return r;
    }
    function m1(e, t) {
        switch(e){
            case 1:
            case 2:
            case 4:
                return t + 250;
            case 8:
            case 16:
            case 32:
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return t + 5e3;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
                return -1;
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
                return -1;
            default:
                return -1;
        }
    }
    function _1(e, t) {
        for(var n = e.suspendedLanes, r = e.pingedLanes, s = e.expirationTimes, o = e.pendingLanes; 0 < o;){
            var i = 31 - Gt(o), a = 1 << i, l = s[i];
            l === -1 ? (!(a & n) || a & r) && (s[i] = m1(a, t)) : l <= t && (e.expiredLanes |= a), o &= ~a;
        }
    }
    function su(e) {
        return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
    }
    function E0() {
        var e = Ko;
        return Ko <<= 1, !(Ko & 4194240) && (Ko = 64), e;
    }
    function el(e) {
        for(var t = [], n = 0; 31 > n; n++)t.push(e);
        return t;
    }
    function Mo(e, t, n) {
        e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Gt(t), e[t] = n;
    }
    function w1(e, t) {
        var n = e.pendingLanes & ~t;
        e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
        var r = e.eventTimes;
        for(e = e.expirationTimes; 0 < n;){
            var s = 31 - Gt(n), o = 1 << s;
            t[s] = 0, r[s] = -1, e[s] = -1, n &= ~o;
        }
    }
    function kc(e, t) {
        var n = e.entangledLanes |= t;
        for(e = e.entanglements; n;){
            var r = 31 - Gt(n), s = 1 << r;
            s & t | e[r] & t && (e[r] |= t), n &= ~s;
        }
    }
    var fe = 0;
    function I0(e) {
        return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
    }
    var A0, Cc, O0, T0, j0, ou = !1, Qo = [], Bn = null, $n = null, Vn = null, no = new Map, ro = new Map, Fn = [], v1 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    function nd(e, t) {
        switch(e){
            case "focusin":
            case "focusout":
                Bn = null;
                break;
            case "dragenter":
            case "dragleave":
                $n = null;
                break;
            case "mouseover":
            case "mouseout":
                Vn = null;
                break;
            case "pointerover":
            case "pointerout":
                no.delete(t.pointerId);
                break;
            case "gotpointercapture":
            case "lostpointercapture":
                ro.delete(t.pointerId);
        }
    }
    function Is(e, t, n, r, s, o) {
        return e === null || e.nativeEvent !== o ? (e = {
            blockedOn: t,
            domEventName: n,
            eventSystemFlags: r,
            nativeEvent: o,
            targetContainers: [
                s
            ]
        }, t !== null && (t = Po(t), t !== null && Cc(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, s !== null && t.indexOf(s) === -1 && t.push(s), e);
    }
    function b1(e, t, n, r, s) {
        switch(t){
            case "focusin":
                return Bn = Is(Bn, e, t, n, r, s), !0;
            case "dragenter":
                return $n = Is($n, e, t, n, r, s), !0;
            case "mouseover":
                return Vn = Is(Vn, e, t, n, r, s), !0;
            case "pointerover":
                var o = s.pointerId;
                return no.set(o, Is(no.get(o) || null, e, t, n, r, s)), !0;
            case "gotpointercapture":
                return o = s.pointerId, ro.set(o, Is(ro.get(o) || null, e, t, n, r, s)), !0;
        }
        return !1;
    }
    function M0(e) {
        var t = cr(e.target);
        if (t !== null) {
            var n = Tr(t);
            if (n !== null) {
                if (t = n.tag, t === 13) {
                    if (t = v0(n), t !== null) {
                        e.blockedOn = t, j0(e.priority, function() {
                            O0(n);
                        });
                        return;
                    }
                } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                    return;
                }
            }
        }
        e.blockedOn = null;
    }
    function yi(e) {
        if (e.blockedOn !== null) return !1;
        for(var t = e.targetContainers; 0 < t.length;){
            var n = iu(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
            if (n === null) {
                n = e.nativeEvent;
                var r = new n.constructor(n.type, n);
                eu = r, n.target.dispatchEvent(r), eu = null;
            } else return t = Po(n), t !== null && Cc(t), e.blockedOn = n, !1;
            t.shift();
        }
        return !0;
    }
    function rd(e, t, n) {
        yi(e) && n.delete(t);
    }
    function x1() {
        ou = !1, Bn !== null && yi(Bn) && (Bn = null), $n !== null && yi($n) && ($n = null), Vn !== null && yi(Vn) && (Vn = null), no.forEach(rd), ro.forEach(rd);
    }
    function As(e, t) {
        e.blockedOn === t && (e.blockedOn = null, ou || (ou = !0, St.unstable_scheduleCallback(St.unstable_NormalPriority, x1)));
    }
    function so(e) {
        function t(s) {
            return As(s, e);
        }
        if (0 < Qo.length) {
            As(Qo[0], e);
            for(var n = 1; n < Qo.length; n++){
                var r = Qo[n];
                r.blockedOn === e && (r.blockedOn = null);
            }
        }
        for(Bn !== null && As(Bn, e), $n !== null && As($n, e), Vn !== null && As(Vn, e), no.forEach(t), ro.forEach(t), n = 0; n < Fn.length; n++)r = Fn[n], r.blockedOn === e && (r.blockedOn = null);
        for(; 0 < Fn.length && (n = Fn[0], n.blockedOn === null);)M0(n), n.blockedOn === null && Fn.shift();
    }
    var is = En.ReactCurrentBatchConfig, Ui = !0;
    function S1(e, t, n, r) {
        var s = fe, o = is.transition;
        is.transition = null;
        try {
            fe = 1, Ec(e, t, n, r);
        } finally{
            fe = s, is.transition = o;
        }
    }
    function k1(e, t, n, r) {
        var s = fe, o = is.transition;
        is.transition = null;
        try {
            fe = 4, Ec(e, t, n, r);
        } finally{
            fe = s, is.transition = o;
        }
    }
    function Ec(e, t, n, r) {
        if (Ui) {
            var s = iu(e, t, n, r);
            if (s === null) cl(e, t, r, Fi, n), nd(e, r);
            else if (b1(s, e, t, n, r)) r.stopPropagation();
            else if (nd(e, r), t & 4 && -1 < v1.indexOf(e)) {
                for(; s !== null;){
                    var o = Po(s);
                    if (o !== null && A0(o), o = iu(e, t, n, r), o === null && cl(e, t, r, Fi, n), o === s) break;
                    s = o;
                }
                s !== null && r.stopPropagation();
            } else cl(e, t, r, null, n);
        }
    }
    var Fi = null;
    function iu(e, t, n, r) {
        if (Fi = null, e = xc(r), e = cr(e), e !== null) if (t = Tr(e), t === null) e = null;
        else if (n = t.tag, n === 13) {
            if (e = v0(t), e !== null) return e;
            e = null;
        } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
            e = null;
        } else t !== e && (e = null);
        return Fi = e, null;
    }
    function R0(e) {
        switch(e){
            case "cancel":
            case "click":
            case "close":
            case "contextmenu":
            case "copy":
            case "cut":
            case "auxclick":
            case "dblclick":
            case "dragend":
            case "dragstart":
            case "drop":
            case "focusin":
            case "focusout":
            case "input":
            case "invalid":
            case "keydown":
            case "keypress":
            case "keyup":
            case "mousedown":
            case "mouseup":
            case "paste":
            case "pause":
            case "play":
            case "pointercancel":
            case "pointerdown":
            case "pointerup":
            case "ratechange":
            case "reset":
            case "resize":
            case "seeked":
            case "submit":
            case "touchcancel":
            case "touchend":
            case "touchstart":
            case "volumechange":
            case "change":
            case "selectionchange":
            case "textInput":
            case "compositionstart":
            case "compositionend":
            case "compositionupdate":
            case "beforeblur":
            case "afterblur":
            case "beforeinput":
            case "blur":
            case "fullscreenchange":
            case "focus":
            case "hashchange":
            case "popstate":
            case "select":
            case "selectstart":
                return 1;
            case "drag":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "mousemove":
            case "mouseout":
            case "mouseover":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "scroll":
            case "toggle":
            case "touchmove":
            case "wheel":
            case "mouseenter":
            case "mouseleave":
            case "pointerenter":
            case "pointerleave":
                return 4;
            case "message":
                switch(f1()){
                    case Sc:
                        return 1;
                    case k0:
                        return 4;
                    case Di:
                    case d1:
                        return 16;
                    case C0:
                        return 536870912;
                    default:
                        return 16;
                }
            default:
                return 16;
        }
    }
    var Hn = null, Ic = null, mi = null;
    function P0() {
        if (mi) return mi;
        var e, t = Ic, n = t.length, r, s = "value" in Hn ? Hn.value : Hn.textContent, o = s.length;
        for(e = 0; e < n && t[e] === s[e]; e++);
        var i = n - e;
        for(r = 1; r <= i && t[n - r] === s[o - r]; r++);
        return mi = s.slice(e, 1 < r ? 1 - r : void 0);
    }
    function _i(e) {
        var t = e.keyCode;
        return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
    }
    function Jo() {
        return !0;
    }
    function sd() {
        return !1;
    }
    function Ct(e) {
        function t(n, r, s, o, i) {
            this._reactName = n, this._targetInst = s, this.type = r, this.nativeEvent = o, this.target = i, this.currentTarget = null;
            for(var a in e)e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(o) : o[a]);
            return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Jo : sd, this.isPropagationStopped = sd, this;
        }
        return Se(t.prototype, {
            preventDefault: function() {
                this.defaultPrevented = !0;
                var n = this.nativeEvent;
                n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Jo);
            },
            stopPropagation: function() {
                var n = this.nativeEvent;
                n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Jo);
            },
            persist: function() {},
            isPersistent: Jo
        }), t;
    }
    var xs = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(e) {
            return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0
    }, Ac = Ct(xs), Ro = Se({}, xs, {
        view: 0,
        detail: 0
    }), C1 = Ct(Ro), tl, nl, Os, ma = Se({}, Ro, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: Oc,
        button: 0,
        buttons: 0,
        relatedTarget: function(e) {
            return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
        },
        movementX: function(e) {
            return "movementX" in e ? e.movementX : (e !== Os && (Os && e.type === "mousemove" ? (tl = e.screenX - Os.screenX, nl = e.screenY - Os.screenY) : nl = tl = 0, Os = e), tl);
        },
        movementY: function(e) {
            return "movementY" in e ? e.movementY : nl;
        }
    }), od = Ct(ma), E1 = Se({}, ma, {
        dataTransfer: 0
    }), I1 = Ct(E1), A1 = Se({}, Ro, {
        relatedTarget: 0
    }), rl = Ct(A1), O1 = Se({}, xs, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    }), T1 = Ct(O1), j1 = Se({}, xs, {
        clipboardData: function(e) {
            return "clipboardData" in e ? e.clipboardData : window.clipboardData;
        }
    }), M1 = Ct(j1), R1 = Se({}, xs, {
        data: 0
    }), id = Ct(R1), P1 = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
    }, D1 = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
    }, L1 = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
    };
    function U1(e) {
        var t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(e) : (e = L1[e]) ? !!t[e] : !1;
    }
    function Oc() {
        return U1;
    }
    var F1 = Se({}, Ro, {
        key: function(e) {
            if (e.key) {
                var t = P1[e.key] || e.key;
                if (t !== "Unidentified") return t;
            }
            return e.type === "keypress" ? (e = _i(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? D1[e.keyCode] || "Unidentified" : "";
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: Oc,
        charCode: function(e) {
            return e.type === "keypress" ? _i(e) : 0;
        },
        keyCode: function(e) {
            return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
        },
        which: function(e) {
            return e.type === "keypress" ? _i(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
        }
    }), z1 = Ct(F1), H1 = Se({}, ma, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
    }), ad = Ct(H1), N1 = Se({}, Ro, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: Oc
    }), B1 = Ct(N1), $1 = Se({}, xs, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    }), V1 = Ct($1), W1 = Se({}, ma, {
        deltaX: function(e) {
            return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
        },
        deltaY: function(e) {
            return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
    }), K1 = Ct(W1), G1 = [
        9,
        13,
        27,
        32
    ], Tc = xn && "CompositionEvent" in window, Vs = null;
    xn && "documentMode" in document && (Vs = document.documentMode);
    var Q1 = xn && "TextEvent" in window && !Vs, D0 = xn && (!Tc || Vs && 8 < Vs && 11 >= Vs), ld = String.fromCharCode(32), ud = !1;
    function L0(e, t) {
        switch(e){
            case "keyup":
                return G1.indexOf(t.keyCode) !== -1;
            case "keydown":
                return t.keyCode !== 229;
            case "keypress":
            case "mousedown":
            case "focusout":
                return !0;
            default:
                return !1;
        }
    }
    function U0(e) {
        return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
    }
    var Vr = !1;
    function J1(e, t) {
        switch(e){
            case "compositionend":
                return U0(t);
            case "keypress":
                return t.which !== 32 ? null : (ud = !0, ld);
            case "textInput":
                return e = t.data, e === ld && ud ? null : e;
            default:
                return null;
        }
    }
    function Y1(e, t) {
        if (Vr) return e === "compositionend" || !Tc && L0(e, t) ? (e = P0(), mi = Ic = Hn = null, Vr = !1, e) : null;
        switch(e){
            case "paste":
                return null;
            case "keypress":
                if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                    if (t.char && 1 < t.char.length) return t.char;
                    if (t.which) return String.fromCharCode(t.which);
                }
                return null;
            case "compositionend":
                return D0 && t.locale !== "ko" ? null : t.data;
            default:
                return null;
        }
    }
    var X1 = {
        color: !0,
        date: !0,
        datetime: !0,
        "datetime-local": !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function cd(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t === "input" ? !!X1[e.type] : t === "textarea";
    }
    function F0(e, t, n, r) {
        g0(r), t = zi(t, "onChange"), 0 < t.length && (n = new Ac("onChange", "change", null, n, r), e.push({
            event: n,
            listeners: t
        }));
    }
    var Ws = null, oo = null;
    function Z1(e) {
        J0(e, 0);
    }
    function _a(e) {
        var t = Gr(e);
        if (l0(t)) return e;
    }
    function q1(e, t) {
        if (e === "change") return t;
    }
    var z0 = !1;
    if (xn) {
        var sl;
        if (xn) {
            var ol = "oninput" in document;
            if (!ol) {
                var fd = document.createElement("div");
                fd.setAttribute("oninput", "return;"), ol = typeof fd.oninput == "function";
            }
            sl = ol;
        } else sl = !1;
        z0 = sl && (!document.documentMode || 9 < document.documentMode);
    }
    function dd() {
        Ws && (Ws.detachEvent("onpropertychange", H0), oo = Ws = null);
    }
    function H0(e) {
        if (e.propertyName === "value" && _a(oo)) {
            var t = [];
            F0(t, oo, e, xc(e)), w0(Z1, t);
        }
    }
    function ew(e, t, n) {
        e === "focusin" ? (dd(), Ws = t, oo = n, Ws.attachEvent("onpropertychange", H0)) : e === "focusout" && dd();
    }
    function tw(e) {
        if (e === "selectionchange" || e === "keyup" || e === "keydown") return _a(oo);
    }
    function nw(e, t) {
        if (e === "click") return _a(t);
    }
    function rw(e, t) {
        if (e === "input" || e === "change") return _a(t);
    }
    function sw(e, t) {
        return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    var Jt = typeof Object.is == "function" ? Object.is : sw;
    function io(e, t) {
        if (Jt(e, t)) return !0;
        if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
        var n = Object.keys(e), r = Object.keys(t);
        if (n.length !== r.length) return !1;
        for(r = 0; r < n.length; r++){
            var s = n[r];
            if (!Bl.call(t, s) || !Jt(e[s], t[s])) return !1;
        }
        return !0;
    }
    function hd(e) {
        for(; e && e.firstChild;)e = e.firstChild;
        return e;
    }
    function pd(e, t) {
        var n = hd(e);
        e = 0;
        for(var r; n;){
            if (n.nodeType === 3) {
                if (r = e + n.textContent.length, e <= t && r >= t) return {
                    node: n,
                    offset: t - e
                };
                e = r;
            }
            e: {
                for(; n;){
                    if (n.nextSibling) {
                        n = n.nextSibling;
                        break e;
                    }
                    n = n.parentNode;
                }
                n = void 0;
            }
            n = hd(n);
        }
    }
    function N0(e, t) {
        return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? N0(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
    }
    function B0() {
        for(var e = window, t = Mi(); t instanceof e.HTMLIFrameElement;){
            try {
                var n = typeof t.contentWindow.location.href == "string";
            } catch  {
                n = !1;
            }
            if (n) e = t.contentWindow;
            else break;
            t = Mi(e.document);
        }
        return t;
    }
    function jc(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
    }
    function ow(e) {
        var t = B0(), n = e.focusedElem, r = e.selectionRange;
        if (t !== n && n && n.ownerDocument && N0(n.ownerDocument.documentElement, n)) {
            if (r !== null && jc(n)) {
                if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
                else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
                    e = e.getSelection();
                    var s = n.textContent.length, o = Math.min(r.start, s);
                    r = r.end === void 0 ? o : Math.min(r.end, s), !e.extend && o > r && (s = r, r = o, o = s), s = pd(n, o);
                    var i = pd(n, r);
                    s && i && (e.rangeCount !== 1 || e.anchorNode !== s.node || e.anchorOffset !== s.offset || e.focusNode !== i.node || e.focusOffset !== i.offset) && (t = t.createRange(), t.setStart(s.node, s.offset), e.removeAllRanges(), o > r ? (e.addRange(t), e.extend(i.node, i.offset)) : (t.setEnd(i.node, i.offset), e.addRange(t)));
                }
            }
            for(t = [], e = n; e = e.parentNode;)e.nodeType === 1 && t.push({
                element: e,
                left: e.scrollLeft,
                top: e.scrollTop
            });
            for(typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
        }
    }
    var iw = xn && "documentMode" in document && 11 >= document.documentMode, Wr = null, au = null, Ks = null, lu = !1;
    function gd(e, t, n) {
        var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
        lu || Wr == null || Wr !== Mi(r) || (r = Wr, "selectionStart" in r && jc(r) ? r = {
            start: r.selectionStart,
            end: r.selectionEnd
        } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
            anchorNode: r.anchorNode,
            anchorOffset: r.anchorOffset,
            focusNode: r.focusNode,
            focusOffset: r.focusOffset
        }), Ks && io(Ks, r) || (Ks = r, r = zi(au, "onSelect"), 0 < r.length && (t = new Ac("onSelect", "select", null, t, n), e.push({
            event: t,
            listeners: r
        }), t.target = Wr)));
    }
    function Yo(e, t) {
        var n = {};
        return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
    }
    var Kr = {
        animationend: Yo("Animation", "AnimationEnd"),
        animationiteration: Yo("Animation", "AnimationIteration"),
        animationstart: Yo("Animation", "AnimationStart"),
        transitionend: Yo("Transition", "TransitionEnd")
    }, il = {}, $0 = {};
    xn && ($0 = document.createElement("div").style, "AnimationEvent" in window || (delete Kr.animationend.animation, delete Kr.animationiteration.animation, delete Kr.animationstart.animation), "TransitionEvent" in window || delete Kr.transitionend.transition);
    function wa(e) {
        if (il[e]) return il[e];
        if (!Kr[e]) return e;
        var t = Kr[e], n;
        for(n in t)if (t.hasOwnProperty(n) && n in $0) return il[e] = t[n];
        return e;
    }
    var V0 = wa("animationend"), W0 = wa("animationiteration"), K0 = wa("animationstart"), G0 = wa("transitionend"), Q0 = new Map, yd = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    function tr(e, t) {
        Q0.set(e, t), Or(t, [
            e
        ]);
    }
    for(var al = 0; al < yd.length; al++){
        var ll = yd[al], aw = ll.toLowerCase(), lw = ll[0].toUpperCase() + ll.slice(1);
        tr(aw, "on" + lw);
    }
    tr(V0, "onAnimationEnd");
    tr(W0, "onAnimationIteration");
    tr(K0, "onAnimationStart");
    tr("dblclick", "onDoubleClick");
    tr("focusin", "onFocus");
    tr("focusout", "onBlur");
    tr(G0, "onTransitionEnd");
    us("onMouseEnter", [
        "mouseout",
        "mouseover"
    ]);
    us("onMouseLeave", [
        "mouseout",
        "mouseover"
    ]);
    us("onPointerEnter", [
        "pointerout",
        "pointerover"
    ]);
    us("onPointerLeave", [
        "pointerout",
        "pointerover"
    ]);
    Or("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    Or("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    Or("onBeforeInput", [
        "compositionend",
        "keypress",
        "textInput",
        "paste"
    ]);
    Or("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    Or("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    Or("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var zs = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), uw = new Set("cancel close invalid load scroll toggle".split(" ").concat(zs));
    function md(e, t, n) {
        var r = e.type || "unknown-event";
        e.currentTarget = n, a1(r, t, void 0, e), e.currentTarget = null;
    }
    function J0(e, t) {
        t = (t & 4) !== 0;
        for(var n = 0; n < e.length; n++){
            var r = e[n], s = r.event;
            r = r.listeners;
            e: {
                var o = void 0;
                if (t) for(var i = r.length - 1; 0 <= i; i--){
                    var a = r[i], l = a.instance, f = a.currentTarget;
                    if (a = a.listener, l !== o && s.isPropagationStopped()) break e;
                    md(s, a, f), o = l;
                }
                else for(i = 0; i < r.length; i++){
                    if (a = r[i], l = a.instance, f = a.currentTarget, a = a.listener, l !== o && s.isPropagationStopped()) break e;
                    md(s, a, f), o = l;
                }
            }
        }
        if (Pi) throw e = ru, Pi = !1, ru = null, e;
    }
    function ye(e, t) {
        var n = t[hu];
        n === void 0 && (n = t[hu] = new Set);
        var r = e + "__bubble";
        n.has(r) || (Y0(t, e, 2, !1), n.add(r));
    }
    function ul(e, t, n) {
        var r = 0;
        t && (r |= 4), Y0(n, e, r, t);
    }
    var Xo = "_reactListening" + Math.random().toString(36).slice(2);
    function ao(e) {
        if (!e[Xo]) {
            e[Xo] = !0, r0.forEach(function(n) {
                n !== "selectionchange" && (uw.has(n) || ul(n, !1, e), ul(n, !0, e));
            });
            var t = e.nodeType === 9 ? e : e.ownerDocument;
            t === null || t[Xo] || (t[Xo] = !0, ul("selectionchange", !1, t));
        }
    }
    function Y0(e, t, n, r) {
        switch(R0(t)){
            case 1:
                var s = S1;
                break;
            case 4:
                s = k1;
                break;
            default:
                s = Ec;
        }
        n = s.bind(null, t, n, e), s = void 0, !nu || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (s = !0), r ? s !== void 0 ? e.addEventListener(t, n, {
            capture: !0,
            passive: s
        }) : e.addEventListener(t, n, !0) : s !== void 0 ? e.addEventListener(t, n, {
            passive: s
        }) : e.addEventListener(t, n, !1);
    }
    function cl(e, t, n, r, s) {
        var o = r;
        if (!(t & 1) && !(t & 2) && r !== null) e: for(;;){
            if (r === null) return;
            var i = r.tag;
            if (i === 3 || i === 4) {
                var a = r.stateNode.containerInfo;
                if (a === s || a.nodeType === 8 && a.parentNode === s) break;
                if (i === 4) for(i = r.return; i !== null;){
                    var l = i.tag;
                    if ((l === 3 || l === 4) && (l = i.stateNode.containerInfo, l === s || l.nodeType === 8 && l.parentNode === s)) return;
                    i = i.return;
                }
                for(; a !== null;){
                    if (i = cr(a), i === null) return;
                    if (l = i.tag, l === 5 || l === 6) {
                        r = o = i;
                        continue e;
                    }
                    a = a.parentNode;
                }
            }
            r = r.return;
        }
        w0(function() {
            var f = o, c = xc(n), u = [];
            e: {
                var h = Q0.get(e);
                if (h !== void 0) {
                    var d = Ac, p = e;
                    switch(e){
                        case "keypress":
                            if (_i(n) === 0) break e;
                        case "keydown":
                        case "keyup":
                            d = z1;
                            break;
                        case "focusin":
                            p = "focus", d = rl;
                            break;
                        case "focusout":
                            p = "blur", d = rl;
                            break;
                        case "beforeblur":
                        case "afterblur":
                            d = rl;
                            break;
                        case "click":
                            if (n.button === 2) break e;
                        case "auxclick":
                        case "dblclick":
                        case "mousedown":
                        case "mousemove":
                        case "mouseup":
                        case "mouseout":
                        case "mouseover":
                        case "contextmenu":
                            d = od;
                            break;
                        case "drag":
                        case "dragend":
                        case "dragenter":
                        case "dragexit":
                        case "dragleave":
                        case "dragover":
                        case "dragstart":
                        case "drop":
                            d = I1;
                            break;
                        case "touchcancel":
                        case "touchend":
                        case "touchmove":
                        case "touchstart":
                            d = B1;
                            break;
                        case V0:
                        case W0:
                        case K0:
                            d = T1;
                            break;
                        case G0:
                            d = V1;
                            break;
                        case "scroll":
                            d = C1;
                            break;
                        case "wheel":
                            d = K1;
                            break;
                        case "copy":
                        case "cut":
                        case "paste":
                            d = M1;
                            break;
                        case "gotpointercapture":
                        case "lostpointercapture":
                        case "pointercancel":
                        case "pointerdown":
                        case "pointermove":
                        case "pointerout":
                        case "pointerover":
                        case "pointerup":
                            d = ad;
                    }
                    var m = (t & 4) !== 0, x = !m && e === "scroll", w = m ? h !== null ? h + "Capture" : null : h;
                    m = [];
                    for(var _ = f, g; _ !== null;){
                        g = _;
                        var A = g.stateNode;
                        if (g.tag === 5 && A !== null && (g = A, w !== null && (A = to(_, w), A != null && m.push(lo(_, A, g)))), x) break;
                        _ = _.return;
                    }
                    0 < m.length && (h = new d(h, p, null, n, c), u.push({
                        event: h,
                        listeners: m
                    }));
                }
            }
            if (!(t & 7)) {
                e: {
                    if (h = e === "mouseover" || e === "pointerover", d = e === "mouseout" || e === "pointerout", h && n !== eu && (p = n.relatedTarget || n.fromElement) && (cr(p) || p[Sn])) break e;
                    if ((d || h) && (h = c.window === c ? c : (h = c.ownerDocument) ? h.defaultView || h.parentWindow : window, d ? (p = n.relatedTarget || n.toElement, d = f, p = p ? cr(p) : null, p !== null && (x = Tr(p), p !== x || p.tag !== 5 && p.tag !== 6) && (p = null)) : (d = null, p = f), d !== p)) {
                        if (m = od, A = "onMouseLeave", w = "onMouseEnter", _ = "mouse", (e === "pointerout" || e === "pointerover") && (m = ad, A = "onPointerLeave", w = "onPointerEnter", _ = "pointer"), x = d == null ? h : Gr(d), g = p == null ? h : Gr(p), h = new m(A, _ + "leave", d, n, c), h.target = x, h.relatedTarget = g, A = null, cr(c) === f && (m = new m(w, _ + "enter", p, n, c), m.target = g, m.relatedTarget = x, A = m), x = A, d && p) t: {
                            for(m = d, w = p, _ = 0, g = m; g; g = Pr(g))_++;
                            for(g = 0, A = w; A; A = Pr(A))g++;
                            for(; 0 < _ - g;)m = Pr(m), _--;
                            for(; 0 < g - _;)w = Pr(w), g--;
                            for(; _--;){
                                if (m === w || w !== null && m === w.alternate) break t;
                                m = Pr(m), w = Pr(w);
                            }
                            m = null;
                        }
                        else m = null;
                        d !== null && _d(u, h, d, m, !1), p !== null && x !== null && _d(u, x, p, m, !0);
                    }
                }
                e: {
                    if (h = f ? Gr(f) : window, d = h.nodeName && h.nodeName.toLowerCase(), d === "select" || d === "input" && h.type === "file") var P = q1;
                    else if (cd(h)) if (z0) P = rw;
                    else {
                        P = tw;
                        var j = ew;
                    }
                    else (d = h.nodeName) && d.toLowerCase() === "input" && (h.type === "checkbox" || h.type === "radio") && (P = nw);
                    if (P && (P = P(e, f))) {
                        F0(u, P, n, c);
                        break e;
                    }
                    j && j(e, h, f), e === "focusout" && (j = h._wrapperState) && j.controlled && h.type === "number" && Jl(h, "number", h.value);
                }
                switch(j = f ? Gr(f) : window, e){
                    case "focusin":
                        (cd(j) || j.contentEditable === "true") && (Wr = j, au = f, Ks = null);
                        break;
                    case "focusout":
                        Ks = au = Wr = null;
                        break;
                    case "mousedown":
                        lu = !0;
                        break;
                    case "contextmenu":
                    case "mouseup":
                    case "dragend":
                        lu = !1, gd(u, n, c);
                        break;
                    case "selectionchange":
                        if (iw) break;
                    case "keydown":
                    case "keyup":
                        gd(u, n, c);
                }
                var N;
                if (Tc) e: {
                    switch(e){
                        case "compositionstart":
                            var F = "onCompositionStart";
                            break e;
                        case "compositionend":
                            F = "onCompositionEnd";
                            break e;
                        case "compositionupdate":
                            F = "onCompositionUpdate";
                            break e;
                    }
                    F = void 0;
                }
                else Vr ? L0(e, n) && (F = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (F = "onCompositionStart");
                F && (D0 && n.locale !== "ko" && (Vr || F !== "onCompositionStart" ? F === "onCompositionEnd" && Vr && (N = P0()) : (Hn = c, Ic = "value" in Hn ? Hn.value : Hn.textContent, Vr = !0)), j = zi(f, F), 0 < j.length && (F = new id(F, e, null, n, c), u.push({
                    event: F,
                    listeners: j
                }), N ? F.data = N : (N = U0(n), N !== null && (F.data = N)))), (N = Q1 ? J1(e, n) : Y1(e, n)) && (f = zi(f, "onBeforeInput"), 0 < f.length && (c = new id("onBeforeInput", "beforeinput", null, n, c), u.push({
                    event: c,
                    listeners: f
                }), c.data = N));
            }
            J0(u, t);
        });
    }
    function lo(e, t, n) {
        return {
            instance: e,
            listener: t,
            currentTarget: n
        };
    }
    function zi(e, t) {
        for(var n = t + "Capture", r = []; e !== null;){
            var s = e, o = s.stateNode;
            s.tag === 5 && o !== null && (s = o, o = to(e, n), o != null && r.unshift(lo(e, o, s)), o = to(e, t), o != null && r.push(lo(e, o, s))), e = e.return;
        }
        return r;
    }
    function Pr(e) {
        if (e === null) return null;
        do e = e.return;
        while (e && e.tag !== 5);
        return e || null;
    }
    function _d(e, t, n, r, s) {
        for(var o = t._reactName, i = []; n !== null && n !== r;){
            var a = n, l = a.alternate, f = a.stateNode;
            if (l !== null && l === r) break;
            a.tag === 5 && f !== null && (a = f, s ? (l = to(n, o), l != null && i.unshift(lo(n, l, a))) : s || (l = to(n, o), l != null && i.push(lo(n, l, a)))), n = n.return;
        }
        i.length !== 0 && e.push({
            event: t,
            listeners: i
        });
    }
    var cw = /\r\n?/g, fw = /\u0000|\uFFFD/g;
    function wd(e) {
        return (typeof e == "string" ? e : "" + e).replace(cw, `
`).replace(fw, "");
    }
    function Zo(e, t, n) {
        if (t = wd(t), wd(e) !== t && n) throw Error(Q(425));
    }
    function Hi() {}
    var uu = null, cu = null;
    function fu(e, t) {
        return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
    }
    var du = typeof setTimeout == "function" ? setTimeout : void 0, dw = typeof clearTimeout == "function" ? clearTimeout : void 0, vd = typeof Promise == "function" ? Promise : void 0, hw = typeof queueMicrotask == "function" ? queueMicrotask : typeof vd < "u" ? function(e) {
        return vd.resolve(null).then(e).catch(pw);
    } : du;
    function pw(e) {
        setTimeout(function() {
            throw e;
        });
    }
    function fl(e, t) {
        var n = t, r = 0;
        do {
            var s = n.nextSibling;
            if (e.removeChild(n), s && s.nodeType === 8) if (n = s.data, n === "/$") {
                if (r === 0) {
                    e.removeChild(s), so(t);
                    return;
                }
                r--;
            } else n !== "$" && n !== "$?" && n !== "$!" || r++;
            n = s;
        }while (n);
        so(t);
    }
    function Wn(e) {
        for(; e != null; e = e.nextSibling){
            var t = e.nodeType;
            if (t === 1 || t === 3) break;
            if (t === 8) {
                if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
                if (t === "/$") return null;
            }
        }
        return e;
    }
    function bd(e) {
        e = e.previousSibling;
        for(var t = 0; e;){
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === "$" || n === "$!" || n === "$?") {
                    if (t === 0) return e;
                    t--;
                } else n === "/$" && t++;
            }
            e = e.previousSibling;
        }
        return null;
    }
    var Ss = Math.random().toString(36).slice(2), an = "__reactFiber$" + Ss, uo = "__reactProps$" + Ss, Sn = "__reactContainer$" + Ss, hu = "__reactEvents$" + Ss, gw = "__reactListeners$" + Ss, yw = "__reactHandles$" + Ss;
    function cr(e) {
        var t = e[an];
        if (t) return t;
        for(var n = e.parentNode; n;){
            if (t = n[Sn] || n[an]) {
                if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for(e = bd(e); e !== null;){
                    if (n = e[an]) return n;
                    e = bd(e);
                }
                return t;
            }
            e = n, n = e.parentNode;
        }
        return null;
    }
    function Po(e) {
        return e = e[an] || e[Sn], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
    }
    function Gr(e) {
        if (e.tag === 5 || e.tag === 6) return e.stateNode;
        throw Error(Q(33));
    }
    function va(e) {
        return e[uo] || null;
    }
    var pu = [], Qr = -1;
    function nr(e) {
        return {
            current: e
        };
    }
    function we(e) {
        0 > Qr || (e.current = pu[Qr], pu[Qr] = null, Qr--);
    }
    function ge(e, t) {
        Qr++, pu[Qr] = e.current, e.current = t;
    }
    var qn = {}, qe = nr(qn), ht = nr(!1), br = qn;
    function cs(e, t) {
        var n = e.type.contextTypes;
        if (!n) return qn;
        var r = e.stateNode;
        if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
        var s = {}, o;
        for(o in n)s[o] = t[o];
        return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = s), s;
    }
    function pt(e) {
        return e = e.childContextTypes, e != null;
    }
    function Ni() {
        we(ht), we(qe);
    }
    function xd(e, t, n) {
        if (qe.current !== qn) throw Error(Q(168));
        ge(qe, t), ge(ht, n);
    }
    function X0(e, t, n) {
        var r = e.stateNode;
        if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
        r = r.getChildContext();
        for(var s in r)if (!(s in t)) throw Error(Q(108, e1(e) || "Unknown", s));
        return Se({}, n, r);
    }
    function Bi(e) {
        return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || qn, br = qe.current, ge(qe, e), ge(ht, ht.current), !0;
    }
    function Sd(e, t, n) {
        var r = e.stateNode;
        if (!r) throw Error(Q(169));
        n ? (e = X0(e, t, br), r.__reactInternalMemoizedMergedChildContext = e, we(ht), we(qe), ge(qe, e)) : we(ht), ge(ht, n);
    }
    var yn = null, ba = !1, dl = !1;
    function Z0(e) {
        yn === null ? yn = [
            e
        ] : yn.push(e);
    }
    function mw(e) {
        ba = !0, Z0(e);
    }
    function rr() {
        if (!dl && yn !== null) {
            dl = !0;
            var e = 0, t = fe;
            try {
                var n = yn;
                for(fe = 1; e < n.length; e++){
                    var r = n[e];
                    do r = r(!0);
                    while (r !== null);
                }
                yn = null, ba = !1;
            } catch (s) {
                throw yn !== null && (yn = yn.slice(e + 1)), S0(Sc, rr), s;
            } finally{
                fe = t, dl = !1;
            }
        }
        return null;
    }
    var Jr = [], Yr = 0, $i = null, Vi = 0, At = [], Ot = 0, xr = null, _n = 1, wn = "";
    function sr(e, t) {
        Jr[Yr++] = Vi, Jr[Yr++] = $i, $i = e, Vi = t;
    }
    function q0(e, t, n) {
        At[Ot++] = _n, At[Ot++] = wn, At[Ot++] = xr, xr = e;
        var r = _n;
        e = wn;
        var s = 32 - Gt(r) - 1;
        r &= ~(1 << s), n += 1;
        var o = 32 - Gt(t) + s;
        if (30 < o) {
            var i = s - s % 5;
            o = (r & (1 << i) - 1).toString(32), r >>= i, s -= i, _n = 1 << 32 - Gt(t) + s | n << s | r, wn = o + e;
        } else _n = 1 << o | n << s | r, wn = e;
    }
    function Mc(e) {
        e.return !== null && (sr(e, 1), q0(e, 1, 0));
    }
    function Rc(e) {
        for(; e === $i;)$i = Jr[--Yr], Jr[Yr] = null, Vi = Jr[--Yr], Jr[Yr] = null;
        for(; e === xr;)xr = At[--Ot], At[Ot] = null, wn = At[--Ot], At[Ot] = null, _n = At[--Ot], At[Ot] = null;
    }
    var xt = null, bt = null, ve = !1, Wt = null;
    function ep(e, t) {
        var n = Ut(5, null, null, 0);
        n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [
            n
        ], e.flags |= 16) : t.push(n);
    }
    function kd(e, t) {
        switch(e.tag){
            case 5:
                var n = e.type;
                return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, xt = e, bt = Wn(t.firstChild), !0) : !1;
            case 6:
                return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, xt = e, bt = null, !0) : !1;
            case 13:
                return t = t.nodeType !== 8 ? null : t, t !== null ? (n = xr !== null ? {
                    id: _n,
                    overflow: wn
                } : null, e.memoizedState = {
                    dehydrated: t,
                    treeContext: n,
                    retryLane: 1073741824
                }, n = Ut(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, xt = e, bt = null, !0) : !1;
            default:
                return !1;
        }
    }
    function gu(e) {
        return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
    }
    function yu(e) {
        if (ve) {
            var t = bt;
            if (t) {
                var n = t;
                if (!kd(e, t)) {
                    if (gu(e)) throw Error(Q(418));
                    t = Wn(n.nextSibling);
                    var r = xt;
                    t && kd(e, t) ? ep(r, n) : (e.flags = e.flags & -4097 | 2, ve = !1, xt = e);
                }
            } else {
                if (gu(e)) throw Error(Q(418));
                e.flags = e.flags & -4097 | 2, ve = !1, xt = e;
            }
        }
    }
    function Cd(e) {
        for(e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;)e = e.return;
        xt = e;
    }
    function qo(e) {
        if (e !== xt) return !1;
        if (!ve) return Cd(e), ve = !0, !1;
        var t;
        if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !fu(e.type, e.memoizedProps)), t && (t = bt)) {
            if (gu(e)) throw tp(), Error(Q(418));
            for(; t;)ep(e, t), t = Wn(t.nextSibling);
        }
        if (Cd(e), e.tag === 13) {
            if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(Q(317));
            e: {
                for(e = e.nextSibling, t = 0; e;){
                    if (e.nodeType === 8) {
                        var n = e.data;
                        if (n === "/$") {
                            if (t === 0) {
                                bt = Wn(e.nextSibling);
                                break e;
                            }
                            t--;
                        } else n !== "$" && n !== "$!" && n !== "$?" || t++;
                    }
                    e = e.nextSibling;
                }
                bt = null;
            }
        } else bt = xt ? Wn(e.stateNode.nextSibling) : null;
        return !0;
    }
    function tp() {
        for(var e = bt; e;)e = Wn(e.nextSibling);
    }
    function fs() {
        bt = xt = null, ve = !1;
    }
    function Pc(e) {
        Wt === null ? Wt = [
            e
        ] : Wt.push(e);
    }
    var _w = En.ReactCurrentBatchConfig;
    function Ts(e, t, n) {
        if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
            if (n._owner) {
                if (n = n._owner, n) {
                    if (n.tag !== 1) throw Error(Q(309));
                    var r = n.stateNode;
                }
                if (!r) throw Error(Q(147, e));
                var s = r, o = "" + e;
                return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(i) {
                    var a = s.refs;
                    i === null ? delete a[o] : a[o] = i;
                }, t._stringRef = o, t);
            }
            if (typeof e != "string") throw Error(Q(284));
            if (!n._owner) throw Error(Q(290, e));
        }
        return e;
    }
    function ei(e, t) {
        throw e = Object.prototype.toString.call(t), Error(Q(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
    }
    function Ed(e) {
        var t = e._init;
        return t(e._payload);
    }
    function np(e) {
        function t(w, _) {
            if (e) {
                var g = w.deletions;
                g === null ? (w.deletions = [
                    _
                ], w.flags |= 16) : g.push(_);
            }
        }
        function n(w, _) {
            if (!e) return null;
            for(; _ !== null;)t(w, _), _ = _.sibling;
            return null;
        }
        function r(w, _) {
            for(w = new Map; _ !== null;)_.key !== null ? w.set(_.key, _) : w.set(_.index, _), _ = _.sibling;
            return w;
        }
        function s(w, _) {
            return w = Jn(w, _), w.index = 0, w.sibling = null, w;
        }
        function o(w, _, g) {
            return w.index = g, e ? (g = w.alternate, g !== null ? (g = g.index, g < _ ? (w.flags |= 2, _) : g) : (w.flags |= 2, _)) : (w.flags |= 1048576, _);
        }
        function i(w) {
            return e && w.alternate === null && (w.flags |= 2), w;
        }
        function a(w, _, g, A) {
            return _ === null || _.tag !== 6 ? (_ = wl(g, w.mode, A), _.return = w, _) : (_ = s(_, g), _.return = w, _);
        }
        function l(w, _, g, A) {
            var P = g.type;
            return P === $r ? c(w, _, g.props.children, A, g.key) : _ !== null && (_.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Ln && Ed(P) === _.type) ? (A = s(_, g.props), A.ref = Ts(w, _, g), A.return = w, A) : (A = Ci(g.type, g.key, g.props, null, w.mode, A), A.ref = Ts(w, _, g), A.return = w, A);
        }
        function f(w, _, g, A) {
            return _ === null || _.tag !== 4 || _.stateNode.containerInfo !== g.containerInfo || _.stateNode.implementation !== g.implementation ? (_ = vl(g, w.mode, A), _.return = w, _) : (_ = s(_, g.children || []), _.return = w, _);
        }
        function c(w, _, g, A, P) {
            return _ === null || _.tag !== 7 ? (_ = gr(g, w.mode, A, P), _.return = w, _) : (_ = s(_, g), _.return = w, _);
        }
        function u(w, _, g) {
            if (typeof _ == "string" && _ !== "" || typeof _ == "number") return _ = wl("" + _, w.mode, g), _.return = w, _;
            if (typeof _ == "object" && _ !== null) {
                switch(_.$$typeof){
                    case $o:
                        return g = Ci(_.type, _.key, _.props, null, w.mode, g), g.ref = Ts(w, null, _), g.return = w, g;
                    case Br:
                        return _ = vl(_, w.mode, g), _.return = w, _;
                    case Ln:
                        var A = _._init;
                        return u(w, A(_._payload), g);
                }
                if (Us(_) || Cs(_)) return _ = gr(_, w.mode, g, null), _.return = w, _;
                ei(w, _);
            }
            return null;
        }
        function h(w, _, g, A) {
            var P = _ !== null ? _.key : null;
            if (typeof g == "string" && g !== "" || typeof g == "number") return P !== null ? null : a(w, _, "" + g, A);
            if (typeof g == "object" && g !== null) {
                switch(g.$$typeof){
                    case $o:
                        return g.key === P ? l(w, _, g, A) : null;
                    case Br:
                        return g.key === P ? f(w, _, g, A) : null;
                    case Ln:
                        return P = g._init, h(w, _, P(g._payload), A);
                }
                if (Us(g) || Cs(g)) return P !== null ? null : c(w, _, g, A, null);
                ei(w, g);
            }
            return null;
        }
        function d(w, _, g, A, P) {
            if (typeof A == "string" && A !== "" || typeof A == "number") return w = w.get(g) || null, a(_, w, "" + A, P);
            if (typeof A == "object" && A !== null) {
                switch(A.$$typeof){
                    case $o:
                        return w = w.get(A.key === null ? g : A.key) || null, l(_, w, A, P);
                    case Br:
                        return w = w.get(A.key === null ? g : A.key) || null, f(_, w, A, P);
                    case Ln:
                        var j = A._init;
                        return d(w, _, g, j(A._payload), P);
                }
                if (Us(A) || Cs(A)) return w = w.get(g) || null, c(_, w, A, P, null);
                ei(_, A);
            }
            return null;
        }
        function p(w, _, g, A) {
            for(var P = null, j = null, N = _, F = _ = 0, J = null; N !== null && F < g.length; F++){
                N.index > F ? (J = N, N = null) : J = N.sibling;
                var K = h(w, N, g[F], A);
                if (K === null) {
                    N === null && (N = J);
                    break;
                }
                e && N && K.alternate === null && t(w, N), _ = o(K, _, F), j === null ? P = K : j.sibling = K, j = K, N = J;
            }
            if (F === g.length) return n(w, N), ve && sr(w, F), P;
            if (N === null) {
                for(; F < g.length; F++)N = u(w, g[F], A), N !== null && (_ = o(N, _, F), j === null ? P = N : j.sibling = N, j = N);
                return ve && sr(w, F), P;
            }
            for(N = r(w, N); F < g.length; F++)J = d(N, w, F, g[F], A), J !== null && (e && J.alternate !== null && N.delete(J.key === null ? F : J.key), _ = o(J, _, F), j === null ? P = J : j.sibling = J, j = J);
            return e && N.forEach(function(se) {
                return t(w, se);
            }), ve && sr(w, F), P;
        }
        function m(w, _, g, A) {
            var P = Cs(g);
            if (typeof P != "function") throw Error(Q(150));
            if (g = P.call(g), g == null) throw Error(Q(151));
            for(var j = P = null, N = _, F = _ = 0, J = null, K = g.next(); N !== null && !K.done; F++, K = g.next()){
                N.index > F ? (J = N, N = null) : J = N.sibling;
                var se = h(w, N, K.value, A);
                if (se === null) {
                    N === null && (N = J);
                    break;
                }
                e && N && se.alternate === null && t(w, N), _ = o(se, _, F), j === null ? P = se : j.sibling = se, j = se, N = J;
            }
            if (K.done) return n(w, N), ve && sr(w, F), P;
            if (N === null) {
                for(; !K.done; F++, K = g.next())K = u(w, K.value, A), K !== null && (_ = o(K, _, F), j === null ? P = K : j.sibling = K, j = K);
                return ve && sr(w, F), P;
            }
            for(N = r(w, N); !K.done; F++, K = g.next())K = d(N, w, F, K.value, A), K !== null && (e && K.alternate !== null && N.delete(K.key === null ? F : K.key), _ = o(K, _, F), j === null ? P = K : j.sibling = K, j = K);
            return e && N.forEach(function(H) {
                return t(w, H);
            }), ve && sr(w, F), P;
        }
        function x(w, _, g, A) {
            if (typeof g == "object" && g !== null && g.type === $r && g.key === null && (g = g.props.children), typeof g == "object" && g !== null) {
                switch(g.$$typeof){
                    case $o:
                        e: {
                            for(var P = g.key, j = _; j !== null;){
                                if (j.key === P) {
                                    if (P = g.type, P === $r) {
                                        if (j.tag === 7) {
                                            n(w, j.sibling), _ = s(j, g.props.children), _.return = w, w = _;
                                            break e;
                                        }
                                    } else if (j.elementType === P || typeof P == "object" && P !== null && P.$$typeof === Ln && Ed(P) === j.type) {
                                        n(w, j.sibling), _ = s(j, g.props), _.ref = Ts(w, j, g), _.return = w, w = _;
                                        break e;
                                    }
                                    n(w, j);
                                    break;
                                } else t(w, j);
                                j = j.sibling;
                            }
                            g.type === $r ? (_ = gr(g.props.children, w.mode, A, g.key), _.return = w, w = _) : (A = Ci(g.type, g.key, g.props, null, w.mode, A), A.ref = Ts(w, _, g), A.return = w, w = A);
                        }
                        return i(w);
                    case Br:
                        e: {
                            for(j = g.key; _ !== null;){
                                if (_.key === j) if (_.tag === 4 && _.stateNode.containerInfo === g.containerInfo && _.stateNode.implementation === g.implementation) {
                                    n(w, _.sibling), _ = s(_, g.children || []), _.return = w, w = _;
                                    break e;
                                } else {
                                    n(w, _);
                                    break;
                                }
                                else t(w, _);
                                _ = _.sibling;
                            }
                            _ = vl(g, w.mode, A), _.return = w, w = _;
                        }
                        return i(w);
                    case Ln:
                        return j = g._init, x(w, _, j(g._payload), A);
                }
                if (Us(g)) return p(w, _, g, A);
                if (Cs(g)) return m(w, _, g, A);
                ei(w, g);
            }
            return typeof g == "string" && g !== "" || typeof g == "number" ? (g = "" + g, _ !== null && _.tag === 6 ? (n(w, _.sibling), _ = s(_, g), _.return = w, w = _) : (n(w, _), _ = wl(g, w.mode, A), _.return = w, w = _), i(w)) : n(w, _);
        }
        return x;
    }
    var ds = np(!0), rp = np(!1), Wi = nr(null), Ki = null, Xr = null, Dc = null;
    function Lc() {
        Dc = Xr = Ki = null;
    }
    function Uc(e) {
        var t = Wi.current;
        we(Wi), e._currentValue = t;
    }
    function mu(e, t, n) {
        for(; e !== null;){
            var r = e.alternate;
            if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
            e = e.return;
        }
    }
    function as(e, t) {
        Ki = e, Dc = Xr = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (dt = !0), e.firstContext = null);
    }
    function Ht(e) {
        var t = e._currentValue;
        if (Dc !== e) if (e = {
            context: e,
            memoizedValue: t,
            next: null
        }, Xr === null) {
            if (Ki === null) throw Error(Q(308));
            Xr = e, Ki.dependencies = {
                lanes: 0,
                firstContext: e
            };
        } else Xr = Xr.next = e;
        return t;
    }
    var fr = null;
    function Fc(e) {
        fr === null ? fr = [
            e
        ] : fr.push(e);
    }
    function sp(e, t, n, r) {
        var s = t.interleaved;
        return s === null ? (n.next = n, Fc(t)) : (n.next = s.next, s.next = n), t.interleaved = n, kn(e, r);
    }
    function kn(e, t) {
        e.lanes |= t;
        var n = e.alternate;
        for(n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;)e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
        return n.tag === 3 ? n.stateNode : null;
    }
    var Un = !1;
    function zc(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                pending: null,
                interleaved: null,
                lanes: 0
            },
            effects: null
        };
    }
    function op(e, t) {
        e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            effects: e.effects
        });
    }
    function bn(e, t) {
        return {
            eventTime: e,
            lane: t,
            tag: 0,
            payload: null,
            callback: null,
            next: null
        };
    }
    function Kn(e, t, n) {
        var r = e.updateQueue;
        if (r === null) return null;
        if (r = r.shared, ce & 2) {
            var s = r.pending;
            return s === null ? t.next = t : (t.next = s.next, s.next = t), r.pending = t, kn(e, n);
        }
        return s = r.interleaved, s === null ? (t.next = t, Fc(r)) : (t.next = s.next, s.next = t), r.interleaved = t, kn(e, n);
    }
    function wi(e, t, n) {
        if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
            var r = t.lanes;
            r &= e.pendingLanes, n |= r, t.lanes = n, kc(e, n);
        }
    }
    function Id(e, t) {
        var n = e.updateQueue, r = e.alternate;
        if (r !== null && (r = r.updateQueue, n === r)) {
            var s = null, o = null;
            if (n = n.firstBaseUpdate, n !== null) {
                do {
                    var i = {
                        eventTime: n.eventTime,
                        lane: n.lane,
                        tag: n.tag,
                        payload: n.payload,
                        callback: n.callback,
                        next: null
                    };
                    o === null ? s = o = i : o = o.next = i, n = n.next;
                }while (n !== null);
                o === null ? s = o = t : o = o.next = t;
            } else s = o = t;
            n = {
                baseState: r.baseState,
                firstBaseUpdate: s,
                lastBaseUpdate: o,
                shared: r.shared,
                effects: r.effects
            }, e.updateQueue = n;
            return;
        }
        e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
    }
    function Gi(e, t, n, r) {
        var s = e.updateQueue;
        Un = !1;
        var o = s.firstBaseUpdate, i = s.lastBaseUpdate, a = s.shared.pending;
        if (a !== null) {
            s.shared.pending = null;
            var l = a, f = l.next;
            l.next = null, i === null ? o = f : i.next = f, i = l;
            var c = e.alternate;
            c !== null && (c = c.updateQueue, a = c.lastBaseUpdate, a !== i && (a === null ? c.firstBaseUpdate = f : a.next = f, c.lastBaseUpdate = l));
        }
        if (o !== null) {
            var u = s.baseState;
            i = 0, c = f = l = null, a = o;
            do {
                var h = a.lane, d = a.eventTime;
                if ((r & h) === h) {
                    c !== null && (c = c.next = {
                        eventTime: d,
                        lane: 0,
                        tag: a.tag,
                        payload: a.payload,
                        callback: a.callback,
                        next: null
                    });
                    e: {
                        var p = e, m = a;
                        switch(h = t, d = n, m.tag){
                            case 1:
                                if (p = m.payload, typeof p == "function") {
                                    u = p.call(d, u, h);
                                    break e;
                                }
                                u = p;
                                break e;
                            case 3:
                                p.flags = p.flags & -65537 | 128;
                            case 0:
                                if (p = m.payload, h = typeof p == "function" ? p.call(d, u, h) : p, h == null) break e;
                                u = Se({}, u, h);
                                break e;
                            case 2:
                                Un = !0;
                        }
                    }
                    a.callback !== null && a.lane !== 0 && (e.flags |= 64, h = s.effects, h === null ? s.effects = [
                        a
                    ] : h.push(a));
                } else d = {
                    eventTime: d,
                    lane: h,
                    tag: a.tag,
                    payload: a.payload,
                    callback: a.callback,
                    next: null
                }, c === null ? (f = c = d, l = u) : c = c.next = d, i |= h;
                if (a = a.next, a === null) {
                    if (a = s.shared.pending, a === null) break;
                    h = a, a = h.next, h.next = null, s.lastBaseUpdate = h, s.shared.pending = null;
                }
            }while (1);
            if (c === null && (l = u), s.baseState = l, s.firstBaseUpdate = f, s.lastBaseUpdate = c, t = s.shared.interleaved, t !== null) {
                s = t;
                do i |= s.lane, s = s.next;
                while (s !== t);
            } else o === null && (s.shared.lanes = 0);
            kr |= i, e.lanes = i, e.memoizedState = u;
        }
    }
    function Ad(e, t, n) {
        if (e = t.effects, t.effects = null, e !== null) for(t = 0; t < e.length; t++){
            var r = e[t], s = r.callback;
            if (s !== null) {
                if (r.callback = null, r = n, typeof s != "function") throw Error(Q(191, s));
                s.call(r);
            }
        }
    }
    var Do = {}, hn = nr(Do), co = nr(Do), fo = nr(Do);
    function dr(e) {
        if (e === Do) throw Error(Q(174));
        return e;
    }
    function Hc(e, t) {
        switch(ge(fo, t), ge(co, e), ge(hn, Do), e = t.nodeType, e){
            case 9:
            case 11:
                t = (t = t.documentElement) ? t.namespaceURI : Xl(null, "");
                break;
            default:
                e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Xl(t, e);
        }
        we(hn), ge(hn, t);
    }
    function hs() {
        we(hn), we(co), we(fo);
    }
    function ip(e) {
        dr(fo.current);
        var t = dr(hn.current), n = Xl(t, e.type);
        t !== n && (ge(co, e), ge(hn, n));
    }
    function Nc(e) {
        co.current === e && (we(hn), we(co));
    }
    var be = nr(0);
    function Qi(e) {
        for(var t = e; t !== null;){
            if (t.tag === 13) {
                var n = t.memoizedState;
                if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
            } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
                if (t.flags & 128) return t;
            } else if (t.child !== null) {
                t.child.return = t, t = t.child;
                continue;
            }
            if (t === e) break;
            for(; t.sibling === null;){
                if (t.return === null || t.return === e) return null;
                t = t.return;
            }
            t.sibling.return = t.return, t = t.sibling;
        }
        return null;
    }
    var hl = [];
    function Bc() {
        for(var e = 0; e < hl.length; e++)hl[e]._workInProgressVersionPrimary = null;
        hl.length = 0;
    }
    var vi = En.ReactCurrentDispatcher, pl = En.ReactCurrentBatchConfig, Sr = 0, xe = null, De = null, Ne = null, Ji = !1, Gs = !1, ho = 0, ww = 0;
    function Qe() {
        throw Error(Q(321));
    }
    function $c(e, t) {
        if (t === null) return !1;
        for(var n = 0; n < t.length && n < e.length; n++)if (!Jt(e[n], t[n])) return !1;
        return !0;
    }
    function Vc(e, t, n, r, s, o) {
        if (Sr = o, xe = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, vi.current = e === null || e.memoizedState === null ? Sw : kw, e = n(r, s), Gs) {
            o = 0;
            do {
                if (Gs = !1, ho = 0, 25 <= o) throw Error(Q(301));
                o += 1, Ne = De = null, t.updateQueue = null, vi.current = Cw, e = n(r, s);
            }while (Gs);
        }
        if (vi.current = Yi, t = De !== null && De.next !== null, Sr = 0, Ne = De = xe = null, Ji = !1, t) throw Error(Q(300));
        return e;
    }
    function Wc() {
        var e = ho !== 0;
        return ho = 0, e;
    }
    function nn() {
        var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null
        };
        return Ne === null ? xe.memoizedState = Ne = e : Ne = Ne.next = e, Ne;
    }
    function Nt() {
        if (De === null) {
            var e = xe.alternate;
            e = e !== null ? e.memoizedState : null;
        } else e = De.next;
        var t = Ne === null ? xe.memoizedState : Ne.next;
        if (t !== null) Ne = t, De = e;
        else {
            if (e === null) throw Error(Q(310));
            De = e, e = {
                memoizedState: De.memoizedState,
                baseState: De.baseState,
                baseQueue: De.baseQueue,
                queue: De.queue,
                next: null
            }, Ne === null ? xe.memoizedState = Ne = e : Ne = Ne.next = e;
        }
        return Ne;
    }
    function po(e, t) {
        return typeof t == "function" ? t(e) : t;
    }
    function gl(e) {
        var t = Nt(), n = t.queue;
        if (n === null) throw Error(Q(311));
        n.lastRenderedReducer = e;
        var r = De, s = r.baseQueue, o = n.pending;
        if (o !== null) {
            if (s !== null) {
                var i = s.next;
                s.next = o.next, o.next = i;
            }
            r.baseQueue = s = o, n.pending = null;
        }
        if (s !== null) {
            o = s.next, r = r.baseState;
            var a = i = null, l = null, f = o;
            do {
                var c = f.lane;
                if ((Sr & c) === c) l !== null && (l = l.next = {
                    lane: 0,
                    action: f.action,
                    hasEagerState: f.hasEagerState,
                    eagerState: f.eagerState,
                    next: null
                }), r = f.hasEagerState ? f.eagerState : e(r, f.action);
                else {
                    var u = {
                        lane: c,
                        action: f.action,
                        hasEagerState: f.hasEagerState,
                        eagerState: f.eagerState,
                        next: null
                    };
                    l === null ? (a = l = u, i = r) : l = l.next = u, xe.lanes |= c, kr |= c;
                }
                f = f.next;
            }while (f !== null && f !== o);
            l === null ? i = r : l.next = a, Jt(r, t.memoizedState) || (dt = !0), t.memoizedState = r, t.baseState = i, t.baseQueue = l, n.lastRenderedState = r;
        }
        if (e = n.interleaved, e !== null) {
            s = e;
            do o = s.lane, xe.lanes |= o, kr |= o, s = s.next;
            while (s !== e);
        } else s === null && (n.lanes = 0);
        return [
            t.memoizedState,
            n.dispatch
        ];
    }
    function yl(e) {
        var t = Nt(), n = t.queue;
        if (n === null) throw Error(Q(311));
        n.lastRenderedReducer = e;
        var r = n.dispatch, s = n.pending, o = t.memoizedState;
        if (s !== null) {
            n.pending = null;
            var i = s = s.next;
            do o = e(o, i.action), i = i.next;
            while (i !== s);
            Jt(o, t.memoizedState) || (dt = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
        }
        return [
            o,
            r
        ];
    }
    function ap() {}
    function lp(e, t) {
        var n = xe, r = Nt(), s = t(), o = !Jt(r.memoizedState, s);
        if (o && (r.memoizedState = s, dt = !0), r = r.queue, Kc(fp.bind(null, n, r, e), [
            e
        ]), r.getSnapshot !== t || o || Ne !== null && Ne.memoizedState.tag & 1) {
            if (n.flags |= 2048, go(9, cp.bind(null, n, r, s, t), void 0, null), $e === null) throw Error(Q(349));
            Sr & 30 || up(n, t, s);
        }
        return s;
    }
    function up(e, t, n) {
        e.flags |= 16384, e = {
            getSnapshot: t,
            value: n
        }, t = xe.updateQueue, t === null ? (t = {
            lastEffect: null,
            stores: null
        }, xe.updateQueue = t, t.stores = [
            e
        ]) : (n = t.stores, n === null ? t.stores = [
            e
        ] : n.push(e));
    }
    function cp(e, t, n, r) {
        t.value = n, t.getSnapshot = r, dp(t) && hp(e);
    }
    function fp(e, t, n) {
        return n(function() {
            dp(t) && hp(e);
        });
    }
    function dp(e) {
        var t = e.getSnapshot;
        e = e.value;
        try {
            var n = t();
            return !Jt(e, n);
        } catch  {
            return !0;
        }
    }
    function hp(e) {
        var t = kn(e, 1);
        t !== null && Qt(t, e, 1, -1);
    }
    function Od(e) {
        var t = nn();
        return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: po,
            lastRenderedState: e
        }, t.queue = e, e = e.dispatch = xw.bind(null, xe, e), [
            t.memoizedState,
            e
        ];
    }
    function go(e, t, n, r) {
        return e = {
            tag: e,
            create: t,
            destroy: n,
            deps: r,
            next: null
        }, t = xe.updateQueue, t === null ? (t = {
            lastEffect: null,
            stores: null
        }, xe.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
    }
    function pp() {
        return Nt().memoizedState;
    }
    function bi(e, t, n, r) {
        var s = nn();
        xe.flags |= e, s.memoizedState = go(1 | t, n, void 0, r === void 0 ? null : r);
    }
    function xa(e, t, n, r) {
        var s = Nt();
        r = r === void 0 ? null : r;
        var o = void 0;
        if (De !== null) {
            var i = De.memoizedState;
            if (o = i.destroy, r !== null && $c(r, i.deps)) {
                s.memoizedState = go(t, n, o, r);
                return;
            }
        }
        xe.flags |= e, s.memoizedState = go(1 | t, n, o, r);
    }
    function Td(e, t) {
        return bi(8390656, 8, e, t);
    }
    function Kc(e, t) {
        return xa(2048, 8, e, t);
    }
    function gp(e, t) {
        return xa(4, 2, e, t);
    }
    function yp(e, t) {
        return xa(4, 4, e, t);
    }
    function mp(e, t) {
        if (typeof t == "function") return e = e(), t(e), function() {
            t(null);
        };
        if (t != null) return e = e(), t.current = e, function() {
            t.current = null;
        };
    }
    function _p(e, t, n) {
        return n = n != null ? n.concat([
            e
        ]) : null, xa(4, 4, mp.bind(null, t, e), n);
    }
    function Gc() {}
    function wp(e, t) {
        var n = Nt();
        t = t === void 0 ? null : t;
        var r = n.memoizedState;
        return r !== null && t !== null && $c(t, r[1]) ? r[0] : (n.memoizedState = [
            e,
            t
        ], e);
    }
    function vp(e, t) {
        var n = Nt();
        t = t === void 0 ? null : t;
        var r = n.memoizedState;
        return r !== null && t !== null && $c(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [
            e,
            t
        ], e);
    }
    function bp(e, t, n) {
        return Sr & 21 ? (Jt(n, t) || (n = E0(), xe.lanes |= n, kr |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, dt = !0), e.memoizedState = n);
    }
    function vw(e, t) {
        var n = fe;
        fe = n !== 0 && 4 > n ? n : 4, e(!0);
        var r = pl.transition;
        pl.transition = {};
        try {
            e(!1), t();
        } finally{
            fe = n, pl.transition = r;
        }
    }
    function xp() {
        return Nt().memoizedState;
    }
    function bw(e, t, n) {
        var r = Qn(e);
        if (n = {
            lane: r,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        }, Sp(e)) kp(t, n);
        else if (n = sp(e, t, n, r), n !== null) {
            var s = st();
            Qt(n, e, r, s), Cp(n, t, r);
        }
    }
    function xw(e, t, n) {
        var r = Qn(e), s = {
            lane: r,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        };
        if (Sp(e)) kp(t, s);
        else {
            var o = e.alternate;
            if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null)) try {
                var i = t.lastRenderedState, a = o(i, n);
                if (s.hasEagerState = !0, s.eagerState = a, Jt(a, i)) {
                    var l = t.interleaved;
                    l === null ? (s.next = s, Fc(t)) : (s.next = l.next, l.next = s), t.interleaved = s;
                    return;
                }
            } catch  {} finally{}
            n = sp(e, t, s, r), n !== null && (s = st(), Qt(n, e, r, s), Cp(n, t, r));
        }
    }
    function Sp(e) {
        var t = e.alternate;
        return e === xe || t !== null && t === xe;
    }
    function kp(e, t) {
        Gs = Ji = !0;
        var n = e.pending;
        n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
    }
    function Cp(e, t, n) {
        if (n & 4194240) {
            var r = t.lanes;
            r &= e.pendingLanes, n |= r, t.lanes = n, kc(e, n);
        }
    }
    var Yi = {
        readContext: Ht,
        useCallback: Qe,
        useContext: Qe,
        useEffect: Qe,
        useImperativeHandle: Qe,
        useInsertionEffect: Qe,
        useLayoutEffect: Qe,
        useMemo: Qe,
        useReducer: Qe,
        useRef: Qe,
        useState: Qe,
        useDebugValue: Qe,
        useDeferredValue: Qe,
        useTransition: Qe,
        useMutableSource: Qe,
        useSyncExternalStore: Qe,
        useId: Qe,
        unstable_isNewReconciler: !1
    }, Sw = {
        readContext: Ht,
        useCallback: function(e, t) {
            return nn().memoizedState = [
                e,
                t === void 0 ? null : t
            ], e;
        },
        useContext: Ht,
        useEffect: Td,
        useImperativeHandle: function(e, t, n) {
            return n = n != null ? n.concat([
                e
            ]) : null, bi(4194308, 4, mp.bind(null, t, e), n);
        },
        useLayoutEffect: function(e, t) {
            return bi(4194308, 4, e, t);
        },
        useInsertionEffect: function(e, t) {
            return bi(4, 2, e, t);
        },
        useMemo: function(e, t) {
            var n = nn();
            return t = t === void 0 ? null : t, e = e(), n.memoizedState = [
                e,
                t
            ], e;
        },
        useReducer: function(e, t, n) {
            var r = nn();
            return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = {
                pending: null,
                interleaved: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: e,
                lastRenderedState: t
            }, r.queue = e, e = e.dispatch = bw.bind(null, xe, e), [
                r.memoizedState,
                e
            ];
        },
        useRef: function(e) {
            var t = nn();
            return e = {
                current: e
            }, t.memoizedState = e;
        },
        useState: Od,
        useDebugValue: Gc,
        useDeferredValue: function(e) {
            return nn().memoizedState = e;
        },
        useTransition: function() {
            var e = Od(!1), t = e[0];
            return e = vw.bind(null, e[1]), nn().memoizedState = e, [
                t,
                e
            ];
        },
        useMutableSource: function() {},
        useSyncExternalStore: function(e, t, n) {
            var r = xe, s = nn();
            if (ve) {
                if (n === void 0) throw Error(Q(407));
                n = n();
            } else {
                if (n = t(), $e === null) throw Error(Q(349));
                Sr & 30 || up(r, t, n);
            }
            s.memoizedState = n;
            var o = {
                value: n,
                getSnapshot: t
            };
            return s.queue = o, Td(fp.bind(null, r, o, e), [
                e
            ]), r.flags |= 2048, go(9, cp.bind(null, r, o, n, t), void 0, null), n;
        },
        useId: function() {
            var e = nn(), t = $e.identifierPrefix;
            if (ve) {
                var n = wn, r = _n;
                n = (r & ~(1 << 32 - Gt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = ho++, 0 < n && (t += "H" + n.toString(32)), t += ":";
            } else n = ww++, t = ":" + t + "r" + n.toString(32) + ":";
            return e.memoizedState = t;
        },
        unstable_isNewReconciler: !1
    }, kw = {
        readContext: Ht,
        useCallback: wp,
        useContext: Ht,
        useEffect: Kc,
        useImperativeHandle: _p,
        useInsertionEffect: gp,
        useLayoutEffect: yp,
        useMemo: vp,
        useReducer: gl,
        useRef: pp,
        useState: function() {
            return gl(po);
        },
        useDebugValue: Gc,
        useDeferredValue: function(e) {
            var t = Nt();
            return bp(t, De.memoizedState, e);
        },
        useTransition: function() {
            var e = gl(po)[0], t = Nt().memoizedState;
            return [
                e,
                t
            ];
        },
        useMutableSource: ap,
        useSyncExternalStore: lp,
        useId: xp,
        unstable_isNewReconciler: !1
    }, Cw = {
        readContext: Ht,
        useCallback: wp,
        useContext: Ht,
        useEffect: Kc,
        useImperativeHandle: _p,
        useInsertionEffect: gp,
        useLayoutEffect: yp,
        useMemo: vp,
        useReducer: yl,
        useRef: pp,
        useState: function() {
            return yl(po);
        },
        useDebugValue: Gc,
        useDeferredValue: function(e) {
            var t = Nt();
            return De === null ? t.memoizedState = e : bp(t, De.memoizedState, e);
        },
        useTransition: function() {
            var e = yl(po)[0], t = Nt().memoizedState;
            return [
                e,
                t
            ];
        },
        useMutableSource: ap,
        useSyncExternalStore: lp,
        useId: xp,
        unstable_isNewReconciler: !1
    };
    function $t(e, t) {
        if (e && e.defaultProps) {
            t = Se({}, t), e = e.defaultProps;
            for(var n in e)t[n] === void 0 && (t[n] = e[n]);
            return t;
        }
        return t;
    }
    function _u(e, t, n, r) {
        t = e.memoizedState, n = n(r, t), n = n == null ? t : Se({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
    }
    var Sa = {
        isMounted: function(e) {
            return (e = e._reactInternals) ? Tr(e) === e : !1;
        },
        enqueueSetState: function(e, t, n) {
            e = e._reactInternals;
            var r = st(), s = Qn(e), o = bn(r, s);
            o.payload = t, n != null && (o.callback = n), t = Kn(e, o, s), t !== null && (Qt(t, e, s, r), wi(t, e, s));
        },
        enqueueReplaceState: function(e, t, n) {
            e = e._reactInternals;
            var r = st(), s = Qn(e), o = bn(r, s);
            o.tag = 1, o.payload = t, n != null && (o.callback = n), t = Kn(e, o, s), t !== null && (Qt(t, e, s, r), wi(t, e, s));
        },
        enqueueForceUpdate: function(e, t) {
            e = e._reactInternals;
            var n = st(), r = Qn(e), s = bn(n, r);
            s.tag = 2, t != null && (s.callback = t), t = Kn(e, s, r), t !== null && (Qt(t, e, r, n), wi(t, e, r));
        }
    };
    function jd(e, t, n, r, s, o, i) {
        return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, o, i) : t.prototype && t.prototype.isPureReactComponent ? !io(n, r) || !io(s, o) : !0;
    }
    function Ep(e, t, n) {
        var r = !1, s = qn, o = t.contextType;
        return typeof o == "object" && o !== null ? o = Ht(o) : (s = pt(t) ? br : qe.current, r = t.contextTypes, o = (r = r != null) ? cs(e, s) : qn), t = new t(n, o), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Sa, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = s, e.__reactInternalMemoizedMaskedChildContext = o), t;
    }
    function Md(e, t, n, r) {
        e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Sa.enqueueReplaceState(t, t.state, null);
    }
    function wu(e, t, n, r) {
        var s = e.stateNode;
        s.props = n, s.state = e.memoizedState, s.refs = {}, zc(e);
        var o = t.contextType;
        typeof o == "object" && o !== null ? s.context = Ht(o) : (o = pt(t) ? br : qe.current, s.context = cs(e, o)), s.state = e.memoizedState, o = t.getDerivedStateFromProps, typeof o == "function" && (_u(e, t, o, n), s.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof s.getSnapshotBeforeUpdate == "function" || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (t = s.state, typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount(), t !== s.state && Sa.enqueueReplaceState(s, s.state, null), Gi(e, n, s, r), s.state = e.memoizedState), typeof s.componentDidMount == "function" && (e.flags |= 4194308);
    }
    function ps(e, t) {
        try {
            var n = "", r = t;
            do n += q_(r), r = r.return;
            while (r);
            var s = n;
        } catch (o) {
            s = `
Error generating stack: ` + o.message + `
` + o.stack;
        }
        return {
            value: e,
            source: t,
            stack: s,
            digest: null
        };
    }
    function ml(e, t, n) {
        return {
            value: e,
            source: null,
            stack: n ?? null,
            digest: t ?? null
        };
    }
    function vu(e, t) {
        try {
            console.error(t.value);
        } catch (n) {
            setTimeout(function() {
                throw n;
            });
        }
    }
    var Ew = typeof WeakMap == "function" ? WeakMap : Map;
    function Ip(e, t, n) {
        n = bn(-1, n), n.tag = 3, n.payload = {
            element: null
        };
        var r = t.value;
        return n.callback = function() {
            Zi || (Zi = !0, Tu = r), vu(e, t);
        }, n;
    }
    function Ap(e, t, n) {
        n = bn(-1, n), n.tag = 3;
        var r = e.type.getDerivedStateFromError;
        if (typeof r == "function") {
            var s = t.value;
            n.payload = function() {
                return r(s);
            }, n.callback = function() {
                vu(e, t);
            };
        }
        var o = e.stateNode;
        return o !== null && typeof o.componentDidCatch == "function" && (n.callback = function() {
            vu(e, t), typeof r != "function" && (Gn === null ? Gn = new Set([
                this
            ]) : Gn.add(this));
            var i = t.stack;
            this.componentDidCatch(t.value, {
                componentStack: i !== null ? i : ""
            });
        }), n;
    }
    function Rd(e, t, n) {
        var r = e.pingCache;
        if (r === null) {
            r = e.pingCache = new Ew;
            var s = new Set;
            r.set(t, s);
        } else s = r.get(t), s === void 0 && (s = new Set, r.set(t, s));
        s.has(n) || (s.add(n), e = Hw.bind(null, e, t, n), t.then(e, e));
    }
    function Pd(e) {
        do {
            var t;
            if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
            e = e.return;
        }while (e !== null);
        return null;
    }
    function Dd(e, t, n, r, s) {
        return e.mode & 1 ? (e.flags |= 65536, e.lanes = s, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = bn(-1, 1), t.tag = 2, Kn(n, t, 1))), n.lanes |= 1), e);
    }
    var Iw = En.ReactCurrentOwner, dt = !1;
    function et(e, t, n, r) {
        t.child = e === null ? rp(t, null, n, r) : ds(t, e.child, n, r);
    }
    function Ld(e, t, n, r, s) {
        n = n.render;
        var o = t.ref;
        return as(t, s), r = Vc(e, t, n, r, o, s), n = Wc(), e !== null && !dt ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s, Cn(e, t, s)) : (ve && n && Mc(t), t.flags |= 1, et(e, t, r, s), t.child);
    }
    function Ud(e, t, n, r, s) {
        if (e === null) {
            var o = n.type;
            return typeof o == "function" && !tf(o) && o.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = o, Op(e, t, o, r, s)) : (e = Ci(n.type, null, r, t, t.mode, s), e.ref = t.ref, e.return = t, t.child = e);
        }
        if (o = e.child, !(e.lanes & s)) {
            var i = o.memoizedProps;
            if (n = n.compare, n = n !== null ? n : io, n(i, r) && e.ref === t.ref) return Cn(e, t, s);
        }
        return t.flags |= 1, e = Jn(o, r), e.ref = t.ref, e.return = t, t.child = e;
    }
    function Op(e, t, n, r, s) {
        if (e !== null) {
            var o = e.memoizedProps;
            if (io(o, r) && e.ref === t.ref) if (dt = !1, t.pendingProps = r = o, (e.lanes & s) !== 0) e.flags & 131072 && (dt = !0);
            else return t.lanes = e.lanes, Cn(e, t, s);
        }
        return bu(e, t, n, r, s);
    }
    function Tp(e, t, n) {
        var r = t.pendingProps, s = r.children, o = e !== null ? e.memoizedState : null;
        if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = {
            baseLanes: 0,
            cachePool: null,
            transitions: null
        }, ge(qr, vt), vt |= n;
        else {
            if (!(n & 1073741824)) return e = o !== null ? o.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
                baseLanes: e,
                cachePool: null,
                transitions: null
            }, t.updateQueue = null, ge(qr, vt), vt |= e, null;
            t.memoizedState = {
                baseLanes: 0,
                cachePool: null,
                transitions: null
            }, r = o !== null ? o.baseLanes : n, ge(qr, vt), vt |= r;
        }
        else o !== null ? (r = o.baseLanes | n, t.memoizedState = null) : r = n, ge(qr, vt), vt |= r;
        return et(e, t, s, n), t.child;
    }
    function jp(e, t) {
        var n = t.ref;
        (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
    }
    function bu(e, t, n, r, s) {
        var o = pt(n) ? br : qe.current;
        return o = cs(t, o), as(t, s), n = Vc(e, t, n, r, o, s), r = Wc(), e !== null && !dt ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s, Cn(e, t, s)) : (ve && r && Mc(t), t.flags |= 1, et(e, t, n, s), t.child);
    }
    function Fd(e, t, n, r, s) {
        if (pt(n)) {
            var o = !0;
            Bi(t);
        } else o = !1;
        if (as(t, s), t.stateNode === null) xi(e, t), Ep(t, n, r), wu(t, n, r, s), r = !0;
        else if (e === null) {
            var i = t.stateNode, a = t.memoizedProps;
            i.props = a;
            var l = i.context, f = n.contextType;
            typeof f == "object" && f !== null ? f = Ht(f) : (f = pt(n) ? br : qe.current, f = cs(t, f));
            var c = n.getDerivedStateFromProps, u = typeof c == "function" || typeof i.getSnapshotBeforeUpdate == "function";
            u || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== r || l !== f) && Md(t, i, r, f), Un = !1;
            var h = t.memoizedState;
            i.state = h, Gi(t, r, i, s), l = t.memoizedState, a !== r || h !== l || ht.current || Un ? (typeof c == "function" && (_u(t, n, c, r), l = t.memoizedState), (a = Un || jd(t, n, a, r, h, l, f)) ? (u || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount()), typeof i.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), i.props = r, i.state = l, i.context = f, r = a) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
        } else {
            i = t.stateNode, op(e, t), a = t.memoizedProps, f = t.type === t.elementType ? a : $t(t.type, a), i.props = f, u = t.pendingProps, h = i.context, l = n.contextType, typeof l == "object" && l !== null ? l = Ht(l) : (l = pt(n) ? br : qe.current, l = cs(t, l));
            var d = n.getDerivedStateFromProps;
            (c = typeof d == "function" || typeof i.getSnapshotBeforeUpdate == "function") || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== u || h !== l) && Md(t, i, r, l), Un = !1, h = t.memoizedState, i.state = h, Gi(t, r, i, s);
            var p = t.memoizedState;
            a !== u || h !== p || ht.current || Un ? (typeof d == "function" && (_u(t, n, d, r), p = t.memoizedState), (f = Un || jd(t, n, f, r, h, p, l) || !1) ? (c || typeof i.UNSAFE_componentWillUpdate != "function" && typeof i.componentWillUpdate != "function" || (typeof i.componentWillUpdate == "function" && i.componentWillUpdate(r, p, l), typeof i.UNSAFE_componentWillUpdate == "function" && i.UNSAFE_componentWillUpdate(r, p, l)), typeof i.componentDidUpdate == "function" && (t.flags |= 4), typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && h === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && h === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), i.props = r, i.state = p, i.context = l, r = f) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && h === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && h === e.memoizedState || (t.flags |= 1024), r = !1);
        }
        return xu(e, t, n, r, o, s);
    }
    function xu(e, t, n, r, s, o) {
        jp(e, t);
        var i = (t.flags & 128) !== 0;
        if (!r && !i) return s && Sd(t, n, !1), Cn(e, t, o);
        r = t.stateNode, Iw.current = t;
        var a = i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
        return t.flags |= 1, e !== null && i ? (t.child = ds(t, e.child, null, o), t.child = ds(t, null, a, o)) : et(e, t, a, o), t.memoizedState = r.state, s && Sd(t, n, !0), t.child;
    }
    function Mp(e) {
        var t = e.stateNode;
        t.pendingContext ? xd(e, t.pendingContext, t.pendingContext !== t.context) : t.context && xd(e, t.context, !1), Hc(e, t.containerInfo);
    }
    function zd(e, t, n, r, s) {
        return fs(), Pc(s), t.flags |= 256, et(e, t, n, r), t.child;
    }
    var Su = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0
    };
    function ku(e) {
        return {
            baseLanes: e,
            cachePool: null,
            transitions: null
        };
    }
    function Rp(e, t, n) {
        var r = t.pendingProps, s = be.current, o = !1, i = (t.flags & 128) !== 0, a;
        if ((a = i) || (a = e !== null && e.memoizedState === null ? !1 : (s & 2) !== 0), a ? (o = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (s |= 1), ge(be, s & 1), e === null) return yu(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (i = r.children, e = r.fallback, o ? (r = t.mode, o = t.child, i = {
            mode: "hidden",
            children: i
        }, !(r & 1) && o !== null ? (o.childLanes = 0, o.pendingProps = i) : o = Ea(i, r, 0, null), e = gr(e, r, n, null), o.return = t, e.return = t, o.sibling = e, t.child = o, t.child.memoizedState = ku(n), t.memoizedState = Su, e) : Qc(t, i));
        if (s = e.memoizedState, s !== null && (a = s.dehydrated, a !== null)) return Aw(e, t, i, r, a, s, n);
        if (o) {
            o = r.fallback, i = t.mode, s = e.child, a = s.sibling;
            var l = {
                mode: "hidden",
                children: r.children
            };
            return !(i & 1) && t.child !== s ? (r = t.child, r.childLanes = 0, r.pendingProps = l, t.deletions = null) : (r = Jn(s, l), r.subtreeFlags = s.subtreeFlags & 14680064), a !== null ? o = Jn(a, o) : (o = gr(o, i, n, null), o.flags |= 2), o.return = t, r.return = t, r.sibling = o, t.child = r, r = o, o = t.child, i = e.child.memoizedState, i = i === null ? ku(n) : {
                baseLanes: i.baseLanes | n,
                cachePool: null,
                transitions: i.transitions
            }, o.memoizedState = i, o.childLanes = e.childLanes & ~n, t.memoizedState = Su, r;
        }
        return o = e.child, e = o.sibling, r = Jn(o, {
            mode: "visible",
            children: r.children
        }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [
            e
        ], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
    }
    function Qc(e, t) {
        return t = Ea({
            mode: "visible",
            children: t
        }, e.mode, 0, null), t.return = e, e.child = t;
    }
    function ti(e, t, n, r) {
        return r !== null && Pc(r), ds(t, e.child, null, n), e = Qc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
    }
    function Aw(e, t, n, r, s, o, i) {
        if (n) return t.flags & 256 ? (t.flags &= -257, r = ml(Error(Q(422))), ti(e, t, i, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (o = r.fallback, s = t.mode, r = Ea({
            mode: "visible",
            children: r.children
        }, s, 0, null), o = gr(o, s, i, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && ds(t, e.child, null, i), t.child.memoizedState = ku(i), t.memoizedState = Su, o);
        if (!(t.mode & 1)) return ti(e, t, i, null);
        if (s.data === "$!") {
            if (r = s.nextSibling && s.nextSibling.dataset, r) var a = r.dgst;
            return r = a, o = Error(Q(419)), r = ml(o, r, void 0), ti(e, t, i, r);
        }
        if (a = (i & e.childLanes) !== 0, dt || a) {
            if (r = $e, r !== null) {
                switch(i & -i){
                    case 4:
                        s = 2;
                        break;
                    case 16:
                        s = 8;
                        break;
                    case 64:
                    case 128:
                    case 256:
                    case 512:
                    case 1024:
                    case 2048:
                    case 4096:
                    case 8192:
                    case 16384:
                    case 32768:
                    case 65536:
                    case 131072:
                    case 262144:
                    case 524288:
                    case 1048576:
                    case 2097152:
                    case 4194304:
                    case 8388608:
                    case 16777216:
                    case 33554432:
                    case 67108864:
                        s = 32;
                        break;
                    case 536870912:
                        s = 268435456;
                        break;
                    default:
                        s = 0;
                }
                s = s & (r.suspendedLanes | i) ? 0 : s, s !== 0 && s !== o.retryLane && (o.retryLane = s, kn(e, s), Qt(r, e, s, -1));
            }
            return ef(), r = ml(Error(Q(421))), ti(e, t, i, r);
        }
        return s.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Nw.bind(null, e), s._reactRetry = t, null) : (e = o.treeContext, bt = Wn(s.nextSibling), xt = t, ve = !0, Wt = null, e !== null && (At[Ot++] = _n, At[Ot++] = wn, At[Ot++] = xr, _n = e.id, wn = e.overflow, xr = t), t = Qc(t, r.children), t.flags |= 4096, t);
    }
    function Hd(e, t, n) {
        e.lanes |= t;
        var r = e.alternate;
        r !== null && (r.lanes |= t), mu(e.return, t, n);
    }
    function _l(e, t, n, r, s) {
        var o = e.memoizedState;
        o === null ? e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: r,
            tail: n,
            tailMode: s
        } : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = s);
    }
    function Pp(e, t, n) {
        var r = t.pendingProps, s = r.revealOrder, o = r.tail;
        if (et(e, t, r.children, n), r = be.current, r & 2) r = r & 1 | 2, t.flags |= 128;
        else {
            if (e !== null && e.flags & 128) e: for(e = t.child; e !== null;){
                if (e.tag === 13) e.memoizedState !== null && Hd(e, n, t);
                else if (e.tag === 19) Hd(e, n, t);
                else if (e.child !== null) {
                    e.child.return = e, e = e.child;
                    continue;
                }
                if (e === t) break e;
                for(; e.sibling === null;){
                    if (e.return === null || e.return === t) break e;
                    e = e.return;
                }
                e.sibling.return = e.return, e = e.sibling;
            }
            r &= 1;
        }
        if (ge(be, r), !(t.mode & 1)) t.memoizedState = null;
        else switch(s){
            case "forwards":
                for(n = t.child, s = null; n !== null;)e = n.alternate, e !== null && Qi(e) === null && (s = n), n = n.sibling;
                n = s, n === null ? (s = t.child, t.child = null) : (s = n.sibling, n.sibling = null), _l(t, !1, s, n, o);
                break;
            case "backwards":
                for(n = null, s = t.child, t.child = null; s !== null;){
                    if (e = s.alternate, e !== null && Qi(e) === null) {
                        t.child = s;
                        break;
                    }
                    e = s.sibling, s.sibling = n, n = s, s = e;
                }
                _l(t, !0, n, null, o);
                break;
            case "together":
                _l(t, !1, null, null, void 0);
                break;
            default:
                t.memoizedState = null;
        }
        return t.child;
    }
    function xi(e, t) {
        !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
    }
    function Cn(e, t, n) {
        if (e !== null && (t.dependencies = e.dependencies), kr |= t.lanes, !(n & t.childLanes)) return null;
        if (e !== null && t.child !== e.child) throw Error(Q(153));
        if (t.child !== null) {
            for(e = t.child, n = Jn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;)e = e.sibling, n = n.sibling = Jn(e, e.pendingProps), n.return = t;
            n.sibling = null;
        }
        return t.child;
    }
    function Ow(e, t, n) {
        switch(t.tag){
            case 3:
                Mp(t), fs();
                break;
            case 5:
                ip(t);
                break;
            case 1:
                pt(t.type) && Bi(t);
                break;
            case 4:
                Hc(t, t.stateNode.containerInfo);
                break;
            case 10:
                var r = t.type._context, s = t.memoizedProps.value;
                ge(Wi, r._currentValue), r._currentValue = s;
                break;
            case 13:
                if (r = t.memoizedState, r !== null) return r.dehydrated !== null ? (ge(be, be.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Rp(e, t, n) : (ge(be, be.current & 1), e = Cn(e, t, n), e !== null ? e.sibling : null);
                ge(be, be.current & 1);
                break;
            case 19:
                if (r = (n & t.childLanes) !== 0, e.flags & 128) {
                    if (r) return Pp(e, t, n);
                    t.flags |= 128;
                }
                if (s = t.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), ge(be, be.current), r) break;
                return null;
            case 22:
            case 23:
                return t.lanes = 0, Tp(e, t, n);
        }
        return Cn(e, t, n);
    }
    var Dp, Cu, Lp, Up;
    Dp = function(e, t) {
        for(var n = t.child; n !== null;){
            if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
            else if (n.tag !== 4 && n.child !== null) {
                n.child.return = n, n = n.child;
                continue;
            }
            if (n === t) break;
            for(; n.sibling === null;){
                if (n.return === null || n.return === t) return;
                n = n.return;
            }
            n.sibling.return = n.return, n = n.sibling;
        }
    };
    Cu = function() {};
    Lp = function(e, t, n, r) {
        var s = e.memoizedProps;
        if (s !== r) {
            e = t.stateNode, dr(hn.current);
            var o = null;
            switch(n){
                case "input":
                    s = Gl(e, s), r = Gl(e, r), o = [];
                    break;
                case "select":
                    s = Se({}, s, {
                        value: void 0
                    }), r = Se({}, r, {
                        value: void 0
                    }), o = [];
                    break;
                case "textarea":
                    s = Yl(e, s), r = Yl(e, r), o = [];
                    break;
                default:
                    typeof s.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Hi);
            }
            Zl(n, r);
            var i;
            n = null;
            for(f in s)if (!r.hasOwnProperty(f) && s.hasOwnProperty(f) && s[f] != null) if (f === "style") {
                var a = s[f];
                for(i in a)a.hasOwnProperty(i) && (n || (n = {}), n[i] = "");
            } else f !== "dangerouslySetInnerHTML" && f !== "children" && f !== "suppressContentEditableWarning" && f !== "suppressHydrationWarning" && f !== "autoFocus" && (qs.hasOwnProperty(f) ? o || (o = []) : (o = o || []).push(f, null));
            for(f in r){
                var l = r[f];
                if (a = s?.[f], r.hasOwnProperty(f) && l !== a && (l != null || a != null)) if (f === "style") if (a) {
                    for(i in a)!a.hasOwnProperty(i) || l && l.hasOwnProperty(i) || (n || (n = {}), n[i] = "");
                    for(i in l)l.hasOwnProperty(i) && a[i] !== l[i] && (n || (n = {}), n[i] = l[i]);
                } else n || (o || (o = []), o.push(f, n)), n = l;
                else f === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, a = a ? a.__html : void 0, l != null && a !== l && (o = o || []).push(f, l)) : f === "children" ? typeof l != "string" && typeof l != "number" || (o = o || []).push(f, "" + l) : f !== "suppressContentEditableWarning" && f !== "suppressHydrationWarning" && (qs.hasOwnProperty(f) ? (l != null && f === "onScroll" && ye("scroll", e), o || a === l || (o = [])) : (o = o || []).push(f, l));
            }
            n && (o = o || []).push("style", n);
            var f = o;
            (t.updateQueue = f) && (t.flags |= 4);
        }
    };
    Up = function(e, t, n, r) {
        n !== r && (t.flags |= 4);
    };
    function js(e, t) {
        if (!ve) switch(e.tailMode){
            case "hidden":
                t = e.tail;
                for(var n = null; t !== null;)t.alternate !== null && (n = t), t = t.sibling;
                n === null ? e.tail = null : n.sibling = null;
                break;
            case "collapsed":
                n = e.tail;
                for(var r = null; n !== null;)n.alternate !== null && (r = n), n = n.sibling;
                r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
        }
    }
    function Je(e) {
        var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
        if (t) for(var s = e.child; s !== null;)n |= s.lanes | s.childLanes, r |= s.subtreeFlags & 14680064, r |= s.flags & 14680064, s.return = e, s = s.sibling;
        else for(s = e.child; s !== null;)n |= s.lanes | s.childLanes, r |= s.subtreeFlags, r |= s.flags, s.return = e, s = s.sibling;
        return e.subtreeFlags |= r, e.childLanes = n, t;
    }
    function Tw(e, t, n) {
        var r = t.pendingProps;
        switch(Rc(t), t.tag){
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
                return Je(t), null;
            case 1:
                return pt(t.type) && Ni(), Je(t), null;
            case 3:
                return r = t.stateNode, hs(), we(ht), we(qe), Bc(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (qo(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Wt !== null && (Ru(Wt), Wt = null))), Cu(e, t), Je(t), null;
            case 5:
                Nc(t);
                var s = dr(fo.current);
                if (n = t.type, e !== null && t.stateNode != null) Lp(e, t, n, r, s), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
                else {
                    if (!r) {
                        if (t.stateNode === null) throw Error(Q(166));
                        return Je(t), null;
                    }
                    if (e = dr(hn.current), qo(t)) {
                        r = t.stateNode, n = t.type;
                        var o = t.memoizedProps;
                        switch(r[an] = t, r[uo] = o, e = (t.mode & 1) !== 0, n){
                            case "dialog":
                                ye("cancel", r), ye("close", r);
                                break;
                            case "iframe":
                            case "object":
                            case "embed":
                                ye("load", r);
                                break;
                            case "video":
                            case "audio":
                                for(s = 0; s < zs.length; s++)ye(zs[s], r);
                                break;
                            case "source":
                                ye("error", r);
                                break;
                            case "img":
                            case "image":
                            case "link":
                                ye("error", r), ye("load", r);
                                break;
                            case "details":
                                ye("toggle", r);
                                break;
                            case "input":
                                Jf(r, o), ye("invalid", r);
                                break;
                            case "select":
                                r._wrapperState = {
                                    wasMultiple: !!o.multiple
                                }, ye("invalid", r);
                                break;
                            case "textarea":
                                Xf(r, o), ye("invalid", r);
                        }
                        Zl(n, o), s = null;
                        for(var i in o)if (o.hasOwnProperty(i)) {
                            var a = o[i];
                            i === "children" ? typeof a == "string" ? r.textContent !== a && (o.suppressHydrationWarning !== !0 && Zo(r.textContent, a, e), s = [
                                "children",
                                a
                            ]) : typeof a == "number" && r.textContent !== "" + a && (o.suppressHydrationWarning !== !0 && Zo(r.textContent, a, e), s = [
                                "children",
                                "" + a
                            ]) : qs.hasOwnProperty(i) && a != null && i === "onScroll" && ye("scroll", r);
                        }
                        switch(n){
                            case "input":
                                Vo(r), Yf(r, o, !0);
                                break;
                            case "textarea":
                                Vo(r), Zf(r);
                                break;
                            case "select":
                            case "option":
                                break;
                            default:
                                typeof o.onClick == "function" && (r.onclick = Hi);
                        }
                        r = s, t.updateQueue = r, r !== null && (t.flags |= 4);
                    } else {
                        i = s.nodeType === 9 ? s : s.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = f0(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = i.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = i.createElement(n, {
                            is: r.is
                        }) : (e = i.createElement(n), n === "select" && (i = e, r.multiple ? i.multiple = !0 : r.size && (i.size = r.size))) : e = i.createElementNS(e, n), e[an] = t, e[uo] = r, Dp(e, t, !1, !1), t.stateNode = e;
                        e: {
                            switch(i = ql(n, r), n){
                                case "dialog":
                                    ye("cancel", e), ye("close", e), s = r;
                                    break;
                                case "iframe":
                                case "object":
                                case "embed":
                                    ye("load", e), s = r;
                                    break;
                                case "video":
                                case "audio":
                                    for(s = 0; s < zs.length; s++)ye(zs[s], e);
                                    s = r;
                                    break;
                                case "source":
                                    ye("error", e), s = r;
                                    break;
                                case "img":
                                case "image":
                                case "link":
                                    ye("error", e), ye("load", e), s = r;
                                    break;
                                case "details":
                                    ye("toggle", e), s = r;
                                    break;
                                case "input":
                                    Jf(e, r), s = Gl(e, r), ye("invalid", e);
                                    break;
                                case "option":
                                    s = r;
                                    break;
                                case "select":
                                    e._wrapperState = {
                                        wasMultiple: !!r.multiple
                                    }, s = Se({}, r, {
                                        value: void 0
                                    }), ye("invalid", e);
                                    break;
                                case "textarea":
                                    Xf(e, r), s = Yl(e, r), ye("invalid", e);
                                    break;
                                default:
                                    s = r;
                            }
                            Zl(n, s), a = s;
                            for(o in a)if (a.hasOwnProperty(o)) {
                                var l = a[o];
                                o === "style" ? p0(e, l) : o === "dangerouslySetInnerHTML" ? (l = l ? l.__html : void 0, l != null && d0(e, l)) : o === "children" ? typeof l == "string" ? (n !== "textarea" || l !== "") && eo(e, l) : typeof l == "number" && eo(e, "" + l) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (qs.hasOwnProperty(o) ? l != null && o === "onScroll" && ye("scroll", e) : l != null && _c(e, o, l, i));
                            }
                            switch(n){
                                case "input":
                                    Vo(e), Yf(e, r, !1);
                                    break;
                                case "textarea":
                                    Vo(e), Zf(e);
                                    break;
                                case "option":
                                    r.value != null && e.setAttribute("value", "" + Zn(r.value));
                                    break;
                                case "select":
                                    e.multiple = !!r.multiple, o = r.value, o != null ? rs(e, !!r.multiple, o, !1) : r.defaultValue != null && rs(e, !!r.multiple, r.defaultValue, !0);
                                    break;
                                default:
                                    typeof s.onClick == "function" && (e.onclick = Hi);
                            }
                            switch(n){
                                case "button":
                                case "input":
                                case "select":
                                case "textarea":
                                    r = !!r.autoFocus;
                                    break e;
                                case "img":
                                    r = !0;
                                    break e;
                                default:
                                    r = !1;
                            }
                        }
                        r && (t.flags |= 4);
                    }
                    t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
                }
                return Je(t), null;
            case 6:
                if (e && t.stateNode != null) Up(e, t, e.memoizedProps, r);
                else {
                    if (typeof r != "string" && t.stateNode === null) throw Error(Q(166));
                    if (n = dr(fo.current), dr(hn.current), qo(t)) {
                        if (r = t.stateNode, n = t.memoizedProps, r[an] = t, (o = r.nodeValue !== n) && (e = xt, e !== null)) switch(e.tag){
                            case 3:
                                Zo(r.nodeValue, n, (e.mode & 1) !== 0);
                                break;
                            case 5:
                                e.memoizedProps.suppressHydrationWarning !== !0 && Zo(r.nodeValue, n, (e.mode & 1) !== 0);
                        }
                        o && (t.flags |= 4);
                    } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[an] = t, t.stateNode = r;
                }
                return Je(t), null;
            case 13:
                if (we(be), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                    if (ve && bt !== null && t.mode & 1 && !(t.flags & 128)) tp(), fs(), t.flags |= 98560, o = !1;
                    else if (o = qo(t), r !== null && r.dehydrated !== null) {
                        if (e === null) {
                            if (!o) throw Error(Q(318));
                            if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o) throw Error(Q(317));
                            o[an] = t;
                        } else fs(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
                        Je(t), o = !1;
                    } else Wt !== null && (Ru(Wt), Wt = null), o = !0;
                    if (!o) return t.flags & 65536 ? t : null;
                }
                return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || be.current & 1 ? Le === 0 && (Le = 3) : ef())), t.updateQueue !== null && (t.flags |= 4), Je(t), null);
            case 4:
                return hs(), Cu(e, t), e === null && ao(t.stateNode.containerInfo), Je(t), null;
            case 10:
                return Uc(t.type._context), Je(t), null;
            case 17:
                return pt(t.type) && Ni(), Je(t), null;
            case 19:
                if (we(be), o = t.memoizedState, o === null) return Je(t), null;
                if (r = (t.flags & 128) !== 0, i = o.rendering, i === null) if (r) js(o, !1);
                else {
                    if (Le !== 0 || e !== null && e.flags & 128) for(e = t.child; e !== null;){
                        if (i = Qi(e), i !== null) {
                            for(t.flags |= 128, js(o, !1), r = i.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;)o = n, e = r, o.flags &= 14680066, i = o.alternate, i === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = i.childLanes, o.lanes = i.lanes, o.child = i.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = i.memoizedProps, o.memoizedState = i.memoizedState, o.updateQueue = i.updateQueue, o.type = i.type, e = i.dependencies, o.dependencies = e === null ? null : {
                                lanes: e.lanes,
                                firstContext: e.firstContext
                            }), n = n.sibling;
                            return ge(be, be.current & 1 | 2), t.child;
                        }
                        e = e.sibling;
                    }
                    o.tail !== null && Ae() > gs && (t.flags |= 128, r = !0, js(o, !1), t.lanes = 4194304);
                }
                else {
                    if (!r) if (e = Qi(i), e !== null) {
                        if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), js(o, !0), o.tail === null && o.tailMode === "hidden" && !i.alternate && !ve) return Je(t), null;
                    } else 2 * Ae() - o.renderingStartTime > gs && n !== 1073741824 && (t.flags |= 128, r = !0, js(o, !1), t.lanes = 4194304);
                    o.isBackwards ? (i.sibling = t.child, t.child = i) : (n = o.last, n !== null ? n.sibling = i : t.child = i, o.last = i);
                }
                return o.tail !== null ? (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = Ae(), t.sibling = null, n = be.current, ge(be, r ? n & 1 | 2 : n & 1), t) : (Je(t), null);
            case 22:
            case 23:
                return qc(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? vt & 1073741824 && (Je(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Je(t), null;
            case 24:
                return null;
            case 25:
                return null;
        }
        throw Error(Q(156, t.tag));
    }
    function jw(e, t) {
        switch(Rc(t), t.tag){
            case 1:
                return pt(t.type) && Ni(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
            case 3:
                return hs(), we(ht), we(qe), Bc(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
            case 5:
                return Nc(t), null;
            case 13:
                if (we(be), e = t.memoizedState, e !== null && e.dehydrated !== null) {
                    if (t.alternate === null) throw Error(Q(340));
                    fs();
                }
                return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
            case 19:
                return we(be), null;
            case 4:
                return hs(), null;
            case 10:
                return Uc(t.type._context), null;
            case 22:
            case 23:
                return qc(), null;
            case 24:
                return null;
            default:
                return null;
        }
    }
    var ni = !1, Ze = !1, Mw = typeof WeakSet == "function" ? WeakSet : Set, X = null;
    function Zr(e, t) {
        var n = e.ref;
        if (n !== null) if (typeof n == "function") try {
            n(null);
        } catch (r) {
            ke(e, t, r);
        }
        else n.current = null;
    }
    function Eu(e, t, n) {
        try {
            n();
        } catch (r) {
            ke(e, t, r);
        }
    }
    var Nd = !1;
    function Rw(e, t) {
        if (uu = Ui, e = B0(), jc(e)) {
            if ("selectionStart" in e) var n = {
                start: e.selectionStart,
                end: e.selectionEnd
            };
            else e: {
                n = (n = e.ownerDocument) && n.defaultView || window;
                var r = n.getSelection && n.getSelection();
                if (r && r.rangeCount !== 0) {
                    n = r.anchorNode;
                    var s = r.anchorOffset, o = r.focusNode;
                    r = r.focusOffset;
                    try {
                        n.nodeType, o.nodeType;
                    } catch  {
                        n = null;
                        break e;
                    }
                    var i = 0, a = -1, l = -1, f = 0, c = 0, u = e, h = null;
                    t: for(;;){
                        for(var d; u !== n || s !== 0 && u.nodeType !== 3 || (a = i + s), u !== o || r !== 0 && u.nodeType !== 3 || (l = i + r), u.nodeType === 3 && (i += u.nodeValue.length), (d = u.firstChild) !== null;)h = u, u = d;
                        for(;;){
                            if (u === e) break t;
                            if (h === n && ++f === s && (a = i), h === o && ++c === r && (l = i), (d = u.nextSibling) !== null) break;
                            u = h, h = u.parentNode;
                        }
                        u = d;
                    }
                    n = a === -1 || l === -1 ? null : {
                        start: a,
                        end: l
                    };
                } else n = null;
            }
            n = n || {
                start: 0,
                end: 0
            };
        } else n = null;
        for(cu = {
            focusedElem: e,
            selectionRange: n
        }, Ui = !1, X = t; X !== null;)if (t = X, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, X = e;
        else for(; X !== null;){
            t = X;
            try {
                var p = t.alternate;
                if (t.flags & 1024) switch(t.tag){
                    case 0:
                    case 11:
                    case 15:
                        break;
                    case 1:
                        if (p !== null) {
                            var m = p.memoizedProps, x = p.memoizedState, w = t.stateNode, _ = w.getSnapshotBeforeUpdate(t.elementType === t.type ? m : $t(t.type, m), x);
                            w.__reactInternalSnapshotBeforeUpdate = _;
                        }
                        break;
                    case 3:
                        var g = t.stateNode.containerInfo;
                        g.nodeType === 1 ? g.textContent = "" : g.nodeType === 9 && g.documentElement && g.removeChild(g.documentElement);
                        break;
                    case 5:
                    case 6:
                    case 4:
                    case 17:
                        break;
                    default:
                        throw Error(Q(163));
                }
            } catch (A) {
                ke(t, t.return, A);
            }
            if (e = t.sibling, e !== null) {
                e.return = t.return, X = e;
                break;
            }
            X = t.return;
        }
        return p = Nd, Nd = !1, p;
    }
    function Qs(e, t, n) {
        var r = t.updateQueue;
        if (r = r !== null ? r.lastEffect : null, r !== null) {
            var s = r = r.next;
            do {
                if ((s.tag & e) === e) {
                    var o = s.destroy;
                    s.destroy = void 0, o !== void 0 && Eu(t, n, o);
                }
                s = s.next;
            }while (s !== r);
        }
    }
    function ka(e, t) {
        if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
            var n = t = t.next;
            do {
                if ((n.tag & e) === e) {
                    var r = n.create;
                    n.destroy = r();
                }
                n = n.next;
            }while (n !== t);
        }
    }
    function Iu(e) {
        var t = e.ref;
        if (t !== null) {
            var n = e.stateNode;
            switch(e.tag){
                case 5:
                    e = n;
                    break;
                default:
                    e = n;
            }
            typeof t == "function" ? t(e) : t.current = e;
        }
    }
    function Fp(e) {
        var t = e.alternate;
        t !== null && (e.alternate = null, Fp(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[an], delete t[uo], delete t[hu], delete t[gw], delete t[yw])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
    }
    function zp(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 4;
    }
    function Bd(e) {
        e: for(;;){
            for(; e.sibling === null;){
                if (e.return === null || zp(e.return)) return null;
                e = e.return;
            }
            for(e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;){
                if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
                e.child.return = e, e = e.child;
            }
            if (!(e.flags & 2)) return e.stateNode;
        }
    }
    function Au(e, t, n) {
        var r = e.tag;
        if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Hi));
        else if (r !== 4 && (e = e.child, e !== null)) for(Au(e, t, n), e = e.sibling; e !== null;)Au(e, t, n), e = e.sibling;
    }
    function Ou(e, t, n) {
        var r = e.tag;
        if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
        else if (r !== 4 && (e = e.child, e !== null)) for(Ou(e, t, n), e = e.sibling; e !== null;)Ou(e, t, n), e = e.sibling;
    }
    var We = null, Vt = !1;
    function An(e, t, n) {
        for(n = n.child; n !== null;)Hp(e, t, n), n = n.sibling;
    }
    function Hp(e, t, n) {
        if (dn && typeof dn.onCommitFiberUnmount == "function") try {
            dn.onCommitFiberUnmount(ya, n);
        } catch  {}
        switch(n.tag){
            case 5:
                Ze || Zr(n, t);
            case 6:
                var r = We, s = Vt;
                We = null, An(e, t, n), We = r, Vt = s, We !== null && (Vt ? (e = We, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : We.removeChild(n.stateNode));
                break;
            case 18:
                We !== null && (Vt ? (e = We, n = n.stateNode, e.nodeType === 8 ? fl(e.parentNode, n) : e.nodeType === 1 && fl(e, n), so(e)) : fl(We, n.stateNode));
                break;
            case 4:
                r = We, s = Vt, We = n.stateNode.containerInfo, Vt = !0, An(e, t, n), We = r, Vt = s;
                break;
            case 0:
            case 11:
            case 14:
            case 15:
                if (!Ze && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
                    s = r = r.next;
                    do {
                        var o = s, i = o.destroy;
                        o = o.tag, i !== void 0 && (o & 2 || o & 4) && Eu(n, t, i), s = s.next;
                    }while (s !== r);
                }
                An(e, t, n);
                break;
            case 1:
                if (!Ze && (Zr(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
                    r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
                } catch (a) {
                    ke(n, t, a);
                }
                An(e, t, n);
                break;
            case 21:
                An(e, t, n);
                break;
            case 22:
                n.mode & 1 ? (Ze = (r = Ze) || n.memoizedState !== null, An(e, t, n), Ze = r) : An(e, t, n);
                break;
            default:
                An(e, t, n);
        }
    }
    function $d(e) {
        var t = e.updateQueue;
        if (t !== null) {
            e.updateQueue = null;
            var n = e.stateNode;
            n === null && (n = e.stateNode = new Mw), t.forEach(function(r) {
                var s = Bw.bind(null, e, r);
                n.has(r) || (n.add(r), r.then(s, s));
            });
        }
    }
    function Bt(e, t) {
        var n = t.deletions;
        if (n !== null) for(var r = 0; r < n.length; r++){
            var s = n[r];
            try {
                var o = e, i = t, a = i;
                e: for(; a !== null;){
                    switch(a.tag){
                        case 5:
                            We = a.stateNode, Vt = !1;
                            break e;
                        case 3:
                            We = a.stateNode.containerInfo, Vt = !0;
                            break e;
                        case 4:
                            We = a.stateNode.containerInfo, Vt = !0;
                            break e;
                    }
                    a = a.return;
                }
                if (We === null) throw Error(Q(160));
                Hp(o, i, s), We = null, Vt = !1;
                var l = s.alternate;
                l !== null && (l.return = null), s.return = null;
            } catch (f) {
                ke(s, t, f);
            }
        }
        if (t.subtreeFlags & 12854) for(t = t.child; t !== null;)Np(t, e), t = t.sibling;
    }
    function Np(e, t) {
        var n = e.alternate, r = e.flags;
        switch(e.tag){
            case 0:
            case 11:
            case 14:
            case 15:
                if (Bt(t, e), Xt(e), r & 4) {
                    try {
                        Qs(3, e, e.return), ka(3, e);
                    } catch (m) {
                        ke(e, e.return, m);
                    }
                    try {
                        Qs(5, e, e.return);
                    } catch (m) {
                        ke(e, e.return, m);
                    }
                }
                break;
            case 1:
                Bt(t, e), Xt(e), r & 512 && n !== null && Zr(n, n.return);
                break;
            case 5:
                if (Bt(t, e), Xt(e), r & 512 && n !== null && Zr(n, n.return), e.flags & 32) {
                    var s = e.stateNode;
                    try {
                        eo(s, "");
                    } catch (m) {
                        ke(e, e.return, m);
                    }
                }
                if (r & 4 && (s = e.stateNode, s != null)) {
                    var o = e.memoizedProps, i = n !== null ? n.memoizedProps : o, a = e.type, l = e.updateQueue;
                    if (e.updateQueue = null, l !== null) try {
                        a === "input" && o.type === "radio" && o.name != null && u0(s, o), ql(a, i);
                        var f = ql(a, o);
                        for(i = 0; i < l.length; i += 2){
                            var c = l[i], u = l[i + 1];
                            c === "style" ? p0(s, u) : c === "dangerouslySetInnerHTML" ? d0(s, u) : c === "children" ? eo(s, u) : _c(s, c, u, f);
                        }
                        switch(a){
                            case "input":
                                Ql(s, o);
                                break;
                            case "textarea":
                                c0(s, o);
                                break;
                            case "select":
                                var h = s._wrapperState.wasMultiple;
                                s._wrapperState.wasMultiple = !!o.multiple;
                                var d = o.value;
                                d != null ? rs(s, !!o.multiple, d, !1) : h !== !!o.multiple && (o.defaultValue != null ? rs(s, !!o.multiple, o.defaultValue, !0) : rs(s, !!o.multiple, o.multiple ? [] : "", !1));
                        }
                        s[uo] = o;
                    } catch (m) {
                        ke(e, e.return, m);
                    }
                }
                break;
            case 6:
                if (Bt(t, e), Xt(e), r & 4) {
                    if (e.stateNode === null) throw Error(Q(162));
                    s = e.stateNode, o = e.memoizedProps;
                    try {
                        s.nodeValue = o;
                    } catch (m) {
                        ke(e, e.return, m);
                    }
                }
                break;
            case 3:
                if (Bt(t, e), Xt(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
                    so(t.containerInfo);
                } catch (m) {
                    ke(e, e.return, m);
                }
                break;
            case 4:
                Bt(t, e), Xt(e);
                break;
            case 13:
                Bt(t, e), Xt(e), s = e.child, s.flags & 8192 && (o = s.memoizedState !== null, s.stateNode.isHidden = o, !o || s.alternate !== null && s.alternate.memoizedState !== null || (Xc = Ae())), r & 4 && $d(e);
                break;
            case 22:
                if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (Ze = (f = Ze) || c, Bt(t, e), Ze = f) : Bt(t, e), Xt(e), r & 8192) {
                    if (f = e.memoizedState !== null, (e.stateNode.isHidden = f) && !c && e.mode & 1) for(X = e, c = e.child; c !== null;){
                        for(u = X = c; X !== null;){
                            switch(h = X, d = h.child, h.tag){
                                case 0:
                                case 11:
                                case 14:
                                case 15:
                                    Qs(4, h, h.return);
                                    break;
                                case 1:
                                    Zr(h, h.return);
                                    var p = h.stateNode;
                                    if (typeof p.componentWillUnmount == "function") {
                                        r = h, n = h.return;
                                        try {
                                            t = r, p.props = t.memoizedProps, p.state = t.memoizedState, p.componentWillUnmount();
                                        } catch (m) {
                                            ke(r, n, m);
                                        }
                                    }
                                    break;
                                case 5:
                                    Zr(h, h.return);
                                    break;
                                case 22:
                                    if (h.memoizedState !== null) {
                                        Wd(u);
                                        continue;
                                    }
                            }
                            d !== null ? (d.return = h, X = d) : Wd(u);
                        }
                        c = c.sibling;
                    }
                    e: for(c = null, u = e;;){
                        if (u.tag === 5) {
                            if (c === null) {
                                c = u;
                                try {
                                    s = u.stateNode, f ? (o = s.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (a = u.stateNode, l = u.memoizedProps.style, i = l != null && l.hasOwnProperty("display") ? l.display : null, a.style.display = h0("display", i));
                                } catch (m) {
                                    ke(e, e.return, m);
                                }
                            }
                        } else if (u.tag === 6) {
                            if (c === null) try {
                                u.stateNode.nodeValue = f ? "" : u.memoizedProps;
                            } catch (m) {
                                ke(e, e.return, m);
                            }
                        } else if ((u.tag !== 22 && u.tag !== 23 || u.memoizedState === null || u === e) && u.child !== null) {
                            u.child.return = u, u = u.child;
                            continue;
                        }
                        if (u === e) break e;
                        for(; u.sibling === null;){
                            if (u.return === null || u.return === e) break e;
                            c === u && (c = null), u = u.return;
                        }
                        c === u && (c = null), u.sibling.return = u.return, u = u.sibling;
                    }
                }
                break;
            case 19:
                Bt(t, e), Xt(e), r & 4 && $d(e);
                break;
            case 21:
                break;
            default:
                Bt(t, e), Xt(e);
        }
    }
    function Xt(e) {
        var t = e.flags;
        if (t & 2) {
            try {
                e: {
                    for(var n = e.return; n !== null;){
                        if (zp(n)) {
                            var r = n;
                            break e;
                        }
                        n = n.return;
                    }
                    throw Error(Q(160));
                }
                switch(r.tag){
                    case 5:
                        var s = r.stateNode;
                        r.flags & 32 && (eo(s, ""), r.flags &= -33);
                        var o = Bd(e);
                        Ou(e, o, s);
                        break;
                    case 3:
                    case 4:
                        var i = r.stateNode.containerInfo, a = Bd(e);
                        Au(e, a, i);
                        break;
                    default:
                        throw Error(Q(161));
                }
            } catch (l) {
                ke(e, e.return, l);
            }
            e.flags &= -3;
        }
        t & 4096 && (e.flags &= -4097);
    }
    function Pw(e, t, n) {
        X = e, Bp(e);
    }
    function Bp(e, t, n) {
        for(var r = (e.mode & 1) !== 0; X !== null;){
            var s = X, o = s.child;
            if (s.tag === 22 && r) {
                var i = s.memoizedState !== null || ni;
                if (!i) {
                    var a = s.alternate, l = a !== null && a.memoizedState !== null || Ze;
                    a = ni;
                    var f = Ze;
                    if (ni = i, (Ze = l) && !f) for(X = s; X !== null;)i = X, l = i.child, i.tag === 22 && i.memoizedState !== null ? Kd(s) : l !== null ? (l.return = i, X = l) : Kd(s);
                    for(; o !== null;)X = o, Bp(o), o = o.sibling;
                    X = s, ni = a, Ze = f;
                }
                Vd(e);
            } else s.subtreeFlags & 8772 && o !== null ? (o.return = s, X = o) : Vd(e);
        }
    }
    function Vd(e) {
        for(; X !== null;){
            var t = X;
            if (t.flags & 8772) {
                var n = t.alternate;
                try {
                    if (t.flags & 8772) switch(t.tag){
                        case 0:
                        case 11:
                        case 15:
                            Ze || ka(5, t);
                            break;
                        case 1:
                            var r = t.stateNode;
                            if (t.flags & 4 && !Ze) if (n === null) r.componentDidMount();
                            else {
                                var s = t.elementType === t.type ? n.memoizedProps : $t(t.type, n.memoizedProps);
                                r.componentDidUpdate(s, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                            }
                            var o = t.updateQueue;
                            o !== null && Ad(t, o, r);
                            break;
                        case 3:
                            var i = t.updateQueue;
                            if (i !== null) {
                                if (n = null, t.child !== null) switch(t.child.tag){
                                    case 5:
                                        n = t.child.stateNode;
                                        break;
                                    case 1:
                                        n = t.child.stateNode;
                                }
                                Ad(t, i, n);
                            }
                            break;
                        case 5:
                            var a = t.stateNode;
                            if (n === null && t.flags & 4) {
                                n = a;
                                var l = t.memoizedProps;
                                switch(t.type){
                                    case "button":
                                    case "input":
                                    case "select":
                                    case "textarea":
                                        l.autoFocus && n.focus();
                                        break;
                                    case "img":
                                        l.src && (n.src = l.src);
                                }
                            }
                            break;
                        case 6:
                            break;
                        case 4:
                            break;
                        case 12:
                            break;
                        case 13:
                            if (t.memoizedState === null) {
                                var f = t.alternate;
                                if (f !== null) {
                                    var c = f.memoizedState;
                                    if (c !== null) {
                                        var u = c.dehydrated;
                                        u !== null && so(u);
                                    }
                                }
                            }
                            break;
                        case 19:
                        case 17:
                        case 21:
                        case 22:
                        case 23:
                        case 25:
                            break;
                        default:
                            throw Error(Q(163));
                    }
                    Ze || t.flags & 512 && Iu(t);
                } catch (h) {
                    ke(t, t.return, h);
                }
            }
            if (t === e) {
                X = null;
                break;
            }
            if (n = t.sibling, n !== null) {
                n.return = t.return, X = n;
                break;
            }
            X = t.return;
        }
    }
    function Wd(e) {
        for(; X !== null;){
            var t = X;
            if (t === e) {
                X = null;
                break;
            }
            var n = t.sibling;
            if (n !== null) {
                n.return = t.return, X = n;
                break;
            }
            X = t.return;
        }
    }
    function Kd(e) {
        for(; X !== null;){
            var t = X;
            try {
                switch(t.tag){
                    case 0:
                    case 11:
                    case 15:
                        var n = t.return;
                        try {
                            ka(4, t);
                        } catch (l) {
                            ke(t, n, l);
                        }
                        break;
                    case 1:
                        var r = t.stateNode;
                        if (typeof r.componentDidMount == "function") {
                            var s = t.return;
                            try {
                                r.componentDidMount();
                            } catch (l) {
                                ke(t, s, l);
                            }
                        }
                        var o = t.return;
                        try {
                            Iu(t);
                        } catch (l) {
                            ke(t, o, l);
                        }
                        break;
                    case 5:
                        var i = t.return;
                        try {
                            Iu(t);
                        } catch (l) {
                            ke(t, i, l);
                        }
                }
            } catch (l) {
                ke(t, t.return, l);
            }
            if (t === e) {
                X = null;
                break;
            }
            var a = t.sibling;
            if (a !== null) {
                a.return = t.return, X = a;
                break;
            }
            X = t.return;
        }
    }
    var Dw = Math.ceil, Xi = En.ReactCurrentDispatcher, Jc = En.ReactCurrentOwner, Ft = En.ReactCurrentBatchConfig, ce = 0, $e = null, Te = null, Ke = 0, vt = 0, qr = nr(0), Le = 0, yo = null, kr = 0, Ca = 0, Yc = 0, Js = null, ut = null, Xc = 0, gs = 1 / 0, gn = null, Zi = !1, Tu = null, Gn = null, ri = !1, Nn = null, qi = 0, Ys = 0, ju = null, Si = -1, ki = 0;
    function st() {
        return ce & 6 ? Ae() : Si !== -1 ? Si : Si = Ae();
    }
    function Qn(e) {
        return e.mode & 1 ? ce & 2 && Ke !== 0 ? Ke & -Ke : _w.transition !== null ? (ki === 0 && (ki = E0()), ki) : (e = fe, e !== 0 || (e = window.event, e = e === void 0 ? 16 : R0(e.type)), e) : 1;
    }
    function Qt(e, t, n, r) {
        if (50 < Ys) throw Ys = 0, ju = null, Error(Q(185));
        Mo(e, n, r), (!(ce & 2) || e !== $e) && (e === $e && (!(ce & 2) && (Ca |= n), Le === 4 && zn(e, Ke)), gt(e, r), n === 1 && ce === 0 && !(t.mode & 1) && (gs = Ae() + 500, ba && rr()));
    }
    function gt(e, t) {
        var n = e.callbackNode;
        _1(e, t);
        var r = Li(e, e === $e ? Ke : 0);
        if (r === 0) n !== null && td(n), e.callbackNode = null, e.callbackPriority = 0;
        else if (t = r & -r, e.callbackPriority !== t) {
            if (n != null && td(n), t === 1) e.tag === 0 ? mw(Gd.bind(null, e)) : Z0(Gd.bind(null, e)), hw(function() {
                !(ce & 6) && rr();
            }), n = null;
            else {
                switch(I0(r)){
                    case 1:
                        n = Sc;
                        break;
                    case 4:
                        n = k0;
                        break;
                    case 16:
                        n = Di;
                        break;
                    case 536870912:
                        n = C0;
                        break;
                    default:
                        n = Di;
                }
                n = Yp(n, $p.bind(null, e));
            }
            e.callbackPriority = t, e.callbackNode = n;
        }
    }
    function $p(e, t) {
        if (Si = -1, ki = 0, ce & 6) throw Error(Q(327));
        var n = e.callbackNode;
        if (ls() && e.callbackNode !== n) return null;
        var r = Li(e, e === $e ? Ke : 0);
        if (r === 0) return null;
        if (r & 30 || r & e.expiredLanes || t) t = ea(e, r);
        else {
            t = r;
            var s = ce;
            ce |= 2;
            var o = Wp();
            ($e !== e || Ke !== t) && (gn = null, gs = Ae() + 500, pr(e, t));
            do try {
                Fw();
                break;
            } catch (a) {
                Vp(e, a);
            }
            while (1);
            Lc(), Xi.current = o, ce = s, Te !== null ? t = 0 : ($e = null, Ke = 0, t = Le);
        }
        if (t !== 0) {
            if (t === 2 && (s = su(e), s !== 0 && (r = s, t = Mu(e, s))), t === 1) throw n = yo, pr(e, 0), zn(e, r), gt(e, Ae()), n;
            if (t === 6) zn(e, r);
            else {
                if (s = e.current.alternate, !(r & 30) && !Lw(s) && (t = ea(e, r), t === 2 && (o = su(e), o !== 0 && (r = o, t = Mu(e, o))), t === 1)) throw n = yo, pr(e, 0), zn(e, r), gt(e, Ae()), n;
                switch(e.finishedWork = s, e.finishedLanes = r, t){
                    case 0:
                    case 1:
                        throw Error(Q(345));
                    case 2:
                        or(e, ut, gn);
                        break;
                    case 3:
                        if (zn(e, r), (r & 130023424) === r && (t = Xc + 500 - Ae(), 10 < t)) {
                            if (Li(e, 0) !== 0) break;
                            if (s = e.suspendedLanes, (s & r) !== r) {
                                st(), e.pingedLanes |= e.suspendedLanes & s;
                                break;
                            }
                            e.timeoutHandle = du(or.bind(null, e, ut, gn), t);
                            break;
                        }
                        or(e, ut, gn);
                        break;
                    case 4:
                        if (zn(e, r), (r & 4194240) === r) break;
                        for(t = e.eventTimes, s = -1; 0 < r;){
                            var i = 31 - Gt(r);
                            o = 1 << i, i = t[i], i > s && (s = i), r &= ~o;
                        }
                        if (r = s, r = Ae() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Dw(r / 1960)) - r, 10 < r) {
                            e.timeoutHandle = du(or.bind(null, e, ut, gn), r);
                            break;
                        }
                        or(e, ut, gn);
                        break;
                    case 5:
                        or(e, ut, gn);
                        break;
                    default:
                        throw Error(Q(329));
                }
            }
        }
        return gt(e, Ae()), e.callbackNode === n ? $p.bind(null, e) : null;
    }
    function Mu(e, t) {
        var n = Js;
        return e.current.memoizedState.isDehydrated && (pr(e, t).flags |= 256), e = ea(e, t), e !== 2 && (t = ut, ut = n, t !== null && Ru(t)), e;
    }
    function Ru(e) {
        ut === null ? ut = e : ut.push.apply(ut, e);
    }
    function Lw(e) {
        for(var t = e;;){
            if (t.flags & 16384) {
                var n = t.updateQueue;
                if (n !== null && (n = n.stores, n !== null)) for(var r = 0; r < n.length; r++){
                    var s = n[r], o = s.getSnapshot;
                    s = s.value;
                    try {
                        if (!Jt(o(), s)) return !1;
                    } catch  {
                        return !1;
                    }
                }
            }
            if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
            else {
                if (t === e) break;
                for(; t.sibling === null;){
                    if (t.return === null || t.return === e) return !0;
                    t = t.return;
                }
                t.sibling.return = t.return, t = t.sibling;
            }
        }
        return !0;
    }
    function zn(e, t) {
        for(t &= ~Yc, t &= ~Ca, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;){
            var n = 31 - Gt(t), r = 1 << n;
            e[n] = -1, t &= ~r;
        }
    }
    function Gd(e) {
        if (ce & 6) throw Error(Q(327));
        ls();
        var t = Li(e, 0);
        if (!(t & 1)) return gt(e, Ae()), null;
        var n = ea(e, t);
        if (e.tag !== 0 && n === 2) {
            var r = su(e);
            r !== 0 && (t = r, n = Mu(e, r));
        }
        if (n === 1) throw n = yo, pr(e, 0), zn(e, t), gt(e, Ae()), n;
        if (n === 6) throw Error(Q(345));
        return e.finishedWork = e.current.alternate, e.finishedLanes = t, or(e, ut, gn), gt(e, Ae()), null;
    }
    function Zc(e, t) {
        var n = ce;
        ce |= 1;
        try {
            return e(t);
        } finally{
            ce = n, ce === 0 && (gs = Ae() + 500, ba && rr());
        }
    }
    function Cr(e) {
        Nn !== null && Nn.tag === 0 && !(ce & 6) && ls();
        var t = ce;
        ce |= 1;
        var n = Ft.transition, r = fe;
        try {
            if (Ft.transition = null, fe = 1, e) return e();
        } finally{
            fe = r, Ft.transition = n, ce = t, !(ce & 6) && rr();
        }
    }
    function qc() {
        vt = qr.current, we(qr);
    }
    function pr(e, t) {
        e.finishedWork = null, e.finishedLanes = 0;
        var n = e.timeoutHandle;
        if (n !== -1 && (e.timeoutHandle = -1, dw(n)), Te !== null) for(n = Te.return; n !== null;){
            var r = n;
            switch(Rc(r), r.tag){
                case 1:
                    r = r.type.childContextTypes, r != null && Ni();
                    break;
                case 3:
                    hs(), we(ht), we(qe), Bc();
                    break;
                case 5:
                    Nc(r);
                    break;
                case 4:
                    hs();
                    break;
                case 13:
                    we(be);
                    break;
                case 19:
                    we(be);
                    break;
                case 10:
                    Uc(r.type._context);
                    break;
                case 22:
                case 23:
                    qc();
            }
            n = n.return;
        }
        if ($e = e, Te = e = Jn(e.current, null), Ke = vt = t, Le = 0, yo = null, Yc = Ca = kr = 0, ut = Js = null, fr !== null) {
            for(t = 0; t < fr.length; t++)if (n = fr[t], r = n.interleaved, r !== null) {
                n.interleaved = null;
                var s = r.next, o = n.pending;
                if (o !== null) {
                    var i = o.next;
                    o.next = s, r.next = i;
                }
                n.pending = r;
            }
            fr = null;
        }
        return e;
    }
    function Vp(e, t) {
        do {
            var n = Te;
            try {
                if (Lc(), vi.current = Yi, Ji) {
                    for(var r = xe.memoizedState; r !== null;){
                        var s = r.queue;
                        s !== null && (s.pending = null), r = r.next;
                    }
                    Ji = !1;
                }
                if (Sr = 0, Ne = De = xe = null, Gs = !1, ho = 0, Jc.current = null, n === null || n.return === null) {
                    Le = 1, yo = t, Te = null;
                    break;
                }
                e: {
                    var o = e, i = n.return, a = n, l = t;
                    if (t = Ke, a.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
                        var f = l, c = a, u = c.tag;
                        if (!(c.mode & 1) && (u === 0 || u === 11 || u === 15)) {
                            var h = c.alternate;
                            h ? (c.updateQueue = h.updateQueue, c.memoizedState = h.memoizedState, c.lanes = h.lanes) : (c.updateQueue = null, c.memoizedState = null);
                        }
                        var d = Pd(i);
                        if (d !== null) {
                            d.flags &= -257, Dd(d, i, a, o, t), d.mode & 1 && Rd(o, f, t), t = d, l = f;
                            var p = t.updateQueue;
                            if (p === null) {
                                var m = new Set;
                                m.add(l), t.updateQueue = m;
                            } else p.add(l);
                            break e;
                        } else {
                            if (!(t & 1)) {
                                Rd(o, f, t), ef();
                                break e;
                            }
                            l = Error(Q(426));
                        }
                    } else if (ve && a.mode & 1) {
                        var x = Pd(i);
                        if (x !== null) {
                            !(x.flags & 65536) && (x.flags |= 256), Dd(x, i, a, o, t), Pc(ps(l, a));
                            break e;
                        }
                    }
                    o = l = ps(l, a), Le !== 4 && (Le = 2), Js === null ? Js = [
                        o
                    ] : Js.push(o), o = i;
                    do {
                        switch(o.tag){
                            case 3:
                                o.flags |= 65536, t &= -t, o.lanes |= t;
                                var w = Ip(o, l, t);
                                Id(o, w);
                                break e;
                            case 1:
                                a = l;
                                var _ = o.type, g = o.stateNode;
                                if (!(o.flags & 128) && (typeof _.getDerivedStateFromError == "function" || g !== null && typeof g.componentDidCatch == "function" && (Gn === null || !Gn.has(g)))) {
                                    o.flags |= 65536, t &= -t, o.lanes |= t;
                                    var A = Ap(o, a, t);
                                    Id(o, A);
                                    break e;
                                }
                        }
                        o = o.return;
                    }while (o !== null);
                }
                Gp(n);
            } catch (P) {
                t = P, Te === n && n !== null && (Te = n = n.return);
                continue;
            }
            break;
        }while (1);
    }
    function Wp() {
        var e = Xi.current;
        return Xi.current = Yi, e === null ? Yi : e;
    }
    function ef() {
        (Le === 0 || Le === 3 || Le === 2) && (Le = 4), $e === null || !(kr & 268435455) && !(Ca & 268435455) || zn($e, Ke);
    }
    function ea(e, t) {
        var n = ce;
        ce |= 2;
        var r = Wp();
        ($e !== e || Ke !== t) && (gn = null, pr(e, t));
        do try {
            Uw();
            break;
        } catch (s) {
            Vp(e, s);
        }
        while (1);
        if (Lc(), ce = n, Xi.current = r, Te !== null) throw Error(Q(261));
        return $e = null, Ke = 0, Le;
    }
    function Uw() {
        for(; Te !== null;)Kp(Te);
    }
    function Fw() {
        for(; Te !== null && !u1();)Kp(Te);
    }
    function Kp(e) {
        var t = Jp(e.alternate, e, vt);
        e.memoizedProps = e.pendingProps, t === null ? Gp(e) : Te = t, Jc.current = null;
    }
    function Gp(e) {
        var t = e;
        do {
            var n = t.alternate;
            if (e = t.return, t.flags & 32768) {
                if (n = jw(n, t), n !== null) {
                    n.flags &= 32767, Te = n;
                    return;
                }
                if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
                else {
                    Le = 6, Te = null;
                    return;
                }
            } else if (n = Tw(n, t, vt), n !== null) {
                Te = n;
                return;
            }
            if (t = t.sibling, t !== null) {
                Te = t;
                return;
            }
            Te = t = e;
        }while (t !== null);
        Le === 0 && (Le = 5);
    }
    function or(e, t, n) {
        var r = fe, s = Ft.transition;
        try {
            Ft.transition = null, fe = 1, zw(e, t, n, r);
        } finally{
            Ft.transition = s, fe = r;
        }
        return null;
    }
    function zw(e, t, n, r) {
        do ls();
        while (Nn !== null);
        if (ce & 6) throw Error(Q(327));
        n = e.finishedWork;
        var s = e.finishedLanes;
        if (n === null) return null;
        if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(Q(177));
        e.callbackNode = null, e.callbackPriority = 0;
        var o = n.lanes | n.childLanes;
        if (w1(e, o), e === $e && (Te = $e = null, Ke = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || ri || (ri = !0, Yp(Di, function() {
            return ls(), null;
        })), o = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || o) {
            o = Ft.transition, Ft.transition = null;
            var i = fe;
            fe = 1;
            var a = ce;
            ce |= 4, Jc.current = null, Rw(e, n), Np(n, e), ow(cu), Ui = !!uu, cu = uu = null, e.current = n, Pw(n), c1(), ce = a, fe = i, Ft.transition = o;
        } else e.current = n;
        if (ri && (ri = !1, Nn = e, qi = s), o = e.pendingLanes, o === 0 && (Gn = null), h1(n.stateNode), gt(e, Ae()), t !== null) for(r = e.onRecoverableError, n = 0; n < t.length; n++)s = t[n], r(s.value, {
            componentStack: s.stack,
            digest: s.digest
        });
        if (Zi) throw Zi = !1, e = Tu, Tu = null, e;
        return qi & 1 && e.tag !== 0 && ls(), o = e.pendingLanes, o & 1 ? e === ju ? Ys++ : (Ys = 0, ju = e) : Ys = 0, rr(), null;
    }
    function ls() {
        if (Nn !== null) {
            var e = I0(qi), t = Ft.transition, n = fe;
            try {
                if (Ft.transition = null, fe = 16 > e ? 16 : e, Nn === null) var r = !1;
                else {
                    if (e = Nn, Nn = null, qi = 0, ce & 6) throw Error(Q(331));
                    var s = ce;
                    for(ce |= 4, X = e.current; X !== null;){
                        var o = X, i = o.child;
                        if (X.flags & 16) {
                            var a = o.deletions;
                            if (a !== null) {
                                for(var l = 0; l < a.length; l++){
                                    var f = a[l];
                                    for(X = f; X !== null;){
                                        var c = X;
                                        switch(c.tag){
                                            case 0:
                                            case 11:
                                            case 15:
                                                Qs(8, c, o);
                                        }
                                        var u = c.child;
                                        if (u !== null) u.return = c, X = u;
                                        else for(; X !== null;){
                                            c = X;
                                            var h = c.sibling, d = c.return;
                                            if (Fp(c), c === f) {
                                                X = null;
                                                break;
                                            }
                                            if (h !== null) {
                                                h.return = d, X = h;
                                                break;
                                            }
                                            X = d;
                                        }
                                    }
                                }
                                var p = o.alternate;
                                if (p !== null) {
                                    var m = p.child;
                                    if (m !== null) {
                                        p.child = null;
                                        do {
                                            var x = m.sibling;
                                            m.sibling = null, m = x;
                                        }while (m !== null);
                                    }
                                }
                                X = o;
                            }
                        }
                        if (o.subtreeFlags & 2064 && i !== null) i.return = o, X = i;
                        else e: for(; X !== null;){
                            if (o = X, o.flags & 2048) switch(o.tag){
                                case 0:
                                case 11:
                                case 15:
                                    Qs(9, o, o.return);
                            }
                            var w = o.sibling;
                            if (w !== null) {
                                w.return = o.return, X = w;
                                break e;
                            }
                            X = o.return;
                        }
                    }
                    var _ = e.current;
                    for(X = _; X !== null;){
                        i = X;
                        var g = i.child;
                        if (i.subtreeFlags & 2064 && g !== null) g.return = i, X = g;
                        else e: for(i = _; X !== null;){
                            if (a = X, a.flags & 2048) try {
                                switch(a.tag){
                                    case 0:
                                    case 11:
                                    case 15:
                                        ka(9, a);
                                }
                            } catch (P) {
                                ke(a, a.return, P);
                            }
                            if (a === i) {
                                X = null;
                                break e;
                            }
                            var A = a.sibling;
                            if (A !== null) {
                                A.return = a.return, X = A;
                                break e;
                            }
                            X = a.return;
                        }
                    }
                    if (ce = s, rr(), dn && typeof dn.onPostCommitFiberRoot == "function") try {
                        dn.onPostCommitFiberRoot(ya, e);
                    } catch  {}
                    r = !0;
                }
                return r;
            } finally{
                fe = n, Ft.transition = t;
            }
        }
        return !1;
    }
    function Qd(e, t, n) {
        t = ps(n, t), t = Ip(e, t, 1), e = Kn(e, t, 1), t = st(), e !== null && (Mo(e, 1, t), gt(e, t));
    }
    function ke(e, t, n) {
        if (e.tag === 3) Qd(e, e, n);
        else for(; t !== null;){
            if (t.tag === 3) {
                Qd(t, e, n);
                break;
            } else if (t.tag === 1) {
                var r = t.stateNode;
                if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Gn === null || !Gn.has(r))) {
                    e = ps(n, e), e = Ap(t, e, 1), t = Kn(t, e, 1), e = st(), t !== null && (Mo(t, 1, e), gt(t, e));
                    break;
                }
            }
            t = t.return;
        }
    }
    function Hw(e, t, n) {
        var r = e.pingCache;
        r !== null && r.delete(t), t = st(), e.pingedLanes |= e.suspendedLanes & n, $e === e && (Ke & n) === n && (Le === 4 || Le === 3 && (Ke & 130023424) === Ke && 500 > Ae() - Xc ? pr(e, 0) : Yc |= n), gt(e, t);
    }
    function Qp(e, t) {
        t === 0 && (e.mode & 1 ? (t = Go, Go <<= 1, !(Go & 130023424) && (Go = 4194304)) : t = 1);
        var n = st();
        e = kn(e, t), e !== null && (Mo(e, t, n), gt(e, n));
    }
    function Nw(e) {
        var t = e.memoizedState, n = 0;
        t !== null && (n = t.retryLane), Qp(e, n);
    }
    function Bw(e, t) {
        var n = 0;
        switch(e.tag){
            case 13:
                var r = e.stateNode, s = e.memoizedState;
                s !== null && (n = s.retryLane);
                break;
            case 19:
                r = e.stateNode;
                break;
            default:
                throw Error(Q(314));
        }
        r !== null && r.delete(t), Qp(e, n);
    }
    var Jp;
    Jp = function(e, t, n) {
        if (e !== null) if (e.memoizedProps !== t.pendingProps || ht.current) dt = !0;
        else {
            if (!(e.lanes & n) && !(t.flags & 128)) return dt = !1, Ow(e, t, n);
            dt = !!(e.flags & 131072);
        }
        else dt = !1, ve && t.flags & 1048576 && q0(t, Vi, t.index);
        switch(t.lanes = 0, t.tag){
            case 2:
                var r = t.type;
                xi(e, t), e = t.pendingProps;
                var s = cs(t, qe.current);
                as(t, n), s = Vc(null, t, r, e, s, n);
                var o = Wc();
                return t.flags |= 1, typeof s == "object" && s !== null && typeof s.render == "function" && s.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, pt(r) ? (o = !0, Bi(t)) : o = !1, t.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null, zc(t), s.updater = Sa, t.stateNode = s, s._reactInternals = t, wu(t, r, e, n), t = xu(null, t, r, !0, o, n)) : (t.tag = 0, ve && o && Mc(t), et(null, t, s, n), t = t.child), t;
            case 16:
                r = t.elementType;
                e: {
                    switch(xi(e, t), e = t.pendingProps, s = r._init, r = s(r._payload), t.type = r, s = t.tag = Vw(r), e = $t(r, e), s){
                        case 0:
                            t = bu(null, t, r, e, n);
                            break e;
                        case 1:
                            t = Fd(null, t, r, e, n);
                            break e;
                        case 11:
                            t = Ld(null, t, r, e, n);
                            break e;
                        case 14:
                            t = Ud(null, t, r, $t(r.type, e), n);
                            break e;
                    }
                    throw Error(Q(306, r, ""));
                }
                return t;
            case 0:
                return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : $t(r, s), bu(e, t, r, s, n);
            case 1:
                return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : $t(r, s), Fd(e, t, r, s, n);
            case 3:
                e: {
                    if (Mp(t), e === null) throw Error(Q(387));
                    r = t.pendingProps, o = t.memoizedState, s = o.element, op(e, t), Gi(t, r, null, n);
                    var i = t.memoizedState;
                    if (r = i.element, o.isDehydrated) if (o = {
                        element: r,
                        isDehydrated: !1,
                        cache: i.cache,
                        pendingSuspenseBoundaries: i.pendingSuspenseBoundaries,
                        transitions: i.transitions
                    }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
                        s = ps(Error(Q(423)), t), t = zd(e, t, r, n, s);
                        break e;
                    } else if (r !== s) {
                        s = ps(Error(Q(424)), t), t = zd(e, t, r, n, s);
                        break e;
                    } else for(bt = Wn(t.stateNode.containerInfo.firstChild), xt = t, ve = !0, Wt = null, n = rp(t, null, r, n), t.child = n; n;)n.flags = n.flags & -3 | 4096, n = n.sibling;
                    else {
                        if (fs(), r === s) {
                            t = Cn(e, t, n);
                            break e;
                        }
                        et(e, t, r, n);
                    }
                    t = t.child;
                }
                return t;
            case 5:
                return ip(t), e === null && yu(t), r = t.type, s = t.pendingProps, o = e !== null ? e.memoizedProps : null, i = s.children, fu(r, s) ? i = null : o !== null && fu(r, o) && (t.flags |= 32), jp(e, t), et(e, t, i, n), t.child;
            case 6:
                return e === null && yu(t), null;
            case 13:
                return Rp(e, t, n);
            case 4:
                return Hc(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ds(t, null, r, n) : et(e, t, r, n), t.child;
            case 11:
                return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : $t(r, s), Ld(e, t, r, s, n);
            case 7:
                return et(e, t, t.pendingProps, n), t.child;
            case 8:
                return et(e, t, t.pendingProps.children, n), t.child;
            case 12:
                return et(e, t, t.pendingProps.children, n), t.child;
            case 10:
                e: {
                    if (r = t.type._context, s = t.pendingProps, o = t.memoizedProps, i = s.value, ge(Wi, r._currentValue), r._currentValue = i, o !== null) if (Jt(o.value, i)) {
                        if (o.children === s.children && !ht.current) {
                            t = Cn(e, t, n);
                            break e;
                        }
                    } else for(o = t.child, o !== null && (o.return = t); o !== null;){
                        var a = o.dependencies;
                        if (a !== null) {
                            i = o.child;
                            for(var l = a.firstContext; l !== null;){
                                if (l.context === r) {
                                    if (o.tag === 1) {
                                        l = bn(-1, n & -n), l.tag = 2;
                                        var f = o.updateQueue;
                                        if (f !== null) {
                                            f = f.shared;
                                            var c = f.pending;
                                            c === null ? l.next = l : (l.next = c.next, c.next = l), f.pending = l;
                                        }
                                    }
                                    o.lanes |= n, l = o.alternate, l !== null && (l.lanes |= n), mu(o.return, n, t), a.lanes |= n;
                                    break;
                                }
                                l = l.next;
                            }
                        } else if (o.tag === 10) i = o.type === t.type ? null : o.child;
                        else if (o.tag === 18) {
                            if (i = o.return, i === null) throw Error(Q(341));
                            i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), mu(i, n, t), i = o.sibling;
                        } else i = o.child;
                        if (i !== null) i.return = o;
                        else for(i = o; i !== null;){
                            if (i === t) {
                                i = null;
                                break;
                            }
                            if (o = i.sibling, o !== null) {
                                o.return = i.return, i = o;
                                break;
                            }
                            i = i.return;
                        }
                        o = i;
                    }
                    et(e, t, s.children, n), t = t.child;
                }
                return t;
            case 9:
                return s = t.type, r = t.pendingProps.children, as(t, n), s = Ht(s), r = r(s), t.flags |= 1, et(e, t, r, n), t.child;
            case 14:
                return r = t.type, s = $t(r, t.pendingProps), s = $t(r.type, s), Ud(e, t, r, s, n);
            case 15:
                return Op(e, t, t.type, t.pendingProps, n);
            case 17:
                return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : $t(r, s), xi(e, t), t.tag = 1, pt(r) ? (e = !0, Bi(t)) : e = !1, as(t, n), Ep(t, r, s), wu(t, r, s, n), xu(null, t, r, !0, e, n);
            case 19:
                return Pp(e, t, n);
            case 22:
                return Tp(e, t, n);
        }
        throw Error(Q(156, t.tag));
    };
    function Yp(e, t) {
        return S0(e, t);
    }
    function $w(e, t, n, r) {
        this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
    }
    function Ut(e, t, n, r) {
        return new $w(e, t, n, r);
    }
    function tf(e) {
        return e = e.prototype, !(!e || !e.isReactComponent);
    }
    function Vw(e) {
        if (typeof e == "function") return tf(e) ? 1 : 0;
        if (e != null) {
            if (e = e.$$typeof, e === vc) return 11;
            if (e === bc) return 14;
        }
        return 2;
    }
    function Jn(e, t) {
        var n = e.alternate;
        return n === null ? (n = Ut(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
    }
    function Ci(e, t, n, r, s, o) {
        var i = 2;
        if (r = e, typeof e == "function") tf(e) && (i = 1);
        else if (typeof e == "string") i = 5;
        else e: switch(e){
            case $r:
                return gr(n.children, s, o, t);
            case wc:
                i = 8, s |= 8;
                break;
            case $l:
                return e = Ut(12, n, t, s | 2), e.elementType = $l, e.lanes = o, e;
            case Vl:
                return e = Ut(13, n, t, s), e.elementType = Vl, e.lanes = o, e;
            case Wl:
                return e = Ut(19, n, t, s), e.elementType = Wl, e.lanes = o, e;
            case i0:
                return Ea(n, s, o, t);
            default:
                if (typeof e == "object" && e !== null) switch(e.$$typeof){
                    case s0:
                        i = 10;
                        break e;
                    case o0:
                        i = 9;
                        break e;
                    case vc:
                        i = 11;
                        break e;
                    case bc:
                        i = 14;
                        break e;
                    case Ln:
                        i = 16, r = null;
                        break e;
                }
                throw Error(Q(130, e == null ? e : typeof e, ""));
        }
        return t = Ut(i, n, t, s), t.elementType = e, t.type = r, t.lanes = o, t;
    }
    function gr(e, t, n, r) {
        return e = Ut(7, e, r, t), e.lanes = n, e;
    }
    function Ea(e, t, n, r) {
        return e = Ut(22, e, r, t), e.elementType = i0, e.lanes = n, e.stateNode = {
            isHidden: !1
        }, e;
    }
    function wl(e, t, n) {
        return e = Ut(6, e, null, t), e.lanes = n, e;
    }
    function vl(e, t, n) {
        return t = Ut(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = {
            containerInfo: e.containerInfo,
            pendingChildren: null,
            implementation: e.implementation
        }, t;
    }
    function Ww(e, t, n, r, s) {
        this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = el(0), this.expirationTimes = el(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = el(0), this.identifierPrefix = r, this.onRecoverableError = s, this.mutableSourceEagerHydrationData = null;
    }
    function nf(e, t, n, r, s, o, i, a, l) {
        return e = new Ww(e, t, n, a, l), t === 1 ? (t = 1, o === !0 && (t |= 8)) : t = 0, o = Ut(3, null, null, t), e.current = o, o.stateNode = e, o.memoizedState = {
            element: r,
            isDehydrated: n,
            cache: null,
            transitions: null,
            pendingSuspenseBoundaries: null
        }, zc(o), e;
    }
    function Kw(e, t, n) {
        var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return {
            $$typeof: Br,
            key: r == null ? null : "" + r,
            children: e,
            containerInfo: t,
            implementation: n
        };
    }
    function Xp(e) {
        if (!e) return qn;
        e = e._reactInternals;
        e: {
            if (Tr(e) !== e || e.tag !== 1) throw Error(Q(170));
            var t = e;
            do {
                switch(t.tag){
                    case 3:
                        t = t.stateNode.context;
                        break e;
                    case 1:
                        if (pt(t.type)) {
                            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                            break e;
                        }
                }
                t = t.return;
            }while (t !== null);
            throw Error(Q(171));
        }
        if (e.tag === 1) {
            var n = e.type;
            if (pt(n)) return X0(e, n, t);
        }
        return t;
    }
    function Zp(e, t, n, r, s, o, i, a, l) {
        return e = nf(n, r, !0, e, s, o, i, a, l), e.context = Xp(null), n = e.current, r = st(), s = Qn(n), o = bn(r, s), o.callback = t ?? null, Kn(n, o, s), e.current.lanes = s, Mo(e, s, r), gt(e, r), e;
    }
    function Ia(e, t, n, r) {
        var s = t.current, o = st(), i = Qn(s);
        return n = Xp(n), t.context === null ? t.context = n : t.pendingContext = n, t = bn(o, i), t.payload = {
            element: e
        }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Kn(s, t, i), e !== null && (Qt(e, s, i, o), wi(e, s, i)), i;
    }
    function ta(e) {
        if (e = e.current, !e.child) return null;
        switch(e.child.tag){
            case 5:
                return e.child.stateNode;
            default:
                return e.child.stateNode;
        }
    }
    function Jd(e, t) {
        if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
            var n = e.retryLane;
            e.retryLane = n !== 0 && n < t ? n : t;
        }
    }
    function rf(e, t) {
        Jd(e, t), (e = e.alternate) && Jd(e, t);
    }
    function Gw() {
        return null;
    }
    var qp = typeof reportError == "function" ? reportError : function(e) {
        console.error(e);
    };
    function sf(e) {
        this._internalRoot = e;
    }
    Aa.prototype.render = sf.prototype.render = function(e) {
        var t = this._internalRoot;
        if (t === null) throw Error(Q(409));
        Ia(e, t, null, null);
    };
    Aa.prototype.unmount = sf.prototype.unmount = function() {
        var e = this._internalRoot;
        if (e !== null) {
            this._internalRoot = null;
            var t = e.containerInfo;
            Cr(function() {
                Ia(null, e, null, null);
            }), t[Sn] = null;
        }
    };
    function Aa(e) {
        this._internalRoot = e;
    }
    Aa.prototype.unstable_scheduleHydration = function(e) {
        if (e) {
            var t = T0();
            e = {
                blockedOn: null,
                target: e,
                priority: t
            };
            for(var n = 0; n < Fn.length && t !== 0 && t < Fn[n].priority; n++);
            Fn.splice(n, 0, e), n === 0 && M0(e);
        }
    };
    function of(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
    }
    function Oa(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
    }
    function Yd() {}
    function Qw(e, t, n, r, s) {
        if (s) {
            if (typeof r == "function") {
                var o = r;
                r = function() {
                    var f = ta(i);
                    o.call(f);
                };
            }
            var i = Zp(t, r, e, 0, null, !1, !1, "", Yd);
            return e._reactRootContainer = i, e[Sn] = i.current, ao(e.nodeType === 8 ? e.parentNode : e), Cr(), i;
        }
        for(; s = e.lastChild;)e.removeChild(s);
        if (typeof r == "function") {
            var a = r;
            r = function() {
                var f = ta(l);
                a.call(f);
            };
        }
        var l = nf(e, 0, !1, null, null, !1, !1, "", Yd);
        return e._reactRootContainer = l, e[Sn] = l.current, ao(e.nodeType === 8 ? e.parentNode : e), Cr(function() {
            Ia(t, l, n, r);
        }), l;
    }
    function Ta(e, t, n, r, s) {
        var o = n._reactRootContainer;
        if (o) {
            var i = o;
            if (typeof s == "function") {
                var a = s;
                s = function() {
                    var l = ta(i);
                    a.call(l);
                };
            }
            Ia(t, i, e, s);
        } else i = Qw(n, t, e, s, r);
        return ta(i);
    }
    A0 = function(e) {
        switch(e.tag){
            case 3:
                var t = e.stateNode;
                if (t.current.memoizedState.isDehydrated) {
                    var n = Fs(t.pendingLanes);
                    n !== 0 && (kc(t, n | 1), gt(t, Ae()), !(ce & 6) && (gs = Ae() + 500, rr()));
                }
                break;
            case 13:
                Cr(function() {
                    var r = kn(e, 1);
                    if (r !== null) {
                        var s = st();
                        Qt(r, e, 1, s);
                    }
                }), rf(e, 1);
        }
    };
    Cc = function(e) {
        if (e.tag === 13) {
            var t = kn(e, 134217728);
            if (t !== null) {
                var n = st();
                Qt(t, e, 134217728, n);
            }
            rf(e, 134217728);
        }
    };
    O0 = function(e) {
        if (e.tag === 13) {
            var t = Qn(e), n = kn(e, t);
            if (n !== null) {
                var r = st();
                Qt(n, e, t, r);
            }
            rf(e, t);
        }
    };
    T0 = function() {
        return fe;
    };
    j0 = function(e, t) {
        var n = fe;
        try {
            return fe = e, t();
        } finally{
            fe = n;
        }
    };
    tu = function(e, t, n) {
        switch(t){
            case "input":
                if (Ql(e, n), t = n.name, n.type === "radio" && t != null) {
                    for(n = e; n.parentNode;)n = n.parentNode;
                    for(n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++){
                        var r = n[t];
                        if (r !== e && r.form === e.form) {
                            var s = va(r);
                            if (!s) throw Error(Q(90));
                            l0(r), Ql(r, s);
                        }
                    }
                }
                break;
            case "textarea":
                c0(e, n);
                break;
            case "select":
                t = n.value, t != null && rs(e, !!n.multiple, t, !1);
        }
    };
    m0 = Zc;
    _0 = Cr;
    var Jw = {
        usingClientEntryPoint: !1,
        Events: [
            Po,
            Gr,
            va,
            g0,
            y0,
            Zc
        ]
    }, Ms = {
        findFiberByHostInstance: cr,
        bundleType: 0,
        version: "18.3.1",
        rendererPackageName: "react-dom"
    }, Yw = {
        bundleType: Ms.bundleType,
        version: Ms.version,
        rendererPackageName: Ms.rendererPackageName,
        rendererConfig: Ms.rendererConfig,
        overrideHookState: null,
        overrideHookStateDeletePath: null,
        overrideHookStateRenamePath: null,
        overrideProps: null,
        overridePropsDeletePath: null,
        overridePropsRenamePath: null,
        setErrorHandler: null,
        setSuspenseHandler: null,
        scheduleUpdate: null,
        currentDispatcherRef: En.ReactCurrentDispatcher,
        findHostInstanceByFiber: function(e) {
            return e = b0(e), e === null ? null : e.stateNode;
        },
        findFiberByHostInstance: Ms.findFiberByHostInstance || Gw,
        findHostInstancesForRefresh: null,
        scheduleRefresh: null,
        scheduleRoot: null,
        setRefreshHandler: null,
        getCurrentFiber: null,
        reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var si = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!si.isDisabled && si.supportsFiber) try {
            ya = si.inject(Yw), dn = si;
        } catch  {}
    }
    kt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Jw;
    kt.createPortal = function(e, t) {
        var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!of(t)) throw Error(Q(200));
        return Kw(e, t, null, n);
    };
    kt.createRoot = function(e, t) {
        if (!of(e)) throw Error(Q(299));
        var n = !1, r = "", s = qp;
        return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (s = t.onRecoverableError)), t = nf(e, 1, !1, null, null, n, !1, r, s), e[Sn] = t.current, ao(e.nodeType === 8 ? e.parentNode : e), new sf(t);
    };
    kt.findDOMNode = function(e) {
        if (e == null) return null;
        if (e.nodeType === 1) return e;
        var t = e._reactInternals;
        if (t === void 0) throw typeof e.render == "function" ? Error(Q(188)) : (e = Object.keys(e).join(","), Error(Q(268, e)));
        return e = b0(t), e = e === null ? null : e.stateNode, e;
    };
    kt.flushSync = function(e) {
        return Cr(e);
    };
    kt.hydrate = function(e, t, n) {
        if (!Oa(t)) throw Error(Q(200));
        return Ta(null, e, t, !0, n);
    };
    kt.hydrateRoot = function(e, t, n) {
        if (!of(e)) throw Error(Q(405));
        var r = n != null && n.hydratedSources || null, s = !1, o = "", i = qp;
        if (n != null && (n.unstable_strictMode === !0 && (s = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (i = n.onRecoverableError)), t = Zp(t, null, e, 1, n ?? null, s, !1, o, i), e[Sn] = t.current, ao(e), r) for(e = 0; e < r.length; e++)n = r[e], s = n._getVersion, s = s(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [
            n,
            s
        ] : t.mutableSourceEagerHydrationData.push(n, s);
        return new Aa(t);
    };
    kt.render = function(e, t, n) {
        if (!Oa(t)) throw Error(Q(200));
        return Ta(null, e, t, !1, n);
    };
    kt.unmountComponentAtNode = function(e) {
        if (!Oa(e)) throw Error(Q(40));
        return e._reactRootContainer ? (Cr(function() {
            Ta(null, null, e, !1, function() {
                e._reactRootContainer = null, e[Sn] = null;
            });
        }), !0) : !1;
    };
    kt.unstable_batchedUpdates = Zc;
    kt.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
        if (!Oa(n)) throw Error(Q(200));
        if (e == null || e._reactInternals === void 0) throw Error(Q(38));
        return Ta(e, t, n, !1, r);
    };
    kt.version = "18.3.1-next-f1338f8080-20240426";
    function eg() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
            __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(eg);
        } catch (e) {
            console.error(e);
        }
    }
    eg(), e0.exports = kt;
    var Xw = e0.exports, Xd = Xw;
    Nl.createRoot = Xd.createRoot, Nl.hydrateRoot = Xd.hydrateRoot;
    const Yn = Symbol.for("_am_meta"), ys = Symbol.for("_am_trace"), ms = Symbol.for("_am_objectId"), ja = Symbol.for("_am_isProxy"), tg = Symbol.for("_am_clearCache"), Zw = Symbol.for("_am_uint"), qw = Symbol.for("_am_int"), ev = Symbol.for("_am_f64"), ng = Symbol.for("_am_counter"), Pu = Symbol.for("_am_text"), rg = Symbol.for("_am_rawString");
    var Zd;
    class yr {
        constructor(t){
            if (this[Zd] = !0, typeof t == "string") this.elems = [
                ...t
            ];
            else if (Array.isArray(t)) this.elems = t;
            else if (t === void 0) this.elems = [];
            else throw new TypeError(`Unsupported initial value for Text: ${t}`);
            Reflect.defineProperty(this, Pu, {
                value: !0
            });
        }
        get length() {
            return this.elems.length;
        }
        get(t) {
            return this.elems[t];
        }
        [(Zd = Pu, Symbol.iterator)]() {
            const t = this.elems;
            let n = -1;
            return {
                next () {
                    return n += 1, n < t.length ? {
                        done: !1,
                        value: t[n]
                    } : {
                        done: !0
                    };
                }
            };
        }
        toString() {
            if (!this.str) {
                this.str = "";
                for (const t of this.elems)typeof t == "string" ? this.str += t : this.str += "￼";
            }
            return this.str;
        }
        toSpans() {
            if (!this.spans) {
                this.spans = [];
                let t = "";
                for (const n of this.elems)typeof n == "string" ? t += n : (t.length > 0 && (this.spans.push(t), t = ""), this.spans.push(n));
                t.length > 0 && this.spans.push(t);
            }
            return this.spans;
        }
        toJSON() {
            return this.toString();
        }
        set(t, n) {
            if (this[Yn]) throw new RangeError("object cannot be modified outside of a change block");
            this.elems[t] = n;
        }
        insertAt(t, ...n) {
            if (this[Yn]) throw new RangeError("object cannot be modified outside of a change block");
            n.every((r)=>typeof r == "string") ? this.elems.splice(t, 0, ...n.join("")) : this.elems.splice(t, 0, ...n);
        }
        deleteAt(t, n = 1) {
            if (this[Yn]) throw new RangeError("object cannot be modified outside of a change block");
            this.elems.splice(t, n);
        }
        map(t) {
            this.elems.map(t);
        }
        lastIndexOf(t, n) {
            this.elems.lastIndexOf(t, n);
        }
        concat(t) {
            return new yr(this.elems.concat(t.elems));
        }
        every(t) {
            return this.elems.every(t);
        }
        filter(t) {
            return new yr(this.elems.filter(t));
        }
        find(t) {
            return this.elems.find(t);
        }
        findIndex(t) {
            return this.elems.findIndex(t);
        }
        forEach(t) {
            this.elems.forEach(t);
        }
        includes(t) {
            return this.elems.includes(t);
        }
        indexOf(t) {
            return this.elems.indexOf(t);
        }
        join(t) {
            return this.elems.join(t);
        }
        reduce(t) {
            this.elems.reduce(t);
        }
        reduceRight(t) {
            this.elems.reduceRight(t);
        }
        slice(t, n) {
            return new yr(this.elems.slice(t, n));
        }
        some(t) {
            return this.elems.some(t);
        }
        toLocaleString() {
            this.toString();
        }
    }
    class Du {
        constructor(t){
            this.value = t || 0, Reflect.defineProperty(this, ng, {
                value: !0
            });
        }
        valueOf() {
            return this.value;
        }
        toString() {
            return this.valueOf().toString();
        }
        toJSON() {
            return this.value;
        }
        increment(t) {
            throw new Error("Counters should not be incremented outside of a change callback");
        }
        decrement(t) {
            throw new Error("Counters should not be decremented outside of a change callback");
        }
    }
    class tv extends Du {
        constructor(t, n, r, s, o){
            super(t), this.context = n, this.path = r, this.objectId = s, this.key = o;
        }
        increment(t) {
            return t = typeof t == "number" ? t : 1, this.context.increment(this.objectId, this.key, t), this.value += t, this.value;
        }
        decrement(t) {
            return this.increment(typeof t == "number" ? -t : -1);
        }
    }
    function nv(e, t, n, r, s) {
        return new tv(e, t, n, r, s);
    }
    var sg;
    class og {
        constructor(t){
            this[sg] = !0, this.val = t;
        }
        toString() {
            return this.val;
        }
        toJSON() {
            return this.val;
        }
    }
    sg = rg;
    function ln(e) {
        if (typeof e == "string" && /^[0-9]+$/.test(e) && (e = parseInt(e, 10)), typeof e != "number") return e;
        if (e < 0 || isNaN(e) || e === 1 / 0 || e === -1 / 0) throw new RangeError("A list index must be positive, but you passed " + e);
        return e;
    }
    function wt(e, t) {
        const { context: n, objectId: r, path: s, textV2: o } = e, i = n.getWithType(r, t);
        if (i === null) return;
        const a = i[0], l = i[1];
        switch(a){
            case void 0:
                return;
            case "map":
                return Lo(n, l, o, [
                    ...s,
                    t
                ]);
            case "list":
                return Ra(n, l, o, [
                    ...s,
                    t
                ]);
            case "text":
                return o ? n.text(l) : mo(n, l, [
                    ...s,
                    t
                ]);
            case "str":
                return o ? new og(l) : l;
            case "uint":
                return l;
            case "int":
                return l;
            case "f64":
                return l;
            case "boolean":
                return l;
            case "null":
                return null;
            case "bytes":
                return l;
            case "timestamp":
                return l;
            case "counter":
                return nv(l, n, s, r, t);
            default:
                throw RangeError(`datatype ${a} unimplemented`);
        }
    }
    function na(e, t, n, r) {
        const s = typeof e;
        switch(s){
            case "object":
                if (e == null) return [
                    null,
                    "null"
                ];
                if (e[Zw]) return [
                    e.value,
                    "uint"
                ];
                if (e[qw]) return [
                    e.value,
                    "int"
                ];
                if (e[ev]) return [
                    e.value,
                    "f64"
                ];
                if (e[ng]) return [
                    e.value,
                    "counter"
                ];
                if (e instanceof Date) return [
                    e.getTime(),
                    "timestamp"
                ];
                if (ag(e)) return [
                    e.toString(),
                    "str"
                ];
                if (lg(e)) return [
                    e,
                    "text"
                ];
                if (e instanceof Uint8Array) return [
                    e,
                    "bytes"
                ];
                if (e instanceof Array) return [
                    e,
                    "list"
                ];
                if (Object.prototype.toString.call(e) === "[object Object]") return [
                    e,
                    "map"
                ];
                throw Ma(e, r) ? new RangeError("Cannot create a reference to an existing document object") : new RangeError(`Cannot assign unknown object: ${e}`);
            case "boolean":
                return [
                    e,
                    "boolean"
                ];
            case "number":
                return Number.isInteger(e) ? [
                    e,
                    "int"
                ] : [
                    e,
                    "f64"
                ];
            case "string":
                return t ? [
                    e,
                    "text"
                ] : [
                    e,
                    "str"
                ];
            case "undefined":
                throw new RangeError([
                    `Cannot assign undefined value at ${qd(n)}, `,
                    "because `undefined` is not a valid JSON data type. ",
                    "You might consider setting the property's value to `null`, ",
                    "or using `delete` to remove it altogether."
                ].join(""));
            default:
                throw new RangeError([
                    `Cannot assign ${s} value at ${qd(n)}. `,
                    "All JSON primitive datatypes (object, array, string, number, boolean, null) ",
                    `are supported in an Automerge document; ${s} values are not. `
                ].join(""));
        }
    }
    function Ma(e, t) {
        var n, r;
        return e instanceof Date ? !1 : !!(e && ((r = (n = e[Yn]) === null || n === void 0 ? void 0 : n.handle) === null || r === void 0 ? void 0 : r.__wbg_ptr) === t.__wbg_ptr);
    }
    const rv = {
        get (e, t) {
            const { context: n, objectId: r, cache: s } = e;
            return t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === ms ? r : t === ja ? !0 : t === ys ? e.trace : t === Yn ? {
                handle: n,
                textV2: e.textV2
            } : (s[t] || (s[t] = wt(e, t)), s[t]);
        },
        set (e, t, n) {
            const { context: r, objectId: s, path: o, textV2: i } = e;
            if (e.cache = {}, Ma(n, r)) throw new RangeError("Cannot create a reference to an existing document object");
            if (t === ys) return e.trace = n, !0;
            if (t === tg) return !0;
            const [a, l] = na(n, i, [
                ...o,
                t
            ], r);
            switch(l){
                case "list":
                    {
                        const f = r.putObject(s, t, []), c = Ra(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(let u = 0; u < a.length; u++)c[u] = a[u];
                        break;
                    }
                case "text":
                    {
                        if (i) ra(a), r.putObject(s, t, a);
                        else {
                            lf(a);
                            const f = r.putObject(s, t, "");
                            mo(r, f, [
                                ...o,
                                t
                            ]).splice(0, 0, ...a);
                        }
                        break;
                    }
                case "map":
                    {
                        const f = r.putObject(s, t, {}), c = Lo(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(const u in a)c[u] = a[u];
                        break;
                    }
                default:
                    r.put(s, t, a, l);
            }
            return !0;
        },
        deleteProperty (e, t) {
            const { context: n, objectId: r } = e;
            return e.cache = {}, n.delete(r, t), !0;
        },
        has (e, t) {
            return this.get(e, t) !== void 0;
        },
        getOwnPropertyDescriptor (e, t) {
            const n = this.get(e, t);
            if (typeof n < "u") return {
                configurable: !0,
                enumerable: !0,
                value: n
            };
        },
        ownKeys (e) {
            const { context: t, objectId: n } = e, r = t.keys(n);
            return [
                ...new Set(r)
            ];
        }
    }, ig = {
        get (e, t) {
            const { context: n, objectId: r } = e;
            return t = ln(t), t === Symbol.hasInstance ? (s)=>Array.isArray(s) : t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === ms ? r : t === ja ? !0 : t === ys ? e.trace : t === Yn ? {
                handle: n
            } : t === "length" ? n.length(r) : typeof t == "number" ? wt(e, t) : af(e)[t];
        },
        set (e, t, n) {
            const { context: r, objectId: s, path: o, textV2: i } = e;
            if (t = ln(t), Ma(n, r)) throw new RangeError("Cannot create a reference to an existing document object");
            if (t === tg) return !0;
            if (t === ys) return e.trace = n, !0;
            if (typeof t == "string") throw new RangeError("list index must be a number");
            const [a, l] = na(n, i, [
                ...o,
                t
            ], r);
            switch(l){
                case "list":
                    {
                        let f;
                        t >= r.length(s) ? f = r.insertObject(s, t, []) : f = r.putObject(s, t, []), Ra(r, f, i, [
                            ...o,
                            t
                        ]).splice(0, 0, ...a);
                        break;
                    }
                case "text":
                    {
                        if (i) ra(a), t >= r.length(s) ? r.insertObject(s, t, a) : r.putObject(s, t, a);
                        else {
                            let f;
                            lf(a), t >= r.length(s) ? f = r.insertObject(s, t, "") : f = r.putObject(s, t, ""), mo(r, f, [
                                ...o,
                                t
                            ]).splice(0, 0, ...a);
                        }
                        break;
                    }
                case "map":
                    {
                        let f;
                        t >= r.length(s) ? f = r.insertObject(s, t, {}) : f = r.putObject(s, t, {});
                        const c = Lo(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(const u in a)c[u] = a[u];
                        break;
                    }
                default:
                    t >= r.length(s) ? r.insert(s, t, a, l) : r.put(s, t, a, l);
            }
            return !0;
        },
        deleteProperty (e, t) {
            const { context: n, objectId: r } = e;
            t = ln(t);
            const s = n.get(r, t);
            if (s != null && s[0] == "counter") throw new TypeError("Unsupported operation: deleting a counter from a list");
            return n.delete(r, t), !0;
        },
        has (e, t) {
            const { context: n, objectId: r } = e;
            return t = ln(t), typeof t == "number" ? t < n.length(r) : t === "length";
        },
        getOwnPropertyDescriptor (e, t) {
            const { context: n, objectId: r } = e;
            return t === "length" ? {
                writable: !0,
                value: n.length(r)
            } : t === ms ? {
                configurable: !1,
                enumerable: !1,
                value: r
            } : (t = ln(t), {
                configurable: !0,
                enumerable: !0,
                value: wt(e, t)
            });
        },
        getPrototypeOf (e) {
            return Object.getPrototypeOf(e);
        },
        ownKeys () {
            const e = [];
            return e.push("length"), e;
        }
    }, sv = Object.assign({}, ig, {
        get (e, t) {
            const { context: n, objectId: r } = e;
            return t = ln(t), t === Symbol.hasInstance ? (s)=>Array.isArray(s) : t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === ms ? r : t === ja ? !0 : t === ys ? e.trace : t === Yn ? {
                handle: n
            } : t === "length" ? n.length(r) : typeof t == "number" ? wt(e, t) : iv(e)[t] || af(e)[t];
        },
        getPrototypeOf () {
            return Object.getPrototypeOf(new yr);
        }
    });
    function Lo(e, t, n, r) {
        const s = {
            context: e,
            objectId: t,
            path: r || [],
            cache: {},
            textV2: n
        }, o = {};
        return Object.assign(o, s), new Proxy(o, rv);
    }
    function Ra(e, t, n, r) {
        const s = {
            context: e,
            objectId: t,
            path: r || [],
            cache: {},
            textV2: n
        }, o = [];
        return Object.assign(o, s), new Proxy(o, ig);
    }
    function mo(e, t, n) {
        const r = {
            context: e,
            objectId: t,
            path: n || [],
            cache: {},
            textV2: !1
        }, s = {};
        return Object.assign(s, r), new Proxy(s, sv);
    }
    function ov(e, t) {
        return Lo(e, "_root", t, []);
    }
    function af(e) {
        const { context: t, objectId: n, path: r, textV2: s } = e;
        return {
            at (i) {
                return wt(e, i);
            },
            deleteAt (i, a) {
                return typeof a == "number" ? t.splice(n, i, a) : t.delete(n, i), this;
            },
            fill (i, a, l) {
                const [f, c] = na(i, s, [
                    ...r,
                    a
                ], t), u = t.length(n);
                a = ln(a || 0), l = ln(l || u);
                for(let h = a; h < Math.min(l, u); h++)if (c === "list" || c === "map") t.putObject(n, h, f);
                else if (c === "text") if (s) ra(f), t.putObject(n, h, f);
                else {
                    lf(f);
                    const d = t.putObject(n, h, ""), p = mo(t, d, [
                        ...r,
                        h
                    ]);
                    for(let m = 0; m < f.length; m++)p[m] = f.get(m);
                }
                else t.put(n, h, f, c);
                return this;
            },
            indexOf (i, a = 0) {
                const l = t.length(n);
                for(let f = a; f < l; f++){
                    const c = t.getWithType(n, f);
                    if (c && (c[1] === i[ms] || c[1] === i)) return f;
                }
                return -1;
            },
            insertAt (i, ...a) {
                return this.splice(i, 0, ...a), this;
            },
            pop () {
                const i = t.length(n);
                if (i == 0) return;
                const a = wt(e, i - 1);
                return t.delete(n, i - 1), a;
            },
            push (...i) {
                const a = t.length(n);
                return this.splice(a, 0, ...i), t.length(n);
            },
            shift () {
                if (t.length(n) == 0) return;
                const i = wt(e, 0);
                return t.delete(n, 0), i;
            },
            splice (i, a, ...l) {
                i = ln(i), typeof a != "number" && (a = t.length(n) - i), a = ln(a);
                for (const u of l)if (Ma(u, t)) throw new RangeError("Cannot create a reference to an existing document object");
                const f = [];
                for(let u = 0; u < a; u++){
                    const h = wt(e, i);
                    h !== void 0 && f.push(h), t.delete(n, i);
                }
                const c = l.map((u, h)=>{
                    try {
                        return na(u, s, [
                            ...r
                        ], t);
                    } catch (d) {
                        throw d instanceof RangeError ? new RangeError(`${d.message} (at index ${h} in the input)`) : d;
                    }
                });
                for (const [u, h] of c){
                    switch(h){
                        case "list":
                            {
                                const d = t.insertObject(n, i, []);
                                Ra(t, d, s, [
                                    ...r,
                                    i
                                ]).splice(0, 0, ...u);
                                break;
                            }
                        case "text":
                            {
                                if (s) ra(u), t.insertObject(n, i, u);
                                else {
                                    const d = t.insertObject(n, i, "");
                                    mo(t, d, [
                                        ...r,
                                        i
                                    ]).splice(0, 0, ...u);
                                }
                                break;
                            }
                        case "map":
                            {
                                const d = t.insertObject(n, i, {}), p = Lo(t, d, s, [
                                    ...r,
                                    i
                                ]);
                                for(const m in u)p[m] = u[m];
                                break;
                            }
                        default:
                            t.insert(n, i, u, h);
                    }
                    i += 1;
                }
                return f;
            },
            unshift (...i) {
                return this.splice(0, 0, ...i), t.length(n);
            },
            entries () {
                let i = 0;
                return {
                    next: ()=>{
                        const l = wt(e, i);
                        return l === void 0 ? {
                            value: void 0,
                            done: !0
                        } : {
                            value: [
                                i++,
                                l
                            ],
                            done: !1
                        };
                    },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            keys () {
                let i = 0;
                const a = t.length(n);
                return {
                    next: ()=>i < a ? {
                            value: i++,
                            done: !1
                        } : {
                            value: void 0,
                            done: !0
                        },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            values () {
                let i = 0;
                return {
                    next: ()=>{
                        const l = wt(e, i++);
                        return l === void 0 ? {
                            value: void 0,
                            done: !0
                        } : {
                            value: l,
                            done: !1
                        };
                    },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            toArray () {
                const i = [];
                let a;
                do a = wt(e, i.length), a !== void 0 && i.push(a);
                while (a !== void 0);
                return i;
            },
            map (i) {
                return this.toArray().map(i);
            },
            toString () {
                return this.toArray().toString();
            },
            toLocaleString () {
                return this.toArray().toLocaleString();
            },
            forEach (i) {
                return this.toArray().forEach(i);
            },
            concat (i) {
                return this.toArray().concat(i);
            },
            every (i) {
                return this.toArray().every(i);
            },
            filter (i) {
                return this.toArray().filter(i);
            },
            find (i) {
                let a = 0;
                for (const l of this){
                    if (i(l, a)) return l;
                    a += 1;
                }
            },
            findIndex (i) {
                let a = 0;
                for (const l of this){
                    if (i(l, a)) return a;
                    a += 1;
                }
                return -1;
            },
            includes (i) {
                return this.find((a)=>a === i) !== void 0;
            },
            join (i) {
                return this.toArray().join(i);
            },
            reduce (i, a) {
                return this.toArray().reduce(i, a);
            },
            reduceRight (i, a) {
                return this.toArray().reduceRight(i, a);
            },
            lastIndexOf (i, a = 1 / 0) {
                return this.toArray().lastIndexOf(i, a);
            },
            slice (i, a) {
                return this.toArray().slice(i, a);
            },
            some (i) {
                let a = 0;
                for (const l of this){
                    if (i(l, a)) return !0;
                    a += 1;
                }
                return !1;
            },
            [Symbol.iterator]: function*() {
                let i = 0, a = wt(e, i);
                for(; a !== void 0;)yield a, i += 1, a = wt(e, i);
            }
        };
    }
    function iv(e) {
        const { context: t, objectId: n } = e;
        return {
            set (s, o) {
                return this[s] = o;
            },
            get (s) {
                return this[s];
            },
            toString () {
                return t.text(n).replace(/￼/g, "");
            },
            toSpans () {
                const s = [];
                let o = "";
                const i = t.length(n);
                for(let a = 0; a < i; a++){
                    const l = this[a];
                    typeof l == "string" ? o += l : (o.length > 0 && (s.push(o), o = ""), s.push(l));
                }
                return o.length > 0 && s.push(o), s;
            },
            toJSON () {
                return this.toString();
            },
            indexOf (s, o = 0) {
                return t.text(n).indexOf(s, o);
            },
            insertAt (s, ...o) {
                o.every((i)=>typeof i == "string") ? t.splice(n, s, 0, o.join("")) : af(e).insertAt(s, ...o);
            }
        };
    }
    function lf(e) {
        if (!lg(e)) throw new Error("value was not a Text instance");
    }
    function ra(e) {
        if (typeof e != "string") throw new Error("value was not a string");
    }
    function qd(e) {
        const t = e.map((n)=>{
            if (typeof n == "number") return n.toString();
            if (typeof n == "string") return n.replace(/~/g, "~0").replace(/\//g, "~1");
        });
        return e.length === 0 ? "" : "/" + t.join("/");
    }
    function ag(e) {
        return typeof e == "object" && e !== null && Object.prototype.hasOwnProperty.call(e, rg);
    }
    function lg(e) {
        return typeof e == "object" && e !== null && Object.prototype.hasOwnProperty.call(e, Pu);
    }
    let oi;
    const av = new Uint8Array(16);
    function lv() {
        if (!oi && (oi = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !oi)) throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
        return oi(av);
    }
    const uv = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    function Pa(e) {
        return typeof e == "string" && uv.test(e);
    }
    const Ve = [];
    for(let e = 0; e < 256; ++e)Ve.push((e + 256).toString(16).slice(1));
    function ug(e, t = 0) {
        return Ve[e[t + 0]] + Ve[e[t + 1]] + Ve[e[t + 2]] + Ve[e[t + 3]] + "-" + Ve[e[t + 4]] + Ve[e[t + 5]] + "-" + Ve[e[t + 6]] + Ve[e[t + 7]] + "-" + Ve[e[t + 8]] + Ve[e[t + 9]] + "-" + Ve[e[t + 10]] + Ve[e[t + 11]] + Ve[e[t + 12]] + Ve[e[t + 13]] + Ve[e[t + 14]] + Ve[e[t + 15]];
    }
    function cv(e, t = 0) {
        const n = ug(e, t);
        if (!Pa(n)) throw TypeError("Stringified UUID is invalid");
        return n;
    }
    function fv(e) {
        if (!Pa(e)) throw TypeError("Invalid UUID");
        let t;
        const n = new Uint8Array(16);
        return n[0] = (t = parseInt(e.slice(0, 8), 16)) >>> 24, n[1] = t >>> 16 & 255, n[2] = t >>> 8 & 255, n[3] = t & 255, n[4] = (t = parseInt(e.slice(9, 13), 16)) >>> 8, n[5] = t & 255, n[6] = (t = parseInt(e.slice(14, 18), 16)) >>> 8, n[7] = t & 255, n[8] = (t = parseInt(e.slice(19, 23), 16)) >>> 8, n[9] = t & 255, n[10] = (t = parseInt(e.slice(24, 36), 16)) / 1099511627776 & 255, n[11] = t / 4294967296 & 255, n[12] = t >>> 24 & 255, n[13] = t >>> 16 & 255, n[14] = t >>> 8 & 255, n[15] = t & 255, n;
    }
    const dv = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), eh = {
        randomUUID: dv
    };
    function cg(e, t, n) {
        if (eh.randomUUID && !t && !e) return eh.randomUUID();
        e = e || {};
        const r = e.random || (e.rng || lv)();
        if (r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, t) {
            n = n || 0;
            for(let s = 0; s < 16; ++s)t[n + s] = r[s];
            return t;
        }
        return ug(r);
    }
    let fg;
    const dg = new Array(128).fill(void 0);
    dg.push(void 0, null, !0, !1);
    const bl = typeof TextEncoder < "u" ? new TextEncoder("utf-8") : {
        encode: ()=>{
            throw Error("TextEncoder not available");
        }
    };
    bl.encodeInto;
    dg.length;
    const hv = typeof TextDecoder < "u" ? new TextDecoder("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    }) : {
        decode: ()=>{
            throw Error("TextDecoder not available");
        }
    };
    typeof TextDecoder < "u" && hv.decode();
    typeof FinalizationRegistry > "u" || new FinalizationRegistry((e)=>fg.__wbg_automerge_free(e >>> 0, 1));
    typeof FinalizationRegistry > "u" || new FinalizationRegistry((e)=>fg.__wbg_syncstate_free(e >>> 0, 1));
    let pv = [];
    function gv(e) {
        for(const t in e)yt[t] = e[t];
        for (const t of pv)t();
    }
    const yt = {
        create (e) {
            throw new RangeError("Automerge.use() not called");
        },
        load (e, t) {
            throw new RangeError("Automerge.use() not called (load)");
        },
        encodeChange (e) {
            throw new RangeError("Automerge.use() not called (encodeChange)");
        },
        decodeChange (e) {
            throw new RangeError("Automerge.use() not called (decodeChange)");
        },
        initSyncState () {
            throw new RangeError("Automerge.use() not called (initSyncState)");
        },
        encodeSyncMessage (e) {
            throw new RangeError("Automerge.use() not called (encodeSyncMessage)");
        },
        decodeSyncMessage (e) {
            throw new RangeError("Automerge.use() not called (decodeSyncMessage)");
        },
        encodeSyncState (e) {
            throw new RangeError("Automerge.use() not called (encodeSyncState)");
        },
        decodeSyncState (e) {
            throw new RangeError("Automerge.use() not called (decodeSyncState)");
        },
        exportSyncState (e) {
            throw new RangeError("Automerge.use() not called (exportSyncState)");
        },
        importSyncState (e) {
            throw new RangeError("Automerge.use() not called (importSyncState)");
        }
    };
    function ot(e, t = !0) {
        if (typeof e != "object") throw new RangeError("must be the document root");
        const n = Reflect.get(e, Yn);
        if (n === void 0 || n == null || t && yv(e) !== "_root") throw new RangeError("must be the document root");
        return n;
    }
    function hg(e) {
        return Reflect.get(e, ys);
    }
    function yv(e) {
        return typeof e != "object" || e === null ? null : Reflect.get(e, ms);
    }
    function Da(e) {
        return !!Reflect.get(e, ja);
    }
    var mv = globalThis && globalThis.__rest || function(e, t) {
        var n = {};
        for(var r in e)Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
        if (e != null && typeof Object.getOwnPropertySymbols == "function") for(var s = 0, r = Object.getOwnPropertySymbols(e); s < r.length; s++)t.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[s]) && (n[r[s]] = e[r[s]]);
        return n;
    };
    function uf(e) {
        return typeof e == "object" ? e : {
            actor: e
        };
    }
    function cf(e) {
        const t = uf(e), n = !!t.freeze, r = t.patchCallback, s = !t.enableTextV2, o = t.actor, i = yt.create({
            actor: o,
            text_v1: s
        });
        i.enableFreeze(!!t.freeze);
        const a = t.enableTextV2 || !1;
        return _g(i, a), i.materialize("/", void 0, {
            handle: i,
            heads: void 0,
            freeze: n,
            patchCallback: r,
            textV2: a
        });
    }
    function _v(e, t) {
        const n = ot(e), r = n.heads, s = uf(t), o = n.handle.fork(s.actor, r);
        o.updateDiffCursor();
        const i = mv(n, [
            "heads"
        ]);
        return i.patchCallback = s.patchCallback, o.applyPatches(e, Object.assign(Object.assign({}, i), {
            handle: o
        }));
    }
    function wv(e, t) {
        return _o(cf(t), "from", {}, (n)=>Object.assign(n, e)).newDoc;
    }
    function vv(e, t, n) {
        if (typeof t == "function") return _o(e, "change", {}, t).newDoc;
        if (typeof n == "function") return typeof t == "string" && (t = {
            message: t
        }), _o(e, "change", t, n).newDoc;
        throw RangeError("Invalid args for change");
    }
    function bv(e, t, n, r) {
        if (typeof n == "function") return _o(e, "changeAt", {}, n, t);
        if (typeof r == "function") return typeof n == "string" && (n = {
            message: n
        }), _o(e, "changeAt", n, r, t);
        throw RangeError("Invalid args for changeAt");
    }
    function Uo(e, t, n, r) {
        if (n == null) return e;
        const s = ot(e), o = Object.assign(Object.assign({}, s), {
            heads: void 0
        }), { value: i, patches: a } = s.handle.applyAndReturnPatches(e, o);
        if (a.length > 0) {
            r?.(a, {
                before: e,
                after: i,
                source: t
            });
            const l = ot(i);
            l.mostRecentPatch = {
                before: ot(e).heads,
                after: l.handle.getHeads(),
                patches: a
            };
        }
        return s.heads = n, i;
    }
    function _o(e, t, n, r, s) {
        if (typeof r != "function") throw new RangeError("invalid change function");
        const o = ot(e);
        if (e === void 0 || o === void 0) throw new RangeError("must be the document root");
        if (o.heads) throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
        if (Da(e)) throw new RangeError("Calls to Automerge.change cannot be nested");
        let i = o.handle.getHeads();
        s && Ev(s, i) && (s = void 0), s && (o.handle.isolate(s), i = s), "time" in n || (n.time = Math.floor(Date.now() / 1e3));
        try {
            o.heads = i;
            const a = ov(o.handle, o.textV2);
            if (r(a), o.handle.pendingOps() === 0) return o.heads = void 0, s && o.handle.integrate(), {
                newDoc: e,
                newHeads: null
            };
            {
                const l = o.handle.commit(n.message, n.time);
                return o.handle.integrate(), {
                    newDoc: Uo(e, t, i, n.patchCallback || o.patchCallback),
                    newHeads: l != null ? [
                        l
                    ] : null
                };
            }
        } catch (a) {
            throw o.heads = void 0, o.handle.rollback(), a;
        }
    }
    function xv(e, t) {
        t === void 0 && (t = {}), typeof t == "string" && (t = {
            message: t
        }), "time" in t || (t.time = Math.floor(Date.now() / 1e3));
        const n = ot(e);
        if (n.heads) throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
        if (Da(e)) throw new RangeError("Calls to Automerge.change cannot be nested");
        const r = n.handle.getHeads();
        return n.handle.emptyChange(t.message, t.time), Uo(e, "emptyChange", r);
    }
    function Sv(e, t) {
        const n = uf(t), r = n.actor, s = n.patchCallback, o = !n.enableTextV2, i = n.unchecked || !1, a = n.allowMissingChanges || !1, l = n.convertRawStringsToText || !1, f = yt.load(e, {
            text_v1: o,
            actor: r,
            unchecked: i,
            allowMissingDeps: a,
            convertRawStringsToText: l
        });
        f.enableFreeze(!!n.freeze);
        const c = n.enableTextV2 || !1;
        return _g(f, c), f.materialize("/", void 0, {
            handle: f,
            heads: void 0,
            patchCallback: s,
            textV2: c
        });
    }
    function pg(e, t, n) {
        n || (n = {});
        const r = ot(e);
        if (r.heads) throw new RangeError("Attempting to change an out of date document - set at: " + hg(e));
        if (Da(e)) throw new RangeError("Calls to Automerge.change cannot be nested");
        const s = r.handle.getHeads();
        return r.handle.loadIncremental(t), Uo(e, "loadIncremental", s, n.patchCallback || r.patchCallback);
    }
    function gg(e) {
        return ot(e).handle.save();
    }
    function kv(e, t) {
        const n = ot(e);
        if (n.heads) throw new RangeError("Attempting to change an out of date document - set at: " + hg(e));
        const r = n.handle.getHeads(), s = ot(t), o = n.handle.getChangesAdded(s.handle);
        return n.handle.applyChanges(o), Uo(e, "merge", r, n.patchCallback);
    }
    function Cv(e, t, n) {
        th(t, "before"), th(n, "after");
        const r = ot(e);
        return r.mostRecentPatch && Lu(r.mostRecentPatch.before, t) && Lu(r.mostRecentPatch.after, n) ? r.mostRecentPatch.patches : r.handle.diff(t, n);
    }
    function Ev(e, t) {
        if (e.length !== t.length) return !1;
        for(let n = 0; n < e.length; n++)if (e[n] !== t[n]) return !1;
        return !0;
    }
    function th(e, t) {
        if (!Array.isArray(e)) throw new Error(`${t} must be an array`);
    }
    function Lu(e, t) {
        if (!nh(e) || !nh(t)) return e === t;
        const n = Object.keys(e).sort(), r = Object.keys(t).sort();
        if (n.length !== r.length) return !1;
        for(let s = 0; s < n.length; s++)if (n[s] !== r[s] || !Lu(e[n[s]], t[r[s]])) return !1;
        return !0;
    }
    function yg(e) {
        const t = yt.importSyncState(e), n = yt.encodeSyncState(t);
        return t.free(), n;
    }
    function mg(e) {
        const t = yt.decodeSyncState(e), n = yt.exportSyncState(t);
        return t.free(), n;
    }
    function Iv(e, t) {
        const n = ot(e), r = yt.importSyncState(t), s = n.handle.generateSyncMessage(r);
        return [
            yt.exportSyncState(r),
            s
        ];
    }
    function Av(e, t, n, r) {
        const s = yt.importSyncState(t);
        r || (r = {});
        const o = ot(e);
        if (o.heads) throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
        if (Da(e)) throw new RangeError("Calls to Automerge.change cannot be nested");
        const i = o.handle.getHeads();
        o.handle.receiveSyncMessage(s, n);
        const a = yt.exportSyncState(s);
        return [
            Uo(e, "receiveSyncMessage", i, r.patchCallback || o.patchCallback),
            a,
            null
        ];
    }
    function Ov() {
        return yt.exportSyncState(yt.initSyncState());
    }
    function Tv(e) {
        return yt.decodeSyncMessage(e);
    }
    function Kt(e) {
        const t = ot(e);
        return t.heads || t.handle.getHeads();
    }
    function nh(e) {
        return typeof e == "object" && e !== null;
    }
    function jv(e, t) {
        return ot(e).handle.saveSince(t);
    }
    function _g(e, t) {
        e.registerDatatype("counter", (n)=>new Du(n), (n)=>{
            if (n instanceof Du) return n.value;
        }), t ? e.registerDatatype("str", (n)=>new og(n), (n)=>{
            if (ag(n)) return n.val;
        }) : e.registerDatatype("text", (n)=>new yr(n), (n)=>{
            if (n instanceof yr) return n.join("");
        });
    }
    function La(e) {
        const t = Ua(e);
        return t.enableTextV2 = !0, cf(t);
    }
    function rh(e, t) {
        const n = Ua(t);
        return n.enableTextV2 = !0, _v(e, n);
    }
    function Mv(e, t) {
        const n = Ua(t);
        return n.enableTextV2 = !0, wv(e, n);
    }
    function Rv(e, t) {
        const n = Ua(t);
        return n.enableTextV2 = !0, n.patchCallback ? pg(cf(n), e) : Sv(e, n);
    }
    function Ua(e) {
        return typeof e == "object" ? e : {
            actor: e
        };
    }
    var Uu = {
        exports: {}
    }, xl, sh;
    function Pv() {
        if (sh) return xl;
        sh = 1;
        var e = 1e3, t = e * 60, n = t * 60, r = n * 24, s = r * 7, o = r * 365.25;
        xl = function(c, u) {
            u = u || {};
            var h = typeof c;
            if (h === "string" && c.length > 0) return i(c);
            if (h === "number" && isFinite(c)) return u.long ? l(c) : a(c);
            throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(c));
        };
        function i(c) {
            if (c = String(c), !(c.length > 100)) {
                var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(c);
                if (u) {
                    var h = parseFloat(u[1]), d = (u[2] || "ms").toLowerCase();
                    switch(d){
                        case "years":
                        case "year":
                        case "yrs":
                        case "yr":
                        case "y":
                            return h * o;
                        case "weeks":
                        case "week":
                        case "w":
                            return h * s;
                        case "days":
                        case "day":
                        case "d":
                            return h * r;
                        case "hours":
                        case "hour":
                        case "hrs":
                        case "hr":
                        case "h":
                            return h * n;
                        case "minutes":
                        case "minute":
                        case "mins":
                        case "min":
                        case "m":
                            return h * t;
                        case "seconds":
                        case "second":
                        case "secs":
                        case "sec":
                        case "s":
                            return h * e;
                        case "milliseconds":
                        case "millisecond":
                        case "msecs":
                        case "msec":
                        case "ms":
                            return h;
                        default:
                            return;
                    }
                }
            }
        }
        function a(c) {
            var u = Math.abs(c);
            return u >= r ? Math.round(c / r) + "d" : u >= n ? Math.round(c / n) + "h" : u >= t ? Math.round(c / t) + "m" : u >= e ? Math.round(c / e) + "s" : c + "ms";
        }
        function l(c) {
            var u = Math.abs(c);
            return u >= r ? f(c, u, r, "day") : u >= n ? f(c, u, n, "hour") : u >= t ? f(c, u, t, "minute") : u >= e ? f(c, u, e, "second") : c + " ms";
        }
        function f(c, u, h, d) {
            var p = u >= h * 1.5;
            return Math.round(c / h) + " " + d + (p ? "s" : "");
        }
        return xl;
    }
    function Dv(e) {
        n.debug = n, n.default = n, n.coerce = l, n.disable = i, n.enable = s, n.enabled = a, n.humanize = Pv(), n.destroy = f, Object.keys(e).forEach((c)=>{
            n[c] = e[c];
        }), n.names = [], n.skips = [], n.formatters = {};
        function t(c) {
            let u = 0;
            for(let h = 0; h < c.length; h++)u = (u << 5) - u + c.charCodeAt(h), u |= 0;
            return n.colors[Math.abs(u) % n.colors.length];
        }
        n.selectColor = t;
        function n(c) {
            let u, h = null, d, p;
            function m(...x) {
                if (!m.enabled) return;
                const w = m, _ = Number(new Date), g = _ - (u || _);
                w.diff = g, w.prev = u, w.curr = _, u = _, x[0] = n.coerce(x[0]), typeof x[0] != "string" && x.unshift("%O");
                let A = 0;
                x[0] = x[0].replace(/%([a-zA-Z%])/g, (j, N)=>{
                    if (j === "%%") return "%";
                    A++;
                    const F = n.formatters[N];
                    if (typeof F == "function") {
                        const J = x[A];
                        j = F.call(w, J), x.splice(A, 1), A--;
                    }
                    return j;
                }), n.formatArgs.call(w, x), (w.log || n.log).apply(w, x);
            }
            return m.namespace = c, m.useColors = n.useColors(), m.color = n.selectColor(c), m.extend = r, m.destroy = n.destroy, Object.defineProperty(m, "enabled", {
                enumerable: !0,
                configurable: !1,
                get: ()=>h !== null ? h : (d !== n.namespaces && (d = n.namespaces, p = n.enabled(c)), p),
                set: (x)=>{
                    h = x;
                }
            }), typeof n.init == "function" && n.init(m), m;
        }
        function r(c, u) {
            const h = n(this.namespace + (typeof u > "u" ? ":" : u) + c);
            return h.log = this.log, h;
        }
        function s(c) {
            n.save(c), n.namespaces = c, n.names = [], n.skips = [];
            const u = (typeof c == "string" ? c : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
            for (const h of u)h[0] === "-" ? n.skips.push(h.slice(1)) : n.names.push(h);
        }
        function o(c, u) {
            let h = 0, d = 0, p = -1, m = 0;
            for(; h < c.length;)if (d < u.length && (u[d] === c[h] || u[d] === "*")) u[d] === "*" ? (p = d, m = h, d++) : (h++, d++);
            else if (p !== -1) d = p + 1, m++, h = m;
            else return !1;
            for(; d < u.length && u[d] === "*";)d++;
            return d === u.length;
        }
        function i() {
            const c = [
                ...n.names,
                ...n.skips.map((u)=>"-" + u)
            ].join(",");
            return n.enable(""), c;
        }
        function a(c) {
            for (const u of n.skips)if (o(c, u)) return !1;
            for (const u of n.names)if (o(c, u)) return !0;
            return !1;
        }
        function l(c) {
            return c instanceof Error ? c.stack || c.message : c;
        }
        function f() {
            console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
        return n.enable(n.load()), n;
    }
    var Lv = Dv;
    (function(e, t) {
        t.formatArgs = r, t.save = s, t.load = o, t.useColors = n, t.storage = i(), t.destroy = (()=>{
            let l = !1;
            return ()=>{
                l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
            };
        })(), t.colors = [
            "#0000CC",
            "#0000FF",
            "#0033CC",
            "#0033FF",
            "#0066CC",
            "#0066FF",
            "#0099CC",
            "#0099FF",
            "#00CC00",
            "#00CC33",
            "#00CC66",
            "#00CC99",
            "#00CCCC",
            "#00CCFF",
            "#3300CC",
            "#3300FF",
            "#3333CC",
            "#3333FF",
            "#3366CC",
            "#3366FF",
            "#3399CC",
            "#3399FF",
            "#33CC00",
            "#33CC33",
            "#33CC66",
            "#33CC99",
            "#33CCCC",
            "#33CCFF",
            "#6600CC",
            "#6600FF",
            "#6633CC",
            "#6633FF",
            "#66CC00",
            "#66CC33",
            "#9900CC",
            "#9900FF",
            "#9933CC",
            "#9933FF",
            "#99CC00",
            "#99CC33",
            "#CC0000",
            "#CC0033",
            "#CC0066",
            "#CC0099",
            "#CC00CC",
            "#CC00FF",
            "#CC3300",
            "#CC3333",
            "#CC3366",
            "#CC3399",
            "#CC33CC",
            "#CC33FF",
            "#CC6600",
            "#CC6633",
            "#CC9900",
            "#CC9933",
            "#CCCC00",
            "#CCCC33",
            "#FF0000",
            "#FF0033",
            "#FF0066",
            "#FF0099",
            "#FF00CC",
            "#FF00FF",
            "#FF3300",
            "#FF3333",
            "#FF3366",
            "#FF3399",
            "#FF33CC",
            "#FF33FF",
            "#FF6600",
            "#FF6633",
            "#FF9900",
            "#FF9933",
            "#FFCC00",
            "#FFCC33"
        ];
        function n() {
            if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return !0;
            if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return !1;
            let l;
            return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
        }
        function r(l) {
            if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors) return;
            const f = "color: " + this.color;
            l.splice(1, 0, f, "color: inherit");
            let c = 0, u = 0;
            l[0].replace(/%[a-zA-Z%]/g, (h)=>{
                h !== "%%" && (c++, h === "%c" && (u = c));
            }), l.splice(u, 0, f);
        }
        t.log = console.debug || console.log || (()=>{});
        function s(l) {
            try {
                l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
            } catch  {}
        }
        function o() {
            let l;
            try {
                l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
            } catch  {}
            return !l && typeof process < "u" && "env" in process && (l = {}.DEBUG), l;
        }
        function i() {
            try {
                return localStorage;
            } catch  {}
        }
        e.exports = Lv(t);
        const { formatters: a } = e.exports;
        a.j = function(l) {
            try {
                return JSON.stringify(l);
            } catch (f) {
                return "[UnexpectedJSONParseError]: " + f.message;
            }
        };
    })(Uu, Uu.exports);
    var Uv = Uu.exports;
    const jr = fc(Uv);
    var wg = {
        exports: {}
    };
    (function(e) {
        var t = Object.prototype.hasOwnProperty, n = "~";
        function r() {}
        Object.create && (r.prototype = Object.create(null), new r().__proto__ || (n = !1));
        function s(l, f, c) {
            this.fn = l, this.context = f, this.once = c || !1;
        }
        function o(l, f, c, u, h) {
            if (typeof c != "function") throw new TypeError("The listener must be a function");
            var d = new s(c, u || l, h), p = n ? n + f : f;
            return l._events[p] ? l._events[p].fn ? l._events[p] = [
                l._events[p],
                d
            ] : l._events[p].push(d) : (l._events[p] = d, l._eventsCount++), l;
        }
        function i(l, f) {
            --l._eventsCount === 0 ? l._events = new r : delete l._events[f];
        }
        function a() {
            this._events = new r, this._eventsCount = 0;
        }
        a.prototype.eventNames = function() {
            var f = [], c, u;
            if (this._eventsCount === 0) return f;
            for(u in c = this._events)t.call(c, u) && f.push(n ? u.slice(1) : u);
            return Object.getOwnPropertySymbols ? f.concat(Object.getOwnPropertySymbols(c)) : f;
        }, a.prototype.listeners = function(f) {
            var c = n ? n + f : f, u = this._events[c];
            if (!u) return [];
            if (u.fn) return [
                u.fn
            ];
            for(var h = 0, d = u.length, p = new Array(d); h < d; h++)p[h] = u[h].fn;
            return p;
        }, a.prototype.listenerCount = function(f) {
            var c = n ? n + f : f, u = this._events[c];
            return u ? u.fn ? 1 : u.length : 0;
        }, a.prototype.emit = function(f, c, u, h, d, p) {
            var m = n ? n + f : f;
            if (!this._events[m]) return !1;
            var x = this._events[m], w = arguments.length, _, g;
            if (x.fn) {
                switch(x.once && this.removeListener(f, x.fn, void 0, !0), w){
                    case 1:
                        return x.fn.call(x.context), !0;
                    case 2:
                        return x.fn.call(x.context, c), !0;
                    case 3:
                        return x.fn.call(x.context, c, u), !0;
                    case 4:
                        return x.fn.call(x.context, c, u, h), !0;
                    case 5:
                        return x.fn.call(x.context, c, u, h, d), !0;
                    case 6:
                        return x.fn.call(x.context, c, u, h, d, p), !0;
                }
                for(g = 1, _ = new Array(w - 1); g < w; g++)_[g - 1] = arguments[g];
                x.fn.apply(x.context, _);
            } else {
                var A = x.length, P;
                for(g = 0; g < A; g++)switch(x[g].once && this.removeListener(f, x[g].fn, void 0, !0), w){
                    case 1:
                        x[g].fn.call(x[g].context);
                        break;
                    case 2:
                        x[g].fn.call(x[g].context, c);
                        break;
                    case 3:
                        x[g].fn.call(x[g].context, c, u);
                        break;
                    case 4:
                        x[g].fn.call(x[g].context, c, u, h);
                        break;
                    default:
                        if (!_) for(P = 1, _ = new Array(w - 1); P < w; P++)_[P - 1] = arguments[P];
                        x[g].fn.apply(x[g].context, _);
                }
            }
            return !0;
        }, a.prototype.on = function(f, c, u) {
            return o(this, f, c, u, !1);
        }, a.prototype.once = function(f, c, u) {
            return o(this, f, c, u, !0);
        }, a.prototype.removeListener = function(f, c, u, h) {
            var d = n ? n + f : f;
            if (!this._events[d]) return this;
            if (!c) return i(this, d), this;
            var p = this._events[d];
            if (p.fn) p.fn === c && (!h || p.once) && (!u || p.context === u) && i(this, d);
            else {
                for(var m = 0, x = [], w = p.length; m < w; m++)(p[m].fn !== c || h && !p[m].once || u && p[m].context !== u) && x.push(p[m]);
                x.length ? this._events[d] = x.length === 1 ? x[0] : x : i(this, d);
            }
            return this;
        }, a.prototype.removeAllListeners = function(f) {
            var c;
            return f ? (c = n ? n + f : f, this._events[c] && i(this, c)) : (this._events = new r, this._eventsCount = 0), this;
        }, a.prototype.off = a.prototype.removeListener, a.prototype.addListener = a.prototype.on, a.prefixed = n, a.EventEmitter = a, e.exports = a;
    })(wg);
    var Fv = wg.exports;
    const ks = fc(Fv);
    function zv() {
        if (typeof globalThis < "u") return globalThis;
        if (typeof self < "u") return self;
        if (typeof window < "u") return window;
        if (typeof global < "u") return global;
    }
    function Hv() {
        const e = zv();
        if (e.__xstate__) return e.__xstate__;
    }
    const Nv = (e)=>{
        if (typeof window > "u") return;
        const t = Hv();
        t && t.register(e);
    };
    class oh {
        constructor(t){
            this._process = t, this._active = !1, this._current = null, this._last = null;
        }
        start() {
            this._active = !0, this.flush();
        }
        clear() {
            this._current && (this._current.next = null, this._last = this._current);
        }
        enqueue(t) {
            const n = {
                value: t,
                next: null
            };
            if (this._current) {
                this._last.next = n, this._last = n;
                return;
            }
            this._current = n, this._last = n, this._active && this.flush();
        }
        flush() {
            for(; this._current;){
                const t = this._current;
                this._process(t.value), this._current = t.next;
            }
            this._last = null;
        }
    }
    const vg = ".", Bv = "", bg = "", $v = "#", Vv = "*", xg = "xstate.init", Wv = "xstate.error", Fu = "xstate.stop";
    function Kv(e, t) {
        return {
            type: `xstate.after.${e}.${t}`
        };
    }
    function zu(e, t) {
        return {
            type: `xstate.done.state.${e}`,
            output: t
        };
    }
    function Gv(e, t) {
        return {
            type: `xstate.done.actor.${e}`,
            output: t,
            actorId: e
        };
    }
    function Sg(e, t) {
        return {
            type: `xstate.error.actor.${e}`,
            error: t,
            actorId: e
        };
    }
    function kg(e) {
        return {
            type: xg,
            input: e
        };
    }
    function Zt(e) {
        setTimeout(()=>{
            throw e;
        });
    }
    const Qv = (()=>typeof Symbol == "function" && Symbol.observable || "@@observable")();
    function Cg(e, t) {
        const n = ih(e), r = ih(t);
        return typeof r == "string" ? typeof n == "string" ? r === n : !1 : typeof n == "string" ? n in r : Object.keys(n).every((s)=>s in r ? Cg(n[s], r[s]) : !1);
    }
    function ff(e) {
        if (Ig(e)) return e;
        const t = [];
        let n = "";
        for(let r = 0; r < e.length; r++){
            switch(e.charCodeAt(r)){
                case 92:
                    n += e[r + 1], r++;
                    continue;
                case 46:
                    t.push(n), n = "";
                    continue;
            }
            n += e[r];
        }
        return t.push(n), t;
    }
    function ih(e) {
        if (E2(e)) return e.value;
        if (typeof e != "string") return e;
        const t = ff(e);
        return Jv(t);
    }
    function Jv(e) {
        if (e.length === 1) return e[0];
        const t = {};
        let n = t;
        for(let r = 0; r < e.length - 1; r++)if (r === e.length - 2) n[e[r]] = e[r + 1];
        else {
            const s = n;
            n = {}, s[e[r]] = n;
        }
        return t;
    }
    function ah(e, t) {
        const n = {}, r = Object.keys(e);
        for(let s = 0; s < r.length; s++){
            const o = r[s];
            n[o] = t(e[o], o, e, s);
        }
        return n;
    }
    function Eg(e) {
        return Ig(e) ? e : [
            e
        ];
    }
    function vn(e) {
        return e === void 0 ? [] : Eg(e);
    }
    function Hu(e, t, n, r) {
        return typeof e == "function" ? e({
            context: t,
            event: n,
            self: r
        }) : e;
    }
    function Ig(e) {
        return Array.isArray(e);
    }
    function Yv(e) {
        return e.type.startsWith("xstate.error.actor");
    }
    function Nr(e) {
        return Eg(e).map((t)=>typeof t > "u" || typeof t == "string" ? {
                target: t
            } : t);
    }
    function Ag(e) {
        if (!(e === void 0 || e === Bv)) return vn(e);
    }
    function Nu(e, t, n) {
        const r = typeof e == "object", s = r ? e : void 0;
        return {
            next: (r ? e.next : e)?.bind(s),
            error: (r ? e.error : t)?.bind(s),
            complete: (r ? e.complete : n)?.bind(s)
        };
    }
    function lh(e, t) {
        return `${t}.${e}`;
    }
    function df(e, t) {
        const n = t.match(/^xstate\.invoke\.(\d+)\.(.*)/);
        if (!n) return e.implementations.actors[t];
        const [, r, s] = n, i = e.getStateNodeById(s).config.invoke;
        return (Array.isArray(i) ? i[r] : i).src;
    }
    function Og(e, t) {
        if (t === e || t === Vv) return !0;
        if (!t.endsWith(".*")) return !1;
        const n = t.split("."), r = e.split(".");
        for(let s = 0; s < n.length; s++){
            const o = n[s], i = r[s];
            if (o === "*") return s === n.length - 1;
            if (o !== i) return !1;
        }
        return !0;
    }
    function uh(e, t) {
        return `${e.sessionId}.${t}`;
    }
    let Xv = 0;
    function Zv(e, t) {
        const n = new Map, r = new Map, s = new WeakMap, o = new Set, i = {}, { clock: a, logger: l } = t, f = {
            schedule: (h, d, p, m, x = Math.random().toString(36).slice(2))=>{
                const w = {
                    source: h,
                    target: d,
                    event: p,
                    delay: m,
                    id: x,
                    startedAt: Date.now()
                }, _ = uh(h, x);
                u._snapshot._scheduledEvents[_] = w;
                const g = a.setTimeout(()=>{
                    delete i[_], delete u._snapshot._scheduledEvents[_], u._relay(h, d, p);
                }, m);
                i[_] = g;
            },
            cancel: (h, d)=>{
                const p = uh(h, d), m = i[p];
                delete i[p], delete u._snapshot._scheduledEvents[p], m !== void 0 && a.clearTimeout(m);
            },
            cancelAll: (h)=>{
                for(const d in u._snapshot._scheduledEvents){
                    const p = u._snapshot._scheduledEvents[d];
                    p.source === h && f.cancel(h, p.id);
                }
            }
        }, c = (h)=>{
            if (!o.size) return;
            const d = {
                ...h,
                rootId: e.sessionId
            };
            o.forEach((p)=>p.next?.(d));
        }, u = {
            _snapshot: {
                _scheduledEvents: (t?.snapshot && t.snapshot.scheduler) ?? {}
            },
            _bookId: ()=>`x:${Xv++}`,
            _register: (h, d)=>(n.set(h, d), h),
            _unregister: (h)=>{
                n.delete(h.sessionId);
                const d = s.get(h);
                d !== void 0 && (r.delete(d), s.delete(h));
            },
            get: (h)=>r.get(h),
            getAll: ()=>Object.fromEntries(r.entries()),
            _set: (h, d)=>{
                const p = r.get(h);
                if (p && p !== d) throw new Error(`Actor with system ID '${h}' already exists.`);
                r.set(h, d), s.set(d, h);
            },
            inspect: (h)=>{
                const d = Nu(h);
                return o.add(d), {
                    unsubscribe () {
                        o.delete(d);
                    }
                };
            },
            _sendInspectionEvent: c,
            _relay: (h, d, p)=>{
                u._sendInspectionEvent({
                    type: "@xstate.event",
                    sourceRef: h,
                    actorRef: d,
                    event: p
                }), d._send(p);
            },
            scheduler: f,
            getSnapshot: ()=>({
                    _scheduledEvents: {
                        ...u._snapshot._scheduledEvents
                    }
                }),
            start: ()=>{
                const h = u._snapshot._scheduledEvents;
                u._snapshot._scheduledEvents = {};
                for(const d in h){
                    const { source: p, target: m, event: x, delay: w, id: _ } = h[d];
                    f.schedule(p, m, x, w, _);
                }
            },
            _clock: a,
            _logger: l
        };
        return u;
    }
    let Sl = !1;
    const hf = 1;
    let lt = function(e) {
        return e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped", e;
    }({});
    const qv = {
        clock: {
            setTimeout: (e, t)=>setTimeout(e, t),
            clearTimeout: (e)=>clearTimeout(e)
        },
        logger: console.log.bind(console),
        devTools: !1
    };
    class e2 {
        constructor(t, n){
            this.logic = t, this._snapshot = void 0, this.clock = void 0, this.options = void 0, this.id = void 0, this.mailbox = new oh(this._process.bind(this)), this.observers = new Set, this.eventListeners = new Map, this.logger = void 0, this._processingStatus = lt.NotStarted, this._parent = void 0, this._syncSnapshot = void 0, this.ref = void 0, this._actorScope = void 0, this.systemId = void 0, this.sessionId = void 0, this.system = void 0, this._doneEvent = void 0, this.src = void 0, this._deferred = [];
            const r = {
                ...qv,
                ...n
            }, { clock: s, logger: o, parent: i, syncSnapshot: a, id: l, systemId: f, inspect: c } = r;
            this.system = i ? i.system : Zv(this, {
                clock: s,
                logger: o
            }), c && !i && this.system.inspect(Nu(c)), this.sessionId = this.system._bookId(), this.id = l ?? this.sessionId, this.logger = n?.logger ?? this.system._logger, this.clock = n?.clock ?? this.system._clock, this._parent = i, this._syncSnapshot = a, this.options = r, this.src = r.src ?? t, this.ref = this, this._actorScope = {
                self: this,
                id: this.id,
                sessionId: this.sessionId,
                logger: this.logger,
                defer: (u)=>{
                    this._deferred.push(u);
                },
                system: this.system,
                stopChild: (u)=>{
                    if (u._parent !== this) throw new Error(`Cannot stop child actor ${u.id} of ${this.id} because it is not a child`);
                    u._stop();
                },
                emit: (u)=>{
                    const h = this.eventListeners.get(u.type), d = this.eventListeners.get("*");
                    if (!h && !d) return;
                    const p = [
                        ...h ? h.values() : [],
                        ...d ? d.values() : []
                    ];
                    for (const m of p)try {
                        m(u);
                    } catch (x) {
                        Zt(x);
                    }
                },
                actionExecutor: (u)=>{
                    const h = ()=>{
                        if (this._actorScope.system._sendInspectionEvent({
                            type: "@xstate.action",
                            actorRef: this,
                            action: {
                                type: u.type,
                                params: u.params
                            }
                        }), !u.exec) return;
                        const d = Sl;
                        try {
                            Sl = !0, u.exec(u.info, u.params);
                        } finally{
                            Sl = d;
                        }
                    };
                    this._processingStatus === lt.Running ? h() : this._deferred.push(h);
                }
            }, this.send = this.send.bind(this), this.system._sendInspectionEvent({
                type: "@xstate.actor",
                actorRef: this
            }), f && (this.systemId = f, this.system._set(f, this)), this._initState(n?.snapshot ?? n?.state), f && this._snapshot.status !== "active" && this.system._unregister(this);
        }
        _initState(t) {
            try {
                this._snapshot = t ? this.logic.restoreSnapshot ? this.logic.restoreSnapshot(t, this._actorScope) : t : this.logic.getInitialSnapshot(this._actorScope, this.options?.input);
            } catch (n) {
                this._snapshot = {
                    status: "error",
                    output: void 0,
                    error: n
                };
            }
        }
        update(t, n) {
            this._snapshot = t;
            let r;
            for(; r = this._deferred.shift();)try {
                r();
            } catch (s) {
                this._deferred.length = 0, this._snapshot = {
                    ...t,
                    status: "error",
                    error: s
                };
            }
            switch(this._snapshot.status){
                case "active":
                    for (const s of this.observers)try {
                        s.next?.(t);
                    } catch (o) {
                        Zt(o);
                    }
                    break;
                case "done":
                    for (const s of this.observers)try {
                        s.next?.(t);
                    } catch (o) {
                        Zt(o);
                    }
                    this._stopProcedure(), this._complete(), this._doneEvent = Gv(this.id, this._snapshot.output), this._parent && this.system._relay(this, this._parent, this._doneEvent);
                    break;
                case "error":
                    this._error(this._snapshot.error);
                    break;
            }
            this.system._sendInspectionEvent({
                type: "@xstate.snapshot",
                actorRef: this,
                event: n,
                snapshot: t
            });
        }
        subscribe(t, n, r) {
            const s = Nu(t, n, r);
            if (this._processingStatus !== lt.Stopped) this.observers.add(s);
            else switch(this._snapshot.status){
                case "done":
                    try {
                        s.complete?.();
                    } catch (o) {
                        Zt(o);
                    }
                    break;
                case "error":
                    {
                        const o = this._snapshot.error;
                        if (!s.error) Zt(o);
                        else try {
                            s.error(o);
                        } catch (i) {
                            Zt(i);
                        }
                        break;
                    }
            }
            return {
                unsubscribe: ()=>{
                    this.observers.delete(s);
                }
            };
        }
        on(t, n) {
            let r = this.eventListeners.get(t);
            r || (r = new Set, this.eventListeners.set(t, r));
            const s = n.bind(void 0);
            return r.add(s), {
                unsubscribe: ()=>{
                    r.delete(s);
                }
            };
        }
        start() {
            if (this._processingStatus === lt.Running) return this;
            this._syncSnapshot && this.subscribe({
                next: (r)=>{
                    r.status === "active" && this.system._relay(this, this._parent, {
                        type: `xstate.snapshot.${this.id}`,
                        snapshot: r
                    });
                },
                error: ()=>{}
            }), this.system._register(this.sessionId, this), this.systemId && this.system._set(this.systemId, this), this._processingStatus = lt.Running;
            const t = kg(this.options.input);
            switch(this.system._sendInspectionEvent({
                type: "@xstate.event",
                sourceRef: this._parent,
                actorRef: this,
                event: t
            }), this._snapshot.status){
                case "done":
                    return this.update(this._snapshot, t), this;
                case "error":
                    return this._error(this._snapshot.error), this;
            }
            if (this._parent || this.system.start(), this.logic.start) try {
                this.logic.start(this._snapshot, this._actorScope);
            } catch (r) {
                return this._snapshot = {
                    ...this._snapshot,
                    status: "error",
                    error: r
                }, this._error(r), this;
            }
            return this.update(this._snapshot, t), this.options.devTools && this.attachDevTools(), this.mailbox.start(), this;
        }
        _process(t) {
            let n, r;
            try {
                n = this.logic.transition(this._snapshot, t, this._actorScope);
            } catch (s) {
                r = {
                    err: s
                };
            }
            if (r) {
                const { err: s } = r;
                this._snapshot = {
                    ...this._snapshot,
                    status: "error",
                    error: s
                }, this._error(s);
                return;
            }
            this.update(n, t), t.type === Fu && (this._stopProcedure(), this._complete());
        }
        _stop() {
            return this._processingStatus === lt.Stopped ? this : (this.mailbox.clear(), this._processingStatus === lt.NotStarted ? (this._processingStatus = lt.Stopped, this) : (this.mailbox.enqueue({
                type: Fu
            }), this));
        }
        stop() {
            if (this._parent) throw new Error("A non-root actor cannot be stopped directly.");
            return this._stop();
        }
        _complete() {
            for (const t of this.observers)try {
                t.complete?.();
            } catch (n) {
                Zt(n);
            }
            this.observers.clear(), this.eventListeners.clear();
        }
        _reportError(t) {
            if (!this.observers.size) {
                this._parent || Zt(t), this.eventListeners.clear();
                return;
            }
            let n = !1;
            for (const r of this.observers){
                const s = r.error;
                n ||= !s;
                try {
                    s?.(t);
                } catch (o) {
                    Zt(o);
                }
            }
            this.observers.clear(), this.eventListeners.clear(), n && Zt(t);
        }
        _error(t) {
            this._stopProcedure(), this._reportError(t), this._parent && this.system._relay(this, this._parent, Sg(this.id, t));
        }
        _stopProcedure() {
            return this._processingStatus !== lt.Running ? this : (this.system.scheduler.cancelAll(this), this.mailbox.clear(), this.mailbox = new oh(this._process.bind(this)), this._processingStatus = lt.Stopped, this.system._unregister(this), this);
        }
        _send(t) {
            this._processingStatus !== lt.Stopped && this.mailbox.enqueue(t);
        }
        send(t) {
            this.system._relay(void 0, this, t);
        }
        attachDevTools() {
            const { devTools: t } = this.options;
            t && (typeof t == "function" ? t : Nv)(this);
        }
        toJSON() {
            return {
                xstate$$type: hf,
                id: this.id
            };
        }
        getPersistedSnapshot(t) {
            return this.logic.getPersistedSnapshot(this._snapshot, t);
        }
        [Qv]() {
            return this;
        }
        getSnapshot() {
            return this._snapshot;
        }
    }
    function wo(e, ...[t]) {
        return new e2(e, t);
    }
    function t2(e, t, n, r, { sendId: s }) {
        const o = typeof s == "function" ? s(n, r) : s;
        return [
            t,
            {
                sendId: o
            },
            void 0
        ];
    }
    function n2(e, t) {
        e.defer(()=>{
            e.system.scheduler.cancel(e.self, t.sendId);
        });
    }
    function pf(e) {
        function t(n, r) {}
        return t.type = "xstate.cancel", t.sendId = e, t.resolve = t2, t.execute = n2, t;
    }
    function r2(e, t, n, r, { id: s, systemId: o, src: i, input: a, syncSnapshot: l }) {
        const f = typeof i == "string" ? df(t.machine, i) : i, c = typeof s == "function" ? s(n) : s;
        let u, h;
        return f && (h = typeof a == "function" ? a({
            context: t.context,
            event: n.event,
            self: e.self
        }) : a, u = wo(f, {
            id: c,
            src: i,
            parent: e.self,
            syncSnapshot: l,
            systemId: o,
            input: h
        })), [
            Er(t, {
                children: {
                    ...t.children,
                    [c]: u
                }
            }),
            {
                id: s,
                systemId: o,
                actorRef: u,
                src: i,
                input: h
            },
            void 0
        ];
    }
    function s2(e, { actorRef: t }) {
        t && e.defer(()=>{
            t._processingStatus !== lt.Stopped && t.start();
        });
    }
    function gf(...[e, { id: t, systemId: n, input: r, syncSnapshot: s = !1 } = {}]) {
        function o(i, a) {}
        return o.type = "xstate.spawnChild", o.id = t, o.systemId = n, o.src = e, o.input = r, o.syncSnapshot = s, o.resolve = r2, o.execute = s2, o;
    }
    function o2(e, t, n, r, { actorRef: s }) {
        const o = typeof s == "function" ? s(n, r) : s, i = typeof o == "string" ? t.children[o] : o;
        let a = t.children;
        return i && (a = {
            ...a
        }, delete a[i.id]), [
            Er(t, {
                children: a
            }),
            i,
            void 0
        ];
    }
    function Tg(e, t) {
        const n = t.getSnapshot();
        if (n && "children" in n) for (const r of Object.values(n.children))Tg(e, r);
        e.system._unregister(t);
    }
    function i2(e, t) {
        if (t) {
            if (Tg(e, t), t._processingStatus !== lt.Running) {
                e.stopChild(t);
                return;
            }
            e.defer(()=>{
                e.stopChild(t);
            });
        }
    }
    function Fa(e) {
        function t(n, r) {}
        return t.type = "xstate.stopChild", t.actorRef = e, t.resolve = o2, t.execute = i2, t;
    }
    function za(e, t, n, r) {
        const { machine: s } = r, o = typeof e == "function", i = o ? e : s.implementations.guards[typeof e == "string" ? e : e.type];
        if (!o && !i) throw new Error(`Guard '${typeof e == "string" ? e : e.type}' is not implemented.'.`);
        if (typeof i != "function") return za(i, t, n, r);
        const a = {
            context: t,
            event: n
        }, l = o || typeof e == "string" ? void 0 : "params" in e ? typeof e.params == "function" ? e.params({
            context: t,
            event: n
        }) : e.params : void 0;
        return "check" in i ? i.check(r, a, i) : i(a, l);
    }
    function yf(e) {
        return e.type === "atomic" || e.type === "final";
    }
    function _s(e) {
        return Object.values(e.states).filter((t)=>t.type !== "history");
    }
    function Fo(e, t) {
        const n = [];
        if (t === e) return n;
        let r = e.parent;
        for(; r && r !== t;)n.push(r), r = r.parent;
        return n;
    }
    function sa(e) {
        const t = new Set(e), n = Mg(t);
        for (const r of t)if (r.type === "compound" && (!n.get(r) || !n.get(r).length)) ch(r).forEach((s)=>t.add(s));
        else if (r.type === "parallel") {
            for (const s of _s(r))if (s.type !== "history" && !t.has(s)) {
                const o = ch(s);
                for (const i of o)t.add(i);
            }
        }
        for (const r of t){
            let s = r.parent;
            for(; s;)t.add(s), s = s.parent;
        }
        return t;
    }
    function jg(e, t) {
        const n = t.get(e);
        if (!n) return {};
        if (e.type === "compound") {
            const s = n[0];
            if (s) {
                if (yf(s)) return s.key;
            } else return {};
        }
        const r = {};
        for (const s of n)r[s.key] = jg(s, t);
        return r;
    }
    function Mg(e) {
        const t = new Map;
        for (const n of e)t.has(n) || t.set(n, []), n.parent && (t.has(n.parent) || t.set(n.parent, []), t.get(n.parent).push(n));
        return t;
    }
    function Rg(e, t) {
        const n = sa(t);
        return jg(e, Mg(n));
    }
    function mf(e, t) {
        return t.type === "compound" ? _s(t).some((n)=>n.type === "final" && e.has(n)) : t.type === "parallel" ? _s(t).every((n)=>mf(e, n)) : t.type === "final";
    }
    const Ha = (e)=>e[0] === $v;
    function a2(e, t) {
        return e.transitions.get(t) || [
            ...e.transitions.keys()
        ].filter((r)=>Og(t, r)).sort((r, s)=>s.length - r.length).flatMap((r)=>e.transitions.get(r));
    }
    function l2(e) {
        const t = e.config.after;
        if (!t) return [];
        const n = (s)=>{
            const o = Kv(s, e.id), i = o.type;
            return e.entry.push(vf(o, {
                id: i,
                delay: s
            })), e.exit.push(pf(i)), i;
        };
        return Object.keys(t).flatMap((s)=>{
            const o = t[s], i = typeof o == "string" ? {
                target: o
            } : o, a = Number.isNaN(+s) ? s : +s, l = n(a);
            return vn(i).map((f)=>({
                    ...f,
                    event: l,
                    delay: a
                }));
        }).map((s)=>{
            const { delay: o } = s;
            return {
                ...lr(e, s.event, s),
                delay: o
            };
        });
    }
    function lr(e, t, n) {
        const r = Ag(n.target), s = n.reenter ?? !1, o = f2(e, r), i = {
            ...n,
            actions: vn(n.actions),
            guard: n.guard,
            target: o,
            source: e,
            reenter: s,
            eventType: t,
            toJSON: ()=>({
                    ...i,
                    source: `#${e.id}`,
                    target: o ? o.map((a)=>`#${a.id}`) : void 0
                })
        };
        return i;
    }
    function u2(e) {
        const t = new Map;
        if (e.config.on) for (const n of Object.keys(e.config.on)){
            if (n === bg) throw new Error('Null events ("") cannot be specified as a transition key. Use `always: { ... }` instead.');
            const r = e.config.on[n];
            t.set(n, Nr(r).map((s)=>lr(e, n, s)));
        }
        if (e.config.onDone) {
            const n = `xstate.done.state.${e.id}`;
            t.set(n, Nr(e.config.onDone).map((r)=>lr(e, n, r)));
        }
        for (const n of e.invoke){
            if (n.onDone) {
                const r = `xstate.done.actor.${n.id}`;
                t.set(r, Nr(n.onDone).map((s)=>lr(e, r, s)));
            }
            if (n.onError) {
                const r = `xstate.error.actor.${n.id}`;
                t.set(r, Nr(n.onError).map((s)=>lr(e, r, s)));
            }
            if (n.onSnapshot) {
                const r = `xstate.snapshot.${n.id}`;
                t.set(r, Nr(n.onSnapshot).map((s)=>lr(e, r, s)));
            }
        }
        for (const n of e.after){
            let r = t.get(n.eventType);
            r || (r = [], t.set(n.eventType, r)), r.push(n);
        }
        return t;
    }
    function c2(e, t) {
        const n = typeof t == "string" ? e.states[t] : t ? e.states[t.target] : void 0;
        if (!n && t) throw new Error(`Initial state node "${t}" not found on parent state node #${e.id}`);
        const r = {
            source: e,
            actions: !t || typeof t == "string" ? [] : vn(t.actions),
            eventType: null,
            reenter: !1,
            target: n ? [
                n
            ] : [],
            toJSON: ()=>({
                    ...r,
                    source: `#${e.id}`,
                    target: n ? [
                        `#${n.id}`
                    ] : []
                })
        };
        return r;
    }
    function f2(e, t) {
        if (t !== void 0) return t.map((n)=>{
            if (typeof n != "string") return n;
            if (Ha(n)) return e.machine.getStateNodeById(n);
            const r = n[0] === vg;
            if (r && !e.parent) return oa(e, n.slice(1));
            const s = r ? e.key + n : n;
            if (e.parent) try {
                return oa(e.parent, s);
            } catch (o) {
                throw new Error(`Invalid transition definition for state node '${e.id}':
${o.message}`);
            }
            else throw new Error(`Invalid target: "${n}" is not a valid target from the root node. Did you mean ".${n}"?`);
        });
    }
    function Pg(e) {
        const t = Ag(e.config.target);
        return t ? {
            target: t.map((n)=>typeof n == "string" ? oa(e.parent, n) : n)
        } : e.parent.initial;
    }
    function hr(e) {
        return e.type === "history";
    }
    function ch(e) {
        const t = Dg(e);
        for (const n of t)for (const r of Fo(n, e))t.add(r);
        return t;
    }
    function Dg(e) {
        const t = new Set;
        function n(r) {
            if (!t.has(r)) {
                if (t.add(r), r.type === "compound") n(r.initial.target[0]);
                else if (r.type === "parallel") for (const s of _s(r))n(s);
            }
        }
        return n(e), t;
    }
    function ws(e, t) {
        if (Ha(t)) return e.machine.getStateNodeById(t);
        if (!e.states) throw new Error(`Unable to retrieve child state '${t}' from '${e.id}'; no child states exist.`);
        const n = e.states[t];
        if (!n) throw new Error(`Child state '${t}' does not exist on '${e.id}'`);
        return n;
    }
    function oa(e, t) {
        if (typeof t == "string" && Ha(t)) try {
            return e.machine.getStateNodeById(t);
        } catch  {}
        const n = ff(t).slice();
        let r = e;
        for(; n.length;){
            const s = n.shift();
            if (!s.length) break;
            r = ws(r, s);
        }
        return r;
    }
    function ia(e, t) {
        if (typeof t == "string") {
            const s = e.states[t];
            if (!s) throw new Error(`State '${t}' does not exist on '${e.id}'`);
            return [
                e,
                s
            ];
        }
        const n = Object.keys(t), r = n.map((s)=>ws(e, s)).filter(Boolean);
        return [
            e.machine.root,
            e
        ].concat(r, n.reduce((s, o)=>{
            const i = ws(e, o);
            if (!i) return s;
            const a = ia(i, t[o]);
            return s.concat(a);
        }, []));
    }
    function d2(e, t, n, r) {
        const o = ws(e, t).next(n, r);
        return !o || !o.length ? e.next(n, r) : o;
    }
    function h2(e, t, n, r) {
        const s = Object.keys(t), o = ws(e, s[0]), i = _f(o, t[s[0]], n, r);
        return !i || !i.length ? e.next(n, r) : i;
    }
    function p2(e, t, n, r) {
        const s = [];
        for (const o of Object.keys(t)){
            const i = t[o];
            if (!i) continue;
            const a = ws(e, o), l = _f(a, i, n, r);
            l && s.push(...l);
        }
        return s.length ? s : e.next(n, r);
    }
    function _f(e, t, n, r) {
        return typeof t == "string" ? d2(e, t, n, r) : Object.keys(t).length === 1 ? h2(e, t, n, r) : p2(e, t, n, r);
    }
    function g2(e) {
        return Object.keys(e.states).map((t)=>e.states[t]).filter((t)=>t.type === "history");
    }
    function er(e, t) {
        let n = e;
        for(; n.parent && n.parent !== t;)n = n.parent;
        return n.parent === t;
    }
    function y2(e, t) {
        const n = new Set(e), r = new Set(t);
        for (const s of n)if (r.has(s)) return !0;
        for (const s of r)if (n.has(s)) return !0;
        return !1;
    }
    function Lg(e, t, n) {
        const r = new Set;
        for (const s of e){
            let o = !1;
            const i = new Set;
            for (const a of r)if (y2(Bu([
                s
            ], t, n), Bu([
                a
            ], t, n))) if (er(s.source, a.source)) i.add(a);
            else {
                o = !0;
                break;
            }
            if (!o) {
                for (const a of i)r.delete(a);
                r.add(s);
            }
        }
        return Array.from(r);
    }
    function m2(e) {
        const [t, ...n] = e;
        for (const r of Fo(t, void 0))if (n.every((s)=>er(s, r))) return r;
    }
    function wf(e, t) {
        if (!e.target) return [];
        const n = new Set;
        for (const r of e.target)if (hr(r)) if (t[r.id]) for (const s of t[r.id])n.add(s);
        else for (const s of wf(Pg(r), t))n.add(s);
        else n.add(r);
        return [
            ...n
        ];
    }
    function Ug(e, t) {
        const n = wf(e, t);
        if (!n) return;
        if (!e.reenter && n.every((s)=>s === e.source || er(s, e.source))) return e.source;
        const r = m2(n.concat(e.source));
        if (r) return r;
        if (!e.reenter) return e.source.machine.root;
    }
    function Bu(e, t, n) {
        const r = new Set;
        for (const s of e)if (s.target?.length) {
            const o = Ug(s, n);
            s.reenter && s.source === o && r.add(o);
            for (const i of t)er(i, o) && r.add(i);
        }
        return [
            ...r
        ];
    }
    function _2(e, t) {
        if (e.length !== t.size) return !1;
        for (const n of e)if (!t.has(n)) return !1;
        return !0;
    }
    function $u(e, t, n, r, s, o) {
        if (!e.length) return t;
        const i = new Set(t._nodes);
        let a = t.historyValue;
        const l = Lg(e, i, a);
        let f = t;
        s || ([f, a] = x2(f, r, n, l, i, a, o, n.actionExecutor)), f = vs(f, r, n, l.flatMap((u)=>u.actions), o, void 0), f = v2(f, r, n, l, i, o, a, s);
        const c = [
            ...i
        ];
        f.status === "done" && (f = vs(f, r, n, c.sort((u, h)=>h.order - u.order).flatMap((u)=>u.exit), o, void 0));
        try {
            return a === t.historyValue && _2(t._nodes, i) ? f : Er(f, {
                _nodes: c,
                historyValue: a
            });
        } catch (u) {
            throw u;
        }
    }
    function w2(e, t, n, r, s) {
        if (r.output === void 0) return;
        const o = zu(s.id, s.output !== void 0 && s.parent ? Hu(s.output, e.context, t, n.self) : void 0);
        return Hu(r.output, e.context, o, n.self);
    }
    function v2(e, t, n, r, s, o, i, a) {
        let l = e;
        const f = new Set, c = new Set;
        b2(r, i, c, f), a && c.add(e.machine.root);
        const u = new Set;
        for (const h of [
            ...f
        ].sort((d, p)=>d.order - p.order)){
            s.add(h);
            const d = [];
            d.push(...h.entry);
            for (const p of h.invoke)d.push(gf(p.src, {
                ...p,
                syncSnapshot: !!p.onSnapshot
            }));
            if (c.has(h)) {
                const p = h.initial.actions;
                d.push(...p);
            }
            if (l = vs(l, t, n, d, o, h.invoke.map((p)=>p.id)), h.type === "final") {
                const p = h.parent;
                let m = p?.type === "parallel" ? p : p?.parent, x = m || h;
                for(p?.type === "compound" && o.push(zu(p.id, h.output !== void 0 ? Hu(h.output, l.context, t, n.self) : void 0)); m?.type === "parallel" && !u.has(m) && mf(s, m);)u.add(m), o.push(zu(m.id)), x = m, m = m.parent;
                if (m) continue;
                l = Er(l, {
                    status: "done",
                    output: w2(l, t, n, l.machine.root, x)
                });
            }
        }
        return l;
    }
    function b2(e, t, n, r) {
        for (const s of e){
            const o = Ug(s, t);
            for (const a of s.target || [])!hr(a) && (s.source !== a || s.source !== o || s.reenter) && (r.add(a), n.add(a)), es(a, t, n, r);
            const i = wf(s, t);
            for (const a of i){
                const l = Fo(a, o);
                o?.type === "parallel" && l.push(o), Fg(r, t, n, l, !s.source.parent && s.reenter ? void 0 : o);
            }
        }
    }
    function es(e, t, n, r) {
        if (hr(e)) if (t[e.id]) {
            const s = t[e.id];
            for (const o of s)r.add(o), es(o, t, n, r);
            for (const o of s)kl(o, e.parent, r, t, n);
        } else {
            const s = Pg(e);
            for (const o of s.target)r.add(o), s === e.parent?.initial && n.add(e.parent), es(o, t, n, r);
            for (const o of s.target)kl(o, e.parent, r, t, n);
        }
        else if (e.type === "compound") {
            const [s] = e.initial.target;
            hr(s) || (r.add(s), n.add(s)), es(s, t, n, r), kl(s, e, r, t, n);
        } else if (e.type === "parallel") for (const s of _s(e).filter((o)=>!hr(o)))[
            ...r
        ].some((o)=>er(o, s)) || (hr(s) || (r.add(s), n.add(s)), es(s, t, n, r));
    }
    function Fg(e, t, n, r, s) {
        for (const o of r)if ((!s || er(o, s)) && e.add(o), o.type === "parallel") for (const i of _s(o).filter((a)=>!hr(a)))[
            ...e
        ].some((a)=>er(a, i)) || (e.add(i), es(i, t, n, e));
    }
    function kl(e, t, n, r, s) {
        Fg(n, r, s, Fo(e, t));
    }
    function x2(e, t, n, r, s, o, i, a) {
        let l = e;
        const f = Bu(r, s, o);
        f.sort((u, h)=>h.order - u.order);
        let c;
        for (const u of f)for (const h of g2(u)){
            let d;
            h.history === "deep" ? d = (p)=>yf(p) && er(p, u) : d = (p)=>p.parent === u, c ??= {
                ...o
            }, c[h.id] = Array.from(s).filter(d);
        }
        for (const u of f)l = vs(l, t, n, [
            ...u.exit,
            ...u.invoke.map((h)=>Fa(h.id))
        ], i, void 0), s.delete(u);
        return [
            l,
            c || o
        ];
    }
    function S2(e, t) {
        return e.implementations.actions[t];
    }
    function zg(e, t, n, r, s, o) {
        const { machine: i } = e;
        let a = e;
        for (const l of r){
            const f = typeof l == "function", c = f ? l : S2(i, typeof l == "string" ? l : l.type), u = {
                context: a.context,
                event: t,
                self: n.self,
                system: n.system
            }, h = f || typeof l == "string" ? void 0 : "params" in l ? typeof l.params == "function" ? l.params({
                context: a.context,
                event: t
            }) : l.params : void 0;
            if (!c || !("resolve" in c)) {
                n.actionExecutor({
                    type: typeof l == "string" ? l : typeof l == "object" ? l.type : l.name || "(anonymous)",
                    info: u,
                    params: h,
                    exec: c
                });
                continue;
            }
            const d = c, [p, m, x] = d.resolve(n, a, u, h, c, s);
            a = p, "retryResolve" in d && o?.push([
                d,
                m
            ]), "execute" in d && n.actionExecutor({
                type: d.type,
                info: u,
                params: m,
                exec: d.execute.bind(null, n, m)
            }), x && (a = zg(a, t, n, x, s, o));
        }
        return a;
    }
    function vs(e, t, n, r, s, o) {
        const i = o ? [] : void 0, a = zg(e, t, n, r, {
            internalQueue: s,
            deferredActorIds: o
        }, i);
        return i?.forEach(([l, f])=>{
            l.retryResolve(n, a, f);
        }), a;
    }
    function Cl(e, t, n, r) {
        let s = e;
        const o = [];
        function i(f, c, u) {
            n.system._sendInspectionEvent({
                type: "@xstate.microstep",
                actorRef: n.self,
                event: c,
                snapshot: f,
                _transitions: u
            }), o.push(f);
        }
        if (t.type === Fu) return s = Er(fh(s, t, n), {
            status: "stopped"
        }), i(s, t, []), {
            snapshot: s,
            microstates: o
        };
        let a = t;
        if (a.type !== xg) {
            const f = a, c = Yv(f), u = dh(f, s);
            if (c && !u.length) return s = Er(e, {
                status: "error",
                error: f.error
            }), i(s, f, []), {
                snapshot: s,
                microstates: o
            };
            s = $u(u, e, n, a, !1, r), i(s, f, u);
        }
        let l = !0;
        for(; s.status === "active";){
            let f = l ? k2(s, a) : [];
            const c = f.length ? s : void 0;
            if (!f.length) {
                if (!r.length) break;
                a = r.shift(), f = dh(a, s);
            }
            s = $u(f, s, n, a, !1, r), l = s !== c, i(s, a, f);
        }
        return s.status !== "active" && fh(s, a, n), {
            snapshot: s,
            microstates: o
        };
    }
    function fh(e, t, n) {
        return vs(e, t, n, Object.values(e.children).map((r)=>Fa(r)), [], void 0);
    }
    function dh(e, t) {
        return t.machine.getTransitionData(t, e);
    }
    function k2(e, t) {
        const n = new Set, r = e._nodes.filter(yf);
        for (const s of r)e: for (const o of [
            s
        ].concat(Fo(s, void 0)))if (o.always) {
            for (const i of o.always)if (i.guard === void 0 || za(i.guard, e.context, t, e)) {
                n.add(i);
                break e;
            }
        }
        return Lg(Array.from(n), new Set(e._nodes), e.historyValue);
    }
    function C2(e, t) {
        const n = sa(ia(e, t));
        return Rg(e, [
            ...n
        ]);
    }
    function E2(e) {
        return !!e && typeof e == "object" && "machine" in e && "value" in e;
    }
    const I2 = function(t) {
        return Cg(t, this.value);
    }, A2 = function(t) {
        return this.tags.has(t);
    }, O2 = function(t) {
        const n = this.machine.getTransitionData(this, t);
        return !!n?.length && n.some((r)=>r.target !== void 0 || r.actions.length);
    }, T2 = function() {
        const { _nodes: t, tags: n, machine: r, getMeta: s, toJSON: o, can: i, hasTag: a, matches: l, ...f } = this;
        return {
            ...f,
            tags: Array.from(n)
        };
    }, j2 = function() {
        return this._nodes.reduce((t, n)=>(n.meta !== void 0 && (t[n.id] = n.meta), t), {});
    };
    function Ei(e, t) {
        return {
            status: e.status,
            output: e.output,
            error: e.error,
            machine: t,
            context: e.context,
            _nodes: e._nodes,
            value: Rg(t.root, e._nodes),
            tags: new Set(e._nodes.flatMap((n)=>n.tags)),
            children: e.children,
            historyValue: e.historyValue || {},
            matches: I2,
            hasTag: A2,
            can: O2,
            getMeta: j2,
            toJSON: T2
        };
    }
    function Er(e, t = {}) {
        return Ei({
            ...e,
            ...t
        }, e.machine);
    }
    function M2(e) {
        if (typeof e != "object" || e === null) return {};
        const t = {};
        for(const n in e){
            const r = e[n];
            Array.isArray(r) && (t[n] = r.map((s)=>({
                    id: s.id
                })));
        }
        return t;
    }
    function R2(e, t) {
        const { _nodes: n, tags: r, machine: s, children: o, context: i, can: a, hasTag: l, matches: f, getMeta: c, toJSON: u, ...h } = e, d = {};
        for(const m in o){
            const x = o[m];
            d[m] = {
                snapshot: x.getPersistedSnapshot(t),
                src: x.src,
                systemId: x.systemId,
                syncSnapshot: x._syncSnapshot
            };
        }
        return {
            ...h,
            context: Hg(i),
            children: d,
            historyValue: M2(h.historyValue)
        };
    }
    function Hg(e) {
        let t;
        for(const n in e){
            const r = e[n];
            if (r && typeof r == "object") if ("sessionId" in r && "send" in r && "ref" in r) t ??= Array.isArray(e) ? e.slice() : {
                ...e
            }, t[n] = {
                xstate$$type: hf,
                id: r.id
            };
            else {
                const s = Hg(r);
                s !== r && (t ??= Array.isArray(e) ? e.slice() : {
                    ...e
                }, t[n] = s);
            }
        }
        return t ?? e;
    }
    function P2(e, t, n, r, { event: s, id: o, delay: i }, { internalQueue: a }) {
        const l = t.machine.implementations.delays;
        if (typeof s == "string") throw new Error(`Only event objects may be used with raise; use raise({ type: "${s}" }) instead`);
        const f = typeof s == "function" ? s(n, r) : s;
        let c;
        if (typeof i == "string") {
            const u = l && l[i];
            c = typeof u == "function" ? u(n, r) : u;
        } else c = typeof i == "function" ? i(n, r) : i;
        return typeof c != "number" && a.push(f), [
            t,
            {
                event: f,
                id: o,
                delay: c
            },
            void 0
        ];
    }
    function D2(e, t) {
        const { event: n, delay: r, id: s } = t;
        if (typeof r == "number") {
            e.defer(()=>{
                const o = e.self;
                e.system.scheduler.schedule(o, o, n, r, s);
            });
            return;
        }
    }
    function vf(e, t) {
        function n(r, s) {}
        return n.type = "xstate.raise", n.event = e, n.id = t?.id, n.delay = t?.delay, n.resolve = P2, n.execute = D2, n;
    }
    function L2(e, { machine: t, context: n }, r, s) {
        const o = (i, a)=>{
            if (typeof i == "string") {
                const l = df(t, i);
                if (!l) throw new Error(`Actor logic '${i}' not implemented in machine '${t.id}'`);
                const f = wo(l, {
                    id: a?.id,
                    parent: e.self,
                    syncSnapshot: a?.syncSnapshot,
                    input: typeof a?.input == "function" ? a.input({
                        context: n,
                        event: r,
                        self: e.self
                    }) : a?.input,
                    src: i,
                    systemId: a?.systemId
                });
                return s[f.id] = f, f;
            } else return wo(i, {
                id: a?.id,
                parent: e.self,
                syncSnapshot: a?.syncSnapshot,
                input: a?.input,
                src: i,
                systemId: a?.systemId
            });
        };
        return (i, a)=>{
            const l = o(i, a);
            return s[l.id] = l, e.defer(()=>{
                l._processingStatus !== lt.Stopped && l.start();
            }), l;
        };
    }
    function U2(e, t, n, r, { assignment: s }) {
        if (!t.context) throw new Error("Cannot assign to undefined `context`. Ensure that `context` is defined in the machine config.");
        const o = {}, i = {
            context: t.context,
            event: n.event,
            spawn: L2(e, t, n.event, o),
            self: e.self,
            system: e.system
        };
        let a = {};
        if (typeof s == "function") a = s(i, r);
        else for (const f of Object.keys(s)){
            const c = s[f];
            a[f] = typeof c == "function" ? c(i, r) : c;
        }
        const l = Object.assign({}, t.context, a);
        return [
            Er(t, {
                context: l,
                children: Object.keys(o).length ? {
                    ...t.children,
                    ...o
                } : t.children
            }),
            void 0,
            void 0
        ];
    }
    function vo(e) {
        function t(n, r) {}
        return t.type = "xstate.assign", t.assignment = e, t.resolve = U2, t;
    }
    const hh = new WeakMap;
    function Dr(e, t, n) {
        let r = hh.get(e);
        return r ? t in r || (r[t] = n()) : (r = {
            [t]: n()
        }, hh.set(e, r)), r[t];
    }
    const F2 = {}, Rs = (e)=>typeof e == "string" ? {
            type: e
        } : typeof e == "function" ? "resolve" in e ? {
            type: e.type
        } : {
            type: e.name
        } : e;
    class aa {
        constructor(t, n){
            if (this.config = t, this.key = void 0, this.id = void 0, this.type = void 0, this.path = void 0, this.states = void 0, this.history = void 0, this.entry = void 0, this.exit = void 0, this.parent = void 0, this.machine = void 0, this.meta = void 0, this.output = void 0, this.order = -1, this.description = void 0, this.tags = [], this.transitions = void 0, this.always = void 0, this.parent = n._parent, this.key = n._key, this.machine = n._machine, this.path = this.parent ? this.parent.path.concat(this.key) : [], this.id = this.config.id || [
                this.machine.id,
                ...this.path
            ].join(vg), this.type = this.config.type || (this.config.states && Object.keys(this.config.states).length ? "compound" : this.config.history ? "history" : "atomic"), this.description = this.config.description, this.order = this.machine.idMap.size, this.machine.idMap.set(this.id, this), this.states = this.config.states ? ah(this.config.states, (r, s)=>new aa(r, {
                    _parent: this,
                    _key: s,
                    _machine: this.machine
                })) : F2, this.type === "compound" && !this.config.initial) throw new Error(`No initial state specified for compound state node "#${this.id}". Try adding { initial: "${Object.keys(this.states)[0]}" } to the state config.`);
            this.history = this.config.history === !0 ? "shallow" : this.config.history || !1, this.entry = vn(this.config.entry).slice(), this.exit = vn(this.config.exit).slice(), this.meta = this.config.meta, this.output = this.type === "final" || !this.parent ? this.config.output : void 0, this.tags = vn(t.tags).slice();
        }
        _initialize() {
            this.transitions = u2(this), this.config.always && (this.always = Nr(this.config.always).map((t)=>lr(this, bg, t))), Object.keys(this.states).forEach((t)=>{
                this.states[t]._initialize();
            });
        }
        get definition() {
            return {
                id: this.id,
                key: this.key,
                version: this.machine.version,
                type: this.type,
                initial: this.initial ? {
                    target: this.initial.target,
                    source: this,
                    actions: this.initial.actions.map(Rs),
                    eventType: null,
                    reenter: !1,
                    toJSON: ()=>({
                            target: this.initial.target.map((t)=>`#${t.id}`),
                            source: `#${this.id}`,
                            actions: this.initial.actions.map(Rs),
                            eventType: null
                        })
                } : void 0,
                history: this.history,
                states: ah(this.states, (t)=>t.definition),
                on: this.on,
                transitions: [
                    ...this.transitions.values()
                ].flat().map((t)=>({
                        ...t,
                        actions: t.actions.map(Rs)
                    })),
                entry: this.entry.map(Rs),
                exit: this.exit.map(Rs),
                meta: this.meta,
                order: this.order || -1,
                output: this.output,
                invoke: this.invoke,
                description: this.description,
                tags: this.tags
            };
        }
        toJSON() {
            return this.definition;
        }
        get invoke() {
            return Dr(this, "invoke", ()=>vn(this.config.invoke).map((t, n)=>{
                    const { src: r, systemId: s } = t, o = t.id ?? lh(this.id, n), i = typeof r == "string" ? r : `xstate.invoke.${lh(this.id, n)}`;
                    return {
                        ...t,
                        src: i,
                        id: o,
                        systemId: s,
                        toJSON () {
                            const { onDone: a, onError: l, ...f } = t;
                            return {
                                ...f,
                                type: "xstate.invoke",
                                src: i,
                                id: o
                            };
                        }
                    };
                }));
        }
        get on() {
            return Dr(this, "on", ()=>[
                    ...this.transitions
                ].flatMap(([n, r])=>r.map((s)=>[
                            n,
                            s
                        ])).reduce((n, [r, s])=>(n[r] = n[r] || [], n[r].push(s), n), {}));
        }
        get after() {
            return Dr(this, "delayedTransitions", ()=>l2(this));
        }
        get initial() {
            return Dr(this, "initial", ()=>c2(this, this.config.initial));
        }
        next(t, n) {
            const r = n.type, s = [];
            let o;
            const i = Dr(this, `candidates-${r}`, ()=>a2(this, r));
            for (const a of i){
                const { guard: l } = a, f = t.context;
                let c = !1;
                try {
                    c = !l || za(l, f, n, t);
                } catch (u) {
                    const h = typeof l == "string" ? l : typeof l == "object" ? l.type : void 0;
                    throw new Error(`Unable to evaluate guard ${h ? `'${h}' ` : ""}in transition for event '${r}' in state node '${this.id}':
${u.message}`);
                }
                if (c) {
                    s.push(...a.actions), o = a;
                    break;
                }
            }
            return o ? [
                o
            ] : void 0;
        }
        get events() {
            return Dr(this, "events", ()=>{
                const { states: t } = this, n = new Set(this.ownEvents);
                if (t) for (const r of Object.keys(t)){
                    const s = t[r];
                    if (s.states) for (const o of s.events)n.add(`${o}`);
                }
                return Array.from(n);
            });
        }
        get ownEvents() {
            const t = Object.keys(Object.fromEntries(this.transitions)), n = new Set(t.filter((r)=>this.transitions.get(r).some((s)=>!(!s.target && !s.actions.length && !s.reenter))));
            return Array.from(n);
        }
    }
    const z2 = "#";
    class bf {
        constructor(t, n){
            this.config = t, this.version = void 0, this.schemas = void 0, this.implementations = void 0, this.__xstatenode = !0, this.idMap = new Map, this.root = void 0, this.id = void 0, this.states = void 0, this.events = void 0, this.id = t.id || "(machine)", this.implementations = {
                actors: n?.actors ?? {},
                actions: n?.actions ?? {},
                delays: n?.delays ?? {},
                guards: n?.guards ?? {}
            }, this.version = this.config.version, this.schemas = this.config.schemas, this.transition = this.transition.bind(this), this.getInitialSnapshot = this.getInitialSnapshot.bind(this), this.getPersistedSnapshot = this.getPersistedSnapshot.bind(this), this.restoreSnapshot = this.restoreSnapshot.bind(this), this.start = this.start.bind(this), this.root = new aa(t, {
                _key: this.id,
                _machine: this
            }), this.root._initialize(), this.states = this.root.states, this.events = this.root.events;
        }
        provide(t) {
            const { actions: n, guards: r, actors: s, delays: o } = this.implementations;
            return new bf(this.config, {
                actions: {
                    ...n,
                    ...t.actions
                },
                guards: {
                    ...r,
                    ...t.guards
                },
                actors: {
                    ...s,
                    ...t.actors
                },
                delays: {
                    ...o,
                    ...t.delays
                }
            });
        }
        resolveState(t) {
            const n = C2(this.root, t.value), r = sa(ia(this.root, n));
            return Ei({
                _nodes: [
                    ...r
                ],
                context: t.context || {},
                children: {},
                status: mf(r, this.root) ? "done" : t.status || "active",
                output: t.output,
                error: t.error,
                historyValue: t.historyValue
            }, this);
        }
        transition(t, n, r) {
            return Cl(t, n, r, []).snapshot;
        }
        microstep(t, n, r) {
            return Cl(t, n, r, []).microstates;
        }
        getTransitionData(t, n) {
            return _f(this.root, t.value, t, n) || [];
        }
        getPreInitialState(t, n, r) {
            const { context: s } = this.config, o = Ei({
                context: typeof s != "function" && s ? s : {},
                _nodes: [
                    this.root
                ],
                children: {},
                status: "active"
            }, this);
            return typeof s == "function" ? vs(o, n, t, [
                vo(({ spawn: a, event: l, self: f })=>s({
                        spawn: a,
                        input: l.input,
                        self: f
                    }))
            ], r, void 0) : o;
        }
        getInitialSnapshot(t, n) {
            const r = kg(n), s = [], o = this.getPreInitialState(t, r, s), i = $u([
                {
                    target: [
                        ...Dg(this.root)
                    ],
                    source: this.root,
                    reenter: !0,
                    actions: [],
                    eventType: null,
                    toJSON: null
                }
            ], o, t, r, !0, s), { snapshot: a } = Cl(i, r, t, s);
            return a;
        }
        start(t) {
            Object.values(t.children).forEach((n)=>{
                n.getSnapshot().status === "active" && n.start();
            });
        }
        getStateNodeById(t) {
            const n = ff(t), r = n.slice(1), s = Ha(n[0]) ? n[0].slice(z2.length) : n[0], o = this.idMap.get(s);
            if (!o) throw new Error(`Child state node '#${s}' does not exist on machine '${this.id}'`);
            return oa(o, r);
        }
        get definition() {
            return this.root.definition;
        }
        toJSON() {
            return this.definition;
        }
        getPersistedSnapshot(t, n) {
            return R2(t, n);
        }
        restoreSnapshot(t, n) {
            const r = {}, s = t.children;
            Object.keys(s).forEach((u)=>{
                const h = s[u], d = h.snapshot, p = h.src, m = typeof p == "string" ? df(this, p) : p;
                if (!m) return;
                const x = wo(m, {
                    id: u,
                    parent: n.self,
                    syncSnapshot: h.syncSnapshot,
                    snapshot: d,
                    src: p,
                    systemId: h.systemId
                });
                r[u] = x;
            });
            function o(u, h) {
                if (h instanceof aa) return h;
                try {
                    return u.machine.getStateNodeById(h.id);
                } catch  {}
            }
            function i(u, h) {
                if (!h || typeof h != "object") return {};
                const d = {};
                for(const p in h){
                    const m = h[p];
                    for (const x of m){
                        const w = o(u, x);
                        w && (d[p] ??= [], d[p].push(w));
                    }
                }
                return d;
            }
            const a = i(this.root, t.historyValue), l = Ei({
                ...t,
                children: r,
                _nodes: Array.from(sa(ia(this.root, t.value))),
                historyValue: a
            }, this), f = new Set;
            function c(u, h) {
                if (!f.has(u)) {
                    f.add(u);
                    for(const d in u){
                        const p = u[d];
                        if (p && typeof p == "object") {
                            if ("xstate$$type" in p && p.xstate$$type === hf) {
                                u[d] = h[p.id];
                                continue;
                            }
                            c(p, h);
                        }
                    }
                }
            }
            return c(l.context, r), l;
        }
    }
    function H2(e, t, n, r, { event: s }) {
        const o = typeof s == "function" ? s(n, r) : s;
        return [
            t,
            {
                event: o
            },
            void 0
        ];
    }
    function N2(e, { event: t }) {
        e.defer(()=>e.emit(t));
    }
    function Ng(e) {
        function t(n, r) {}
        return t.type = "xstate.emit", t.event = e, t.resolve = H2, t.execute = N2, t;
    }
    let Vu = function(e) {
        return e.Parent = "#_parent", e.Internal = "#_internal", e;
    }({});
    function B2(e, t, n, r, { to: s, event: o, id: i, delay: a }, l) {
        const f = t.machine.implementations.delays;
        if (typeof o == "string") throw new Error(`Only event objects may be used with sendTo; use sendTo({ type: "${o}" }) instead`);
        const c = typeof o == "function" ? o(n, r) : o;
        let u;
        if (typeof a == "string") {
            const p = f && f[a];
            u = typeof p == "function" ? p(n, r) : p;
        } else u = typeof a == "function" ? a(n, r) : a;
        const h = typeof s == "function" ? s(n, r) : s;
        let d;
        if (typeof h == "string") {
            if (h === Vu.Parent ? d = e.self._parent : h === Vu.Internal ? d = e.self : h.startsWith("#_") ? d = t.children[h.slice(2)] : d = l.deferredActorIds?.includes(h) ? h : t.children[h], !d) throw new Error(`Unable to send event to actor '${h}' from machine '${t.machine.id}'.`);
        } else d = h || e.self;
        return [
            t,
            {
                to: d,
                targetId: typeof h == "string" ? h : void 0,
                event: c,
                id: i,
                delay: u
            },
            void 0
        ];
    }
    function $2(e, t, n) {
        typeof n.to == "string" && (n.to = t.children[n.to]);
    }
    function V2(e, t) {
        e.defer(()=>{
            const { to: n, event: r, delay: s, id: o } = t;
            if (typeof s == "number") {
                e.system.scheduler.schedule(e.self, n, r, s, o);
                return;
            }
            e.system._relay(e.self, n, r.type === Wv ? Sg(e.self.id, r.data) : r);
        });
    }
    function xf(e, t, n) {
        function r(s, o) {}
        return r.type = "xstate.sendTo", r.to = e, r.event = t, r.id = n?.id, r.delay = n?.delay, r.resolve = B2, r.retryResolve = $2, r.execute = V2, r;
    }
    function W2(e, t) {
        return xf(Vu.Parent, e, t);
    }
    function K2(e, t, n, r, { collect: s }) {
        const o = [], i = function(l) {
            o.push(l);
        };
        return i.assign = (...a)=>{
            o.push(vo(...a));
        }, i.cancel = (...a)=>{
            o.push(pf(...a));
        }, i.raise = (...a)=>{
            o.push(vf(...a));
        }, i.sendTo = (...a)=>{
            o.push(xf(...a));
        }, i.sendParent = (...a)=>{
            o.push(W2(...a));
        }, i.spawnChild = (...a)=>{
            o.push(gf(...a));
        }, i.stopChild = (...a)=>{
            o.push(Fa(...a));
        }, i.emit = (...a)=>{
            o.push(Ng(...a));
        }, s({
            context: n.context,
            event: n.event,
            enqueue: i,
            check: (a)=>za(a, t.context, n.event, t),
            self: e.self,
            system: e.system
        }, r), [
            t,
            void 0,
            o
        ];
    }
    function G2(e) {
        function t(n, r) {}
        return t.type = "xstate.enqueueActions", t.collect = e, t.resolve = K2, t;
    }
    function Q2(e, t, n, r, { value: s, label: o }) {
        return [
            t,
            {
                value: typeof s == "function" ? s(n, r) : s,
                label: o
            },
            void 0
        ];
    }
    function J2({ logger: e }, { value: t, label: n }) {
        n ? e(n, t) : e(t);
    }
    function Y2(e = ({ context: n, event: r })=>({
            context: n,
            event: r
        }), t) {
        function n(r, s) {}
        return n.type = "xstate.log", n.value = e, n.label = t, n.resolve = Q2, n.execute = J2, n;
    }
    function X2(e, t) {
        const n = vn(t);
        if (!n.some((s)=>Og(e.type, s))) {
            const s = n.length === 1 ? `type matching "${n[0]}"` : `one of types matching "${n.join('", "')}"`;
            throw new Error(`Expected event ${JSON.stringify(e)} to have ${s}`);
        }
    }
    function Z2(e, t) {
        return new bf(e, t);
    }
    function Bg({ schemas: e, actors: t, actions: n, guards: r, delays: s }) {
        return {
            assign: vo,
            sendTo: xf,
            raise: vf,
            log: Y2,
            cancel: pf,
            stopChild: Fa,
            enqueueActions: G2,
            emit: Ng,
            spawnChild: gf,
            createStateConfig: (o)=>o,
            createAction: (o)=>o,
            createMachine: (o)=>Z2({
                    ...o,
                    schemas: e
                }, {
                    actors: t,
                    actions: n,
                    guards: r,
                    delays: s
                }),
            extend: (o)=>Bg({
                    schemas: e,
                    actors: t,
                    actions: {
                        ...n,
                        ...o.actions
                    },
                    guards: {
                        ...r,
                        ...o.guards
                    },
                    delays: {
                        ...s,
                        ...o.delays
                    }
                })
        };
    }
    const q2 = {
        timeout: 1 / 0
    };
    function eb(e, t, n) {
        const r = {
            ...q2,
            ...n
        };
        return new Promise((s, o)=>{
            const { signal: i } = r;
            if (i?.aborted) {
                o(i.reason);
                return;
            }
            let a = !1;
            const l = r.timeout === 1 / 0 ? void 0 : setTimeout(()=>{
                f(), o(new Error(`Timeout of ${r.timeout} ms exceeded`));
            }, r.timeout), f = ()=>{
                clearTimeout(l), a = !0, h?.unsubscribe(), u && i.removeEventListener("abort", u);
            };
            function c(d) {
                t(d) && (f(), s(d));
            }
            let u, h;
            c(e.getSnapshot()), !a && (i && (u = ()=>{
                f(), o(i.reason);
            }, i.addEventListener("abort", u)), h = e.subscribe({
                next: c,
                error: (d)=>{
                    f(), o(d);
                },
                complete: ()=>{
                    f(), o(new Error("Actor terminated without satisfying predicate"));
                }
            }), a && h.unsubscribe());
        });
    }
    var fn = {}, pe = {}, rt = {}, Sf = {}, Na = {};
    Object.defineProperty(Na, "__esModule", {
        value: !0
    });
    Na.crypto = void 0;
    Na.crypto = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    (function(e) {
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.wrapXOFConstructorWithOpts = e.wrapConstructorWithOpts = e.wrapConstructor = e.Hash = e.nextTick = e.swap32IfBE = e.byteSwapIfBE = e.swap8IfBE = e.isLE = void 0, e.isBytes = n, e.anumber = r, e.abytes = s, e.ahash = o, e.aexists = i, e.aoutput = a, e.u8 = l, e.u32 = f, e.clean = c, e.createView = u, e.rotr = h, e.rotl = d, e.byteSwap = p, e.byteSwap32 = m, e.bytesToHex = _, e.hexToBytes = P, e.asyncLoop = N, e.utf8ToBytes = F, e.bytesToUtf8 = J, e.toBytes = K, e.kdfInputToBytes = se, e.concatBytes = H, e.checkOpts = y, e.createHasher = S, e.createOptHasher = I, e.createXOFer = k, e.randomBytes = M;
        const t = Na;
        function n(v) {
            return v instanceof Uint8Array || ArrayBuffer.isView(v) && v.constructor.name === "Uint8Array";
        }
        function r(v) {
            if (!Number.isSafeInteger(v) || v < 0) throw new Error("positive integer expected, got " + v);
        }
        function s(v, ...T) {
            if (!n(v)) throw new Error("Uint8Array expected");
            if (T.length > 0 && !T.includes(v.length)) throw new Error("Uint8Array expected of length " + T + ", got length=" + v.length);
        }
        function o(v) {
            if (typeof v != "function" || typeof v.create != "function") throw new Error("Hash should be wrapped by utils.createHasher");
            r(v.outputLen), r(v.blockLen);
        }
        function i(v, T = !0) {
            if (v.destroyed) throw new Error("Hash instance has been destroyed");
            if (T && v.finished) throw new Error("Hash#digest() has already been called");
        }
        function a(v, T) {
            s(v);
            const z = T.outputLen;
            if (v.length < z) throw new Error("digestInto() expects output buffer of length at least " + z);
        }
        function l(v) {
            return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
        }
        function f(v) {
            return new Uint32Array(v.buffer, v.byteOffset, Math.floor(v.byteLength / 4));
        }
        function c(...v) {
            for(let T = 0; T < v.length; T++)v[T].fill(0);
        }
        function u(v) {
            return new DataView(v.buffer, v.byteOffset, v.byteLength);
        }
        function h(v, T) {
            return v << 32 - T | v >>> T;
        }
        function d(v, T) {
            return v << T | v >>> 32 - T >>> 0;
        }
        e.isLE = (()=>new Uint8Array(new Uint32Array([
                287454020
            ]).buffer)[0] === 68)();
        function p(v) {
            return v << 24 & 4278190080 | v << 8 & 16711680 | v >>> 8 & 65280 | v >>> 24 & 255;
        }
        e.swap8IfBE = e.isLE ? (v)=>v : (v)=>p(v), e.byteSwapIfBE = e.swap8IfBE;
        function m(v) {
            for(let T = 0; T < v.length; T++)v[T] = p(v[T]);
            return v;
        }
        e.swap32IfBE = e.isLE ? (v)=>v : m;
        const x = (()=>typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function")(), w = Array.from({
            length: 256
        }, (v, T)=>T.toString(16).padStart(2, "0"));
        function _(v) {
            if (s(v), x) return v.toHex();
            let T = "";
            for(let z = 0; z < v.length; z++)T += w[v[z]];
            return T;
        }
        const g = {
            _0: 48,
            _9: 57,
            A: 65,
            F: 70,
            a: 97,
            f: 102
        };
        function A(v) {
            if (v >= g._0 && v <= g._9) return v - g._0;
            if (v >= g.A && v <= g.F) return v - (g.A - 10);
            if (v >= g.a && v <= g.f) return v - (g.a - 10);
        }
        function P(v) {
            if (typeof v != "string") throw new Error("hex string expected, got " + typeof v);
            if (x) return Uint8Array.fromHex(v);
            const T = v.length, z = T / 2;
            if (T % 2) throw new Error("hex string expected, got unpadded hex of length " + T);
            const V = new Uint8Array(z);
            for(let de = 0, Ie = 0; de < z; de++, Ie += 2){
                const Mr = A(v.charCodeAt(Ie)), Yt = A(v.charCodeAt(Ie + 1));
                if (Mr === void 0 || Yt === void 0) {
                    const Rr = v[Ie] + v[Ie + 1];
                    throw new Error('hex string expected, got non-hex character "' + Rr + '" at index ' + Ie);
                }
                V[de] = Mr * 16 + Yt;
            }
            return V;
        }
        const j = async ()=>{};
        e.nextTick = j;
        async function N(v, T, z) {
            let V = Date.now();
            for(let de = 0; de < v; de++){
                z(de);
                const Ie = Date.now() - V;
                Ie >= 0 && Ie < T || (await (0, e.nextTick)(), V += Ie);
            }
        }
        function F(v) {
            if (typeof v != "string") throw new Error("string expected");
            return new Uint8Array(new TextEncoder().encode(v));
        }
        function J(v) {
            return new TextDecoder().decode(v);
        }
        function K(v) {
            return typeof v == "string" && (v = F(v)), s(v), v;
        }
        function se(v) {
            return typeof v == "string" && (v = F(v)), s(v), v;
        }
        function H(...v) {
            let T = 0;
            for(let V = 0; V < v.length; V++){
                const de = v[V];
                s(de), T += de.length;
            }
            const z = new Uint8Array(T);
            for(let V = 0, de = 0; V < v.length; V++){
                const Ie = v[V];
                z.set(Ie, de), de += Ie.length;
            }
            return z;
        }
        function y(v, T) {
            if (T !== void 0 && {}.toString.call(T) !== "[object Object]") throw new Error("options should be object or undefined");
            return Object.assign(v, T);
        }
        class L {
        }
        e.Hash = L;
        function S(v) {
            const T = (V)=>v().update(K(V)).digest(), z = v();
            return T.outputLen = z.outputLen, T.blockLen = z.blockLen, T.create = ()=>v(), T;
        }
        function I(v) {
            const T = (V, de)=>v(de).update(K(V)).digest(), z = v({});
            return T.outputLen = z.outputLen, T.blockLen = z.blockLen, T.create = (V)=>v(V), T;
        }
        function k(v) {
            const T = (V, de)=>v(de).update(K(V)).digest(), z = v({});
            return T.outputLen = z.outputLen, T.blockLen = z.blockLen, T.create = (V)=>v(V), T;
        }
        e.wrapConstructor = S, e.wrapConstructorWithOpts = I, e.wrapXOFConstructorWithOpts = k;
        function M(v = 32) {
            if (t.crypto && typeof t.crypto.getRandomValues == "function") return t.crypto.getRandomValues(new Uint8Array(v));
            if (t.crypto && typeof t.crypto.randomBytes == "function") return Uint8Array.from(t.crypto.randomBytes(v));
            throw new Error("crypto.getRandomValues must be defined");
        }
    })(Sf);
    Object.defineProperty(rt, "__esModule", {
        value: !0
    });
    rt.SHA512_IV = rt.SHA384_IV = rt.SHA224_IV = rt.SHA256_IV = rt.HashMD = void 0;
    rt.setBigUint64 = $g;
    rt.Chi = tb;
    rt.Maj = nb;
    const qt = Sf;
    function $g(e, t, n, r) {
        if (typeof e.setBigUint64 == "function") return e.setBigUint64(t, n, r);
        const s = BigInt(32), o = BigInt(4294967295), i = Number(n >> s & o), a = Number(n & o), l = r ? 4 : 0, f = r ? 0 : 4;
        e.setUint32(t + l, i, r), e.setUint32(t + f, a, r);
    }
    function tb(e, t, n) {
        return e & t ^ ~e & n;
    }
    function nb(e, t, n) {
        return e & t ^ e & n ^ t & n;
    }
    class rb extends qt.Hash {
        constructor(t, n, r, s){
            super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = n, this.padOffset = r, this.isLE = s, this.buffer = new Uint8Array(t), this.view = (0, qt.createView)(this.buffer);
        }
        update(t) {
            (0, qt.aexists)(this), t = (0, qt.toBytes)(t), (0, qt.abytes)(t);
            const { view: n, buffer: r, blockLen: s } = this, o = t.length;
            for(let i = 0; i < o;){
                const a = Math.min(s - this.pos, o - i);
                if (a === s) {
                    const l = (0, qt.createView)(t);
                    for(; s <= o - i; i += s)this.process(l, i);
                    continue;
                }
                r.set(t.subarray(i, i + a), this.pos), this.pos += a, i += a, this.pos === s && (this.process(n, 0), this.pos = 0);
            }
            return this.length += t.length, this.roundClean(), this;
        }
        digestInto(t) {
            (0, qt.aexists)(this), (0, qt.aoutput)(t, this), this.finished = !0;
            const { buffer: n, view: r, blockLen: s, isLE: o } = this;
            let { pos: i } = this;
            n[i++] = 128, (0, qt.clean)(this.buffer.subarray(i)), this.padOffset > s - i && (this.process(r, 0), i = 0);
            for(let u = i; u < s; u++)n[u] = 0;
            $g(r, s - 8, BigInt(this.length * 8), o), this.process(r, 0);
            const a = (0, qt.createView)(t), l = this.outputLen;
            if (l % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
            const f = l / 4, c = this.get();
            if (f > c.length) throw new Error("_sha2: outputLen bigger than state");
            for(let u = 0; u < f; u++)a.setUint32(4 * u, c[u], o);
        }
        digest() {
            const { buffer: t, outputLen: n } = this;
            this.digestInto(t);
            const r = t.slice(0, n);
            return this.destroy(), r;
        }
        _cloneInto(t) {
            t || (t = new this.constructor), t.set(...this.get());
            const { blockLen: n, buffer: r, length: s, finished: o, destroyed: i, pos: a } = this;
            return t.destroyed = i, t.finished = o, t.length = s, t.pos = a, s % n && t.buffer.set(r), t;
        }
        clone() {
            return this._cloneInto();
        }
    }
    rt.HashMD = rb;
    rt.SHA256_IV = Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
    ]);
    rt.SHA224_IV = Uint32Array.from([
        3238371032,
        914150663,
        812702999,
        4144912697,
        4290775857,
        1750603025,
        1694076839,
        3204075428
    ]);
    rt.SHA384_IV = Uint32Array.from([
        3418070365,
        3238371032,
        1654270250,
        914150663,
        2438529370,
        812702999,
        355462360,
        4144912697,
        1731405415,
        4290775857,
        2394180231,
        1750603025,
        3675008525,
        1694076839,
        1203062813,
        3204075428
    ]);
    rt.SHA512_IV = Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
    ]);
    var ne = {};
    Object.defineProperty(ne, "__esModule", {
        value: !0
    });
    ne.toBig = ne.shrSL = ne.shrSH = ne.rotrSL = ne.rotrSH = ne.rotrBL = ne.rotrBH = ne.rotr32L = ne.rotr32H = ne.rotlSL = ne.rotlSH = ne.rotlBL = ne.rotlBH = ne.add5L = ne.add5H = ne.add4L = ne.add4H = ne.add3L = ne.add3H = void 0;
    ne.add = sy;
    ne.fromBig = kf;
    ne.split = Vg;
    const ii = BigInt(2 ** 32 - 1), Wu = BigInt(32);
    function kf(e, t = !1) {
        return t ? {
            h: Number(e & ii),
            l: Number(e >> Wu & ii)
        } : {
            h: Number(e >> Wu & ii) | 0,
            l: Number(e & ii) | 0
        };
    }
    function Vg(e, t = !1) {
        const n = e.length;
        let r = new Uint32Array(n), s = new Uint32Array(n);
        for(let o = 0; o < n; o++){
            const { h: i, l: a } = kf(e[o], t);
            [r[o], s[o]] = [
                i,
                a
            ];
        }
        return [
            r,
            s
        ];
    }
    const Wg = (e, t)=>BigInt(e >>> 0) << Wu | BigInt(t >>> 0);
    ne.toBig = Wg;
    const Kg = (e, t, n)=>e >>> n;
    ne.shrSH = Kg;
    const Gg = (e, t, n)=>e << 32 - n | t >>> n;
    ne.shrSL = Gg;
    const Qg = (e, t, n)=>e >>> n | t << 32 - n;
    ne.rotrSH = Qg;
    const Jg = (e, t, n)=>e << 32 - n | t >>> n;
    ne.rotrSL = Jg;
    const Yg = (e, t, n)=>e << 64 - n | t >>> n - 32;
    ne.rotrBH = Yg;
    const Xg = (e, t, n)=>e >>> n - 32 | t << 64 - n;
    ne.rotrBL = Xg;
    const Zg = (e, t)=>t;
    ne.rotr32H = Zg;
    const qg = (e, t)=>e;
    ne.rotr32L = qg;
    const ey = (e, t, n)=>e << n | t >>> 32 - n;
    ne.rotlSH = ey;
    const ty = (e, t, n)=>t << n | e >>> 32 - n;
    ne.rotlSL = ty;
    const ny = (e, t, n)=>t << n - 32 | e >>> 64 - n;
    ne.rotlBH = ny;
    const ry = (e, t, n)=>e << n - 32 | t >>> 64 - n;
    ne.rotlBL = ry;
    function sy(e, t, n, r) {
        const s = (t >>> 0) + (r >>> 0);
        return {
            h: e + n + (s / 2 ** 32 | 0) | 0,
            l: s | 0
        };
    }
    const oy = (e, t, n)=>(e >>> 0) + (t >>> 0) + (n >>> 0);
    ne.add3L = oy;
    const iy = (e, t, n, r)=>t + n + r + (e / 2 ** 32 | 0) | 0;
    ne.add3H = iy;
    const ay = (e, t, n, r)=>(e >>> 0) + (t >>> 0) + (n >>> 0) + (r >>> 0);
    ne.add4L = ay;
    const ly = (e, t, n, r, s)=>t + n + r + s + (e / 2 ** 32 | 0) | 0;
    ne.add4H = ly;
    const uy = (e, t, n, r, s)=>(e >>> 0) + (t >>> 0) + (n >>> 0) + (r >>> 0) + (s >>> 0);
    ne.add5L = uy;
    const cy = (e, t, n, r, s, o)=>t + n + r + s + o + (e / 2 ** 32 | 0) | 0;
    ne.add5H = cy;
    const sb = {
        fromBig: kf,
        split: Vg,
        toBig: Wg,
        shrSH: Kg,
        shrSL: Gg,
        rotrSH: Qg,
        rotrSL: Jg,
        rotrBH: Yg,
        rotrBL: Xg,
        rotr32H: Zg,
        rotr32L: qg,
        rotlSH: ey,
        rotlSL: ty,
        rotlBH: ny,
        rotlBL: ry,
        add: sy,
        add3L: oy,
        add3H: iy,
        add4L: ay,
        add4H: ly,
        add5H: cy,
        add5L: uy
    };
    ne.default = sb;
    Object.defineProperty(pe, "__esModule", {
        value: !0
    });
    pe.sha512_224 = pe.sha512_256 = pe.sha384 = pe.sha512 = pe.sha224 = pe.sha256 = pe.SHA512_256 = pe.SHA512_224 = pe.SHA384 = pe.SHA512 = pe.SHA224 = pe.SHA256 = void 0;
    const te = rt, re = ne, Oe = Sf, ob = Uint32Array.from([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
    ]), On = new Uint32Array(64);
    class Cf extends te.HashMD {
        constructor(t = 32){
            super(64, t, 8, !1), this.A = te.SHA256_IV[0] | 0, this.B = te.SHA256_IV[1] | 0, this.C = te.SHA256_IV[2] | 0, this.D = te.SHA256_IV[3] | 0, this.E = te.SHA256_IV[4] | 0, this.F = te.SHA256_IV[5] | 0, this.G = te.SHA256_IV[6] | 0, this.H = te.SHA256_IV[7] | 0;
        }
        get() {
            const { A: t, B: n, C: r, D: s, E: o, F: i, G: a, H: l } = this;
            return [
                t,
                n,
                r,
                s,
                o,
                i,
                a,
                l
            ];
        }
        set(t, n, r, s, o, i, a, l) {
            this.A = t | 0, this.B = n | 0, this.C = r | 0, this.D = s | 0, this.E = o | 0, this.F = i | 0, this.G = a | 0, this.H = l | 0;
        }
        process(t, n) {
            for(let u = 0; u < 16; u++, n += 4)On[u] = t.getUint32(n, !1);
            for(let u = 16; u < 64; u++){
                const h = On[u - 15], d = On[u - 2], p = (0, Oe.rotr)(h, 7) ^ (0, Oe.rotr)(h, 18) ^ h >>> 3, m = (0, Oe.rotr)(d, 17) ^ (0, Oe.rotr)(d, 19) ^ d >>> 10;
                On[u] = m + On[u - 7] + p + On[u - 16] | 0;
            }
            let { A: r, B: s, C: o, D: i, E: a, F: l, G: f, H: c } = this;
            for(let u = 0; u < 64; u++){
                const h = (0, Oe.rotr)(a, 6) ^ (0, Oe.rotr)(a, 11) ^ (0, Oe.rotr)(a, 25), d = c + h + (0, te.Chi)(a, l, f) + ob[u] + On[u] | 0, m = ((0, Oe.rotr)(r, 2) ^ (0, Oe.rotr)(r, 13) ^ (0, Oe.rotr)(r, 22)) + (0, te.Maj)(r, s, o) | 0;
                c = f, f = l, l = a, a = i + d | 0, i = o, o = s, s = r, r = d + m | 0;
            }
            r = r + this.A | 0, s = s + this.B | 0, o = o + this.C | 0, i = i + this.D | 0, a = a + this.E | 0, l = l + this.F | 0, f = f + this.G | 0, c = c + this.H | 0, this.set(r, s, o, i, a, l, f, c);
        }
        roundClean() {
            (0, Oe.clean)(On);
        }
        destroy() {
            this.set(0, 0, 0, 0, 0, 0, 0, 0), (0, Oe.clean)(this.buffer);
        }
    }
    pe.SHA256 = Cf;
    class fy extends Cf {
        constructor(){
            super(28), this.A = te.SHA224_IV[0] | 0, this.B = te.SHA224_IV[1] | 0, this.C = te.SHA224_IV[2] | 0, this.D = te.SHA224_IV[3] | 0, this.E = te.SHA224_IV[4] | 0, this.F = te.SHA224_IV[5] | 0, this.G = te.SHA224_IV[6] | 0, this.H = te.SHA224_IV[7] | 0;
        }
    }
    pe.SHA224 = fy;
    const dy = (()=>re.split([
            "0x428a2f98d728ae22",
            "0x7137449123ef65cd",
            "0xb5c0fbcfec4d3b2f",
            "0xe9b5dba58189dbbc",
            "0x3956c25bf348b538",
            "0x59f111f1b605d019",
            "0x923f82a4af194f9b",
            "0xab1c5ed5da6d8118",
            "0xd807aa98a3030242",
            "0x12835b0145706fbe",
            "0x243185be4ee4b28c",
            "0x550c7dc3d5ffb4e2",
            "0x72be5d74f27b896f",
            "0x80deb1fe3b1696b1",
            "0x9bdc06a725c71235",
            "0xc19bf174cf692694",
            "0xe49b69c19ef14ad2",
            "0xefbe4786384f25e3",
            "0x0fc19dc68b8cd5b5",
            "0x240ca1cc77ac9c65",
            "0x2de92c6f592b0275",
            "0x4a7484aa6ea6e483",
            "0x5cb0a9dcbd41fbd4",
            "0x76f988da831153b5",
            "0x983e5152ee66dfab",
            "0xa831c66d2db43210",
            "0xb00327c898fb213f",
            "0xbf597fc7beef0ee4",
            "0xc6e00bf33da88fc2",
            "0xd5a79147930aa725",
            "0x06ca6351e003826f",
            "0x142929670a0e6e70",
            "0x27b70a8546d22ffc",
            "0x2e1b21385c26c926",
            "0x4d2c6dfc5ac42aed",
            "0x53380d139d95b3df",
            "0x650a73548baf63de",
            "0x766a0abb3c77b2a8",
            "0x81c2c92e47edaee6",
            "0x92722c851482353b",
            "0xa2bfe8a14cf10364",
            "0xa81a664bbc423001",
            "0xc24b8b70d0f89791",
            "0xc76c51a30654be30",
            "0xd192e819d6ef5218",
            "0xd69906245565a910",
            "0xf40e35855771202a",
            "0x106aa07032bbd1b8",
            "0x19a4c116b8d2d0c8",
            "0x1e376c085141ab53",
            "0x2748774cdf8eeb99",
            "0x34b0bcb5e19b48a8",
            "0x391c0cb3c5c95a63",
            "0x4ed8aa4ae3418acb",
            "0x5b9cca4f7763e373",
            "0x682e6ff3d6b2b8a3",
            "0x748f82ee5defb2fc",
            "0x78a5636f43172f60",
            "0x84c87814a1f0ab72",
            "0x8cc702081a6439ec",
            "0x90befffa23631e28",
            "0xa4506cebde82bde9",
            "0xbef9a3f7b2c67915",
            "0xc67178f2e372532b",
            "0xca273eceea26619c",
            "0xd186b8c721c0c207",
            "0xeada7dd6cde0eb1e",
            "0xf57d4f7fee6ed178",
            "0x06f067aa72176fba",
            "0x0a637dc5a2c898a6",
            "0x113f9804bef90dae",
            "0x1b710b35131c471b",
            "0x28db77f523047d84",
            "0x32caab7b40c72493",
            "0x3c9ebe0a15c9bebc",
            "0x431d67c49c100d4c",
            "0x4cc5d4becb3e42b6",
            "0x597f299cfc657e2a",
            "0x5fcb6fab3ad6faec",
            "0x6c44198c4a475817"
        ].map((e)=>BigInt(e))))(), ib = (()=>dy[0])(), ab = (()=>dy[1])(), Tn = new Uint32Array(80), jn = new Uint32Array(80);
    class zo extends te.HashMD {
        constructor(t = 64){
            super(128, t, 16, !1), this.Ah = te.SHA512_IV[0] | 0, this.Al = te.SHA512_IV[1] | 0, this.Bh = te.SHA512_IV[2] | 0, this.Bl = te.SHA512_IV[3] | 0, this.Ch = te.SHA512_IV[4] | 0, this.Cl = te.SHA512_IV[5] | 0, this.Dh = te.SHA512_IV[6] | 0, this.Dl = te.SHA512_IV[7] | 0, this.Eh = te.SHA512_IV[8] | 0, this.El = te.SHA512_IV[9] | 0, this.Fh = te.SHA512_IV[10] | 0, this.Fl = te.SHA512_IV[11] | 0, this.Gh = te.SHA512_IV[12] | 0, this.Gl = te.SHA512_IV[13] | 0, this.Hh = te.SHA512_IV[14] | 0, this.Hl = te.SHA512_IV[15] | 0;
        }
        get() {
            const { Ah: t, Al: n, Bh: r, Bl: s, Ch: o, Cl: i, Dh: a, Dl: l, Eh: f, El: c, Fh: u, Fl: h, Gh: d, Gl: p, Hh: m, Hl: x } = this;
            return [
                t,
                n,
                r,
                s,
                o,
                i,
                a,
                l,
                f,
                c,
                u,
                h,
                d,
                p,
                m,
                x
            ];
        }
        set(t, n, r, s, o, i, a, l, f, c, u, h, d, p, m, x) {
            this.Ah = t | 0, this.Al = n | 0, this.Bh = r | 0, this.Bl = s | 0, this.Ch = o | 0, this.Cl = i | 0, this.Dh = a | 0, this.Dl = l | 0, this.Eh = f | 0, this.El = c | 0, this.Fh = u | 0, this.Fl = h | 0, this.Gh = d | 0, this.Gl = p | 0, this.Hh = m | 0, this.Hl = x | 0;
        }
        process(t, n) {
            for(let g = 0; g < 16; g++, n += 4)Tn[g] = t.getUint32(n), jn[g] = t.getUint32(n += 4);
            for(let g = 16; g < 80; g++){
                const A = Tn[g - 15] | 0, P = jn[g - 15] | 0, j = re.rotrSH(A, P, 1) ^ re.rotrSH(A, P, 8) ^ re.shrSH(A, P, 7), N = re.rotrSL(A, P, 1) ^ re.rotrSL(A, P, 8) ^ re.shrSL(A, P, 7), F = Tn[g - 2] | 0, J = jn[g - 2] | 0, K = re.rotrSH(F, J, 19) ^ re.rotrBH(F, J, 61) ^ re.shrSH(F, J, 6), se = re.rotrSL(F, J, 19) ^ re.rotrBL(F, J, 61) ^ re.shrSL(F, J, 6), H = re.add4L(N, se, jn[g - 7], jn[g - 16]), y = re.add4H(H, j, K, Tn[g - 7], Tn[g - 16]);
                Tn[g] = y | 0, jn[g] = H | 0;
            }
            let { Ah: r, Al: s, Bh: o, Bl: i, Ch: a, Cl: l, Dh: f, Dl: c, Eh: u, El: h, Fh: d, Fl: p, Gh: m, Gl: x, Hh: w, Hl: _ } = this;
            for(let g = 0; g < 80; g++){
                const A = re.rotrSH(u, h, 14) ^ re.rotrSH(u, h, 18) ^ re.rotrBH(u, h, 41), P = re.rotrSL(u, h, 14) ^ re.rotrSL(u, h, 18) ^ re.rotrBL(u, h, 41), j = u & d ^ ~u & m, N = h & p ^ ~h & x, F = re.add5L(_, P, N, ab[g], jn[g]), J = re.add5H(F, w, A, j, ib[g], Tn[g]), K = F | 0, se = re.rotrSH(r, s, 28) ^ re.rotrBH(r, s, 34) ^ re.rotrBH(r, s, 39), H = re.rotrSL(r, s, 28) ^ re.rotrBL(r, s, 34) ^ re.rotrBL(r, s, 39), y = r & o ^ r & a ^ o & a, L = s & i ^ s & l ^ i & l;
                w = m | 0, _ = x | 0, m = d | 0, x = p | 0, d = u | 0, p = h | 0, { h: u, l: h } = re.add(f | 0, c | 0, J | 0, K | 0), f = a | 0, c = l | 0, a = o | 0, l = i | 0, o = r | 0, i = s | 0;
                const S = re.add3L(K, H, L);
                r = re.add3H(S, J, se, y), s = S | 0;
            }
            ({ h: r, l: s } = re.add(this.Ah | 0, this.Al | 0, r | 0, s | 0)), { h: o, l: i } = re.add(this.Bh | 0, this.Bl | 0, o | 0, i | 0), { h: a, l } = re.add(this.Ch | 0, this.Cl | 0, a | 0, l | 0), { h: f, l: c } = re.add(this.Dh | 0, this.Dl | 0, f | 0, c | 0), { h: u, l: h } = re.add(this.Eh | 0, this.El | 0, u | 0, h | 0), { h: d, l: p } = re.add(this.Fh | 0, this.Fl | 0, d | 0, p | 0), { h: m, l: x } = re.add(this.Gh | 0, this.Gl | 0, m | 0, x | 0), { h: w, l: _ } = re.add(this.Hh | 0, this.Hl | 0, w | 0, _ | 0), this.set(r, s, o, i, a, l, f, c, u, h, d, p, m, x, w, _);
        }
        roundClean() {
            (0, Oe.clean)(Tn, jn);
        }
        destroy() {
            (0, Oe.clean)(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    }
    pe.SHA512 = zo;
    class hy extends zo {
        constructor(){
            super(48), this.Ah = te.SHA384_IV[0] | 0, this.Al = te.SHA384_IV[1] | 0, this.Bh = te.SHA384_IV[2] | 0, this.Bl = te.SHA384_IV[3] | 0, this.Ch = te.SHA384_IV[4] | 0, this.Cl = te.SHA384_IV[5] | 0, this.Dh = te.SHA384_IV[6] | 0, this.Dl = te.SHA384_IV[7] | 0, this.Eh = te.SHA384_IV[8] | 0, this.El = te.SHA384_IV[9] | 0, this.Fh = te.SHA384_IV[10] | 0, this.Fl = te.SHA384_IV[11] | 0, this.Gh = te.SHA384_IV[12] | 0, this.Gl = te.SHA384_IV[13] | 0, this.Hh = te.SHA384_IV[14] | 0, this.Hl = te.SHA384_IV[15] | 0;
        }
    }
    pe.SHA384 = hy;
    const Ye = Uint32Array.from([
        2352822216,
        424955298,
        1944164710,
        2312950998,
        502970286,
        855612546,
        1738396948,
        1479516111,
        258812777,
        2077511080,
        2011393907,
        79989058,
        1067287976,
        1780299464,
        286451373,
        2446758561
    ]), Xe = Uint32Array.from([
        573645204,
        4230739756,
        2673172387,
        3360449730,
        596883563,
        1867755857,
        2520282905,
        1497426621,
        2519219938,
        2827943907,
        3193839141,
        1401305490,
        721525244,
        746961066,
        246885852,
        2177182882
    ]);
    class py extends zo {
        constructor(){
            super(28), this.Ah = Ye[0] | 0, this.Al = Ye[1] | 0, this.Bh = Ye[2] | 0, this.Bl = Ye[3] | 0, this.Ch = Ye[4] | 0, this.Cl = Ye[5] | 0, this.Dh = Ye[6] | 0, this.Dl = Ye[7] | 0, this.Eh = Ye[8] | 0, this.El = Ye[9] | 0, this.Fh = Ye[10] | 0, this.Fl = Ye[11] | 0, this.Gh = Ye[12] | 0, this.Gl = Ye[13] | 0, this.Hh = Ye[14] | 0, this.Hl = Ye[15] | 0;
        }
    }
    pe.SHA512_224 = py;
    class gy extends zo {
        constructor(){
            super(32), this.Ah = Xe[0] | 0, this.Al = Xe[1] | 0, this.Bh = Xe[2] | 0, this.Bl = Xe[3] | 0, this.Ch = Xe[4] | 0, this.Cl = Xe[5] | 0, this.Dh = Xe[6] | 0, this.Dl = Xe[7] | 0, this.Eh = Xe[8] | 0, this.El = Xe[9] | 0, this.Fh = Xe[10] | 0, this.Fl = Xe[11] | 0, this.Gh = Xe[12] | 0, this.Gl = Xe[13] | 0, this.Hh = Xe[14] | 0, this.Hl = Xe[15] | 0;
        }
    }
    pe.SHA512_256 = gy;
    pe.sha256 = (0, Oe.createHasher)(()=>new Cf);
    pe.sha224 = (0, Oe.createHasher)(()=>new fy);
    pe.sha512 = (0, Oe.createHasher)(()=>new zo);
    pe.sha384 = (0, Oe.createHasher)(()=>new hy);
    pe.sha512_256 = (0, Oe.createHasher)(()=>new gy);
    pe.sha512_224 = (0, Oe.createHasher)(()=>new py);
    Object.defineProperty(fn, "__esModule", {
        value: !0
    });
    fn.sha224 = fn.SHA224 = fn.sha256 = fn.SHA256 = void 0;
    const Ba = pe;
    fn.SHA256 = Ba.SHA256;
    fn.sha256 = Ba.sha256;
    fn.SHA224 = Ba.SHA224;
    fn.sha224 = Ba.sha224;
    function lb(e) {
        if (e.length >= 255) throw new TypeError("Alphabet too long");
        for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
        for(var r = 0; r < e.length; r++){
            var s = e.charAt(r), o = s.charCodeAt(0);
            if (t[o] !== 255) throw new TypeError(s + " is ambiguous");
            t[o] = r;
        }
        var i = e.length, a = e.charAt(0), l = Math.log(i) / Math.log(256), f = Math.log(256) / Math.log(i);
        function c(d) {
            if (d instanceof Uint8Array || (ArrayBuffer.isView(d) ? d = new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : Array.isArray(d) && (d = Uint8Array.from(d))), !(d instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (d.length === 0) return "";
            for(var p = 0, m = 0, x = 0, w = d.length; x !== w && d[x] === 0;)x++, p++;
            for(var _ = (w - x) * f + 1 >>> 0, g = new Uint8Array(_); x !== w;){
                for(var A = d[x], P = 0, j = _ - 1; (A !== 0 || P < m) && j !== -1; j--, P++)A += 256 * g[j] >>> 0, g[j] = A % i >>> 0, A = A / i >>> 0;
                if (A !== 0) throw new Error("Non-zero carry");
                m = P, x++;
            }
            for(var N = _ - m; N !== _ && g[N] === 0;)N++;
            for(var F = a.repeat(p); N < _; ++N)F += e.charAt(g[N]);
            return F;
        }
        function u(d) {
            if (typeof d != "string") throw new TypeError("Expected String");
            if (d.length === 0) return new Uint8Array;
            for(var p = 0, m = 0, x = 0; d[p] === a;)m++, p++;
            for(var w = (d.length - p) * l + 1 >>> 0, _ = new Uint8Array(w); d[p];){
                var g = d.charCodeAt(p);
                if (g > 255) return;
                var A = t[g];
                if (A === 255) return;
                for(var P = 0, j = w - 1; (A !== 0 || P < x) && j !== -1; j--, P++)A += i * _[j] >>> 0, _[j] = A % 256 >>> 0, A = A / 256 >>> 0;
                if (A !== 0) throw new Error("Non-zero carry");
                x = P, p++;
            }
            for(var N = w - x; N !== w && _[N] === 0;)N++;
            for(var F = new Uint8Array(m + (w - N)), J = m; N !== w;)F[J++] = _[N++];
            return F;
        }
        function h(d) {
            var p = u(d);
            if (p) return p;
            throw new Error("Non-base" + i + " character");
        }
        return {
            encode: c,
            decodeUnsafe: u,
            decode: h
        };
    }
    var ub = lb;
    const cb = ub, fb = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var db = cb(fb), El = db, hb = function(e) {
        function t(o) {
            var i = Uint8Array.from(o), a = e(i), l = i.length + 4, f = new Uint8Array(l);
            return f.set(i, 0), f.set(a.subarray(0, 4), i.length), El.encode(f, l);
        }
        function n(o) {
            var i = o.slice(0, -4), a = o.slice(-4), l = e(i);
            if (!(a[0] ^ l[0] | a[1] ^ l[1] | a[2] ^ l[2] | a[3] ^ l[3])) return i;
        }
        function r(o) {
            var i = El.decodeUnsafe(o);
            if (i) return n(i);
        }
        function s(o) {
            var i = El.decode(o), a = n(i);
            if (!a) throw new Error("Invalid checksum");
            return a;
        }
        return {
            encode: t,
            decode: s,
            decodeUnsafe: r
        };
    }, { sha256: ph } = fn, pb = hb;
    function gb(e) {
        return ph(ph(e));
    }
    var yb = pb(gb);
    const yy = fc(yb), Ef = "automerge:", If = (e)=>{
        const t = new RegExp(`^${Ef}(\\w+)$`), [, n] = e.match(t) || [], r = n, s = _y(r);
        if (!s) throw new Error("Invalid document URL: " + e);
        return {
            binaryDocumentId: s,
            documentId: r
        };
    }, Af = (e)=>{
        const t = e instanceof Uint8Array || typeof e == "string" ? e : "documentId" in e ? e.documentId : void 0, n = t instanceof Uint8Array ? Ku(t) : typeof t == "string" ? t : void 0;
        if (n === void 0) throw new Error("Invalid documentId: " + t);
        return Ef + n;
    }, mb = (e)=>{
        if (!e || !e.startsWith(Ef)) return !1;
        const t = e;
        try {
            const { documentId: n } = If(t);
            return my(n);
        } catch  {
            return !1;
        }
    }, my = (e)=>{
        const t = _y(e);
        if (t === void 0) return !1;
        const n = cv(t);
        return Pa(n);
    }, _b = (e)=>Pa(e), wb = ()=>{
        const e = cg(null, new Uint8Array(16));
        return Af({
            documentId: e
        });
    }, _y = (e)=>yy.decodeUnsafe(e), Ku = (e)=>yy.encode(e), Il = (e)=>{
        if (e instanceof Uint8Array) return Ku(e);
        if (mb(e)) return If(e).documentId;
        if (my(e)) return e;
        if (_b(e)) {
            console.warn("Future versions will not support UUIDs as document IDs; use Automerge URLs instead.");
            const t = fv(e);
            return Ku(t);
        }
        throw new Error(`Invalid AutomergeUrl: '${e}'`);
    };
    let Gu;
    try {
        Gu = new TextDecoder;
    } catch  {}
    let Z, mr, B = 0;
    const vb = 105, bb = 57342, xb = 57343, gh = 57337, yh = 6, Lr = {};
    let Ps = 11281e4, pn = 1681e4, ie = {}, Ce, la, ua = 0, bo = 0, Ue, Tt, je = [], Qu = [], ct, tt, Hs, mh = {
        useRecords: !1,
        mapsAsObjects: !0
    }, xo = !1, wy = 2;
    try {
        new Function("");
    } catch  {
        wy = 1 / 0;
    }
    class So {
        constructor(t){
            if (t && ((t.keyMap || t._keyMap) && !t.useRecords && (t.useRecords = !1, t.mapsAsObjects = !0), t.useRecords === !1 && t.mapsAsObjects === void 0 && (t.mapsAsObjects = !0), t.getStructures && (t.getShared = t.getStructures), t.getShared && !t.structures && ((t.structures = []).uninitialized = !0), t.keyMap)) {
                this.mapKey = new Map;
                for (let [n, r] of Object.entries(t.keyMap))this.mapKey.set(r, n);
            }
            Object.assign(this, t);
        }
        decodeKey(t) {
            return this.keyMap && this.mapKey.get(t) || t;
        }
        encodeKey(t) {
            return this.keyMap && this.keyMap.hasOwnProperty(t) ? this.keyMap[t] : t;
        }
        encodeKeys(t) {
            if (!this._keyMap) return t;
            let n = new Map;
            for (let [r, s] of Object.entries(t))n.set(this._keyMap.hasOwnProperty(r) ? this._keyMap[r] : r, s);
            return n;
        }
        decodeKeys(t) {
            if (!this._keyMap || t.constructor.name != "Map") return t;
            if (!this._mapKey) {
                this._mapKey = new Map;
                for (let [r, s] of Object.entries(this._keyMap))this._mapKey.set(s, r);
            }
            let n = {};
            return t.forEach((r, s)=>n[jt(this._mapKey.has(s) ? this._mapKey.get(s) : s)] = r), n;
        }
        mapDecode(t, n) {
            let r = this.decode(t);
            if (this._keyMap) switch(r.constructor.name){
                case "Array":
                    return r.map((s)=>this.decodeKeys(s));
            }
            return r;
        }
        decode(t, n) {
            if (Z) return Sy(()=>(Zu(), this ? this.decode(t, n) : So.prototype.decode.call(mh, t, n)));
            mr = n > -1 ? n : t.length, B = 0, bo = 0, la = null, Ue = null, Z = t;
            try {
                tt = t.dataView || (t.dataView = new DataView(t.buffer, t.byteOffset, t.byteLength));
            } catch (r) {
                throw Z = null, t instanceof Uint8Array ? r : new Error("Source must be a Uint8Array or Buffer but was a " + (t && typeof t == "object" ? t.constructor.name : typeof t));
            }
            if (this instanceof So) {
                if (ie = this, ct = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues), this.structures) return Ce = this.structures, ai();
                (!Ce || Ce.length > 0) && (Ce = []);
            } else ie = mh, (!Ce || Ce.length > 0) && (Ce = []), ct = null;
            return ai();
        }
        decodeMultiple(t, n) {
            let r, s = 0;
            try {
                let o = t.length;
                xo = !0;
                let i = this ? this.decode(t, o) : jf.decode(t, o);
                if (n) {
                    if (n(i) === !1) return;
                    for(; B < o;)if (s = B, n(ai()) === !1) return;
                } else {
                    for(r = [
                        i
                    ]; B < o;)s = B, r.push(ai());
                    return r;
                }
            } catch (o) {
                throw o.lastPosition = s, o.values = r, o;
            } finally{
                xo = !1, Zu();
            }
        }
    }
    function ai() {
        try {
            let e = le();
            if (Ue) {
                if (B >= Ue.postBundlePosition) {
                    let t = new Error("Unexpected bundle position");
                    throw t.incomplete = !0, t;
                }
                B = Ue.postBundlePosition, Ue = null;
            }
            if (B == mr) Ce = null, Z = null, Tt && (Tt = null);
            else if (B > mr) {
                let t = new Error("Unexpected end of CBOR data");
                throw t.incomplete = !0, t;
            } else if (!xo) throw new Error("Data read, but end of buffer not reached");
            return e;
        } catch (e) {
            throw Zu(), (e instanceof RangeError || e.message.startsWith("Unexpected end of buffer")) && (e.incomplete = !0), e;
        }
    }
    function le() {
        let e = Z[B++], t = e >> 5;
        if (e = e & 31, e > 23) switch(e){
            case 24:
                e = Z[B++];
                break;
            case 25:
                if (t == 7) return Eb();
                e = tt.getUint16(B), B += 2;
                break;
            case 26:
                if (t == 7) {
                    let n = tt.getFloat32(B);
                    if (ie.useFloat32 > 2) {
                        let r = Tf[(Z[B] & 127) << 1 | Z[B + 1] >> 7];
                        return B += 4, (r * n + (n > 0 ? .5 : -.5) >> 0) / r;
                    }
                    return B += 4, n;
                }
                e = tt.getUint32(B), B += 4;
                break;
            case 27:
                if (t == 7) {
                    let n = tt.getFloat64(B);
                    return B += 8, n;
                }
                if (t > 1) {
                    if (tt.getUint32(B) > 0) throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
                    e = tt.getUint32(B + 4);
                } else ie.int64AsNumber ? (e = tt.getUint32(B) * 4294967296, e += tt.getUint32(B + 4)) : e = tt.getBigUint64(B);
                B += 8;
                break;
            case 31:
                switch(t){
                    case 2:
                    case 3:
                        throw new Error("Indefinite length not supported for byte or text strings");
                    case 4:
                        let n = [], r, s = 0;
                        for(; (r = le()) != Lr;){
                            if (s >= Ps) throw new Error(`Array length exceeds ${Ps}`);
                            n[s++] = r;
                        }
                        return t == 4 ? n : t == 3 ? n.join("") : Buffer.concat(n);
                    case 5:
                        let o;
                        if (ie.mapsAsObjects) {
                            let i = {}, a = 0;
                            if (ie.keyMap) for(; (o = le()) != Lr;){
                                if (a++ >= pn) throw new Error(`Property count exceeds ${pn}`);
                                i[jt(ie.decodeKey(o))] = le();
                            }
                            else for(; (o = le()) != Lr;){
                                if (a++ >= pn) throw new Error(`Property count exceeds ${pn}`);
                                i[jt(o)] = le();
                            }
                            return i;
                        } else {
                            Hs && (ie.mapsAsObjects = !0, Hs = !1);
                            let i = new Map;
                            if (ie.keyMap) {
                                let a = 0;
                                for(; (o = le()) != Lr;){
                                    if (a++ >= pn) throw new Error(`Map size exceeds ${pn}`);
                                    i.set(ie.decodeKey(o), le());
                                }
                            } else {
                                let a = 0;
                                for(; (o = le()) != Lr;){
                                    if (a++ >= pn) throw new Error(`Map size exceeds ${pn}`);
                                    i.set(o, le());
                                }
                            }
                            return i;
                        }
                    case 7:
                        return Lr;
                    default:
                        throw new Error("Invalid major type for indefinite length " + t);
                }
            default:
                throw new Error("Unknown token " + e);
        }
        switch(t){
            case 0:
                return e;
            case 1:
                return ~e;
            case 2:
                return Cb(e);
            case 3:
                if (bo >= B) return la.slice(B - ua, (B += e) - ua);
                if (bo == 0 && mr < 140 && e < 32) {
                    let s = e < 16 ? vy(e) : kb(e);
                    if (s != null) return s;
                }
                return Sb(e);
            case 4:
                if (e >= Ps) throw new Error(`Array length exceeds ${Ps}`);
                let n = new Array(e);
                for(let s = 0; s < e; s++)n[s] = le();
                return n;
            case 5:
                if (e >= pn) throw new Error(`Map size exceeds ${Ps}`);
                if (ie.mapsAsObjects) {
                    let s = {};
                    if (ie.keyMap) for(let o = 0; o < e; o++)s[jt(ie.decodeKey(le()))] = le();
                    else for(let o = 0; o < e; o++)s[jt(le())] = le();
                    return s;
                } else {
                    Hs && (ie.mapsAsObjects = !0, Hs = !1);
                    let s = new Map;
                    if (ie.keyMap) for(let o = 0; o < e; o++)s.set(ie.decodeKey(le()), le());
                    else for(let o = 0; o < e; o++)s.set(le(), le());
                    return s;
                }
            case 6:
                if (e >= gh) {
                    let s = Ce[e & 8191];
                    if (s) return s.read || (s.read = Ju(s)), s.read();
                    if (e < 65536) {
                        if (e == xb) {
                            let o = ts(), i = le(), a = le();
                            Xu(i, a);
                            let l = {};
                            if (ie.keyMap) for(let f = 2; f < o; f++){
                                let c = ie.decodeKey(a[f - 2]);
                                l[jt(c)] = le();
                            }
                            else for(let f = 2; f < o; f++){
                                let c = a[f - 2];
                                l[jt(c)] = le();
                            }
                            return l;
                        } else if (e == bb) {
                            let o = ts(), i = le();
                            for(let a = 2; a < o; a++)Xu(i++, le());
                            return le();
                        } else if (e == gh) return Mb();
                        if (ie.getShared && (Of(), s = Ce[e & 8191], s)) return s.read || (s.read = Ju(s)), s.read();
                    }
                }
                let r = je[e];
                if (r) return r.handlesRead ? r(le) : r(le());
                {
                    let s = le();
                    for(let o = 0; o < Qu.length; o++){
                        let i = Qu[o](e, s);
                        if (i !== void 0) return i;
                    }
                    return new Ir(s, e);
                }
            case 7:
                switch(e){
                    case 20:
                        return !1;
                    case 21:
                        return !0;
                    case 22:
                        return null;
                    case 23:
                        return;
                    case 31:
                    default:
                        let s = (ct || ir())[e];
                        if (s !== void 0) return s;
                        throw new Error("Unknown token " + e);
                }
            default:
                if (isNaN(e)) {
                    let s = new Error("Unexpected end of CBOR data");
                    throw s.incomplete = !0, s;
                }
                throw new Error("Unknown CBOR token " + e);
        }
    }
    const _h = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
    function Ju(e) {
        if (!e) throw new Error("Structure is required in record definition");
        function t() {
            let n = Z[B++];
            if (n = n & 31, n > 23) switch(n){
                case 24:
                    n = Z[B++];
                    break;
                case 25:
                    n = tt.getUint16(B), B += 2;
                    break;
                case 26:
                    n = tt.getUint32(B), B += 4;
                    break;
                default:
                    throw new Error("Expected array header, but got " + Z[B - 1]);
            }
            let r = this.compiledReader;
            for(; r;){
                if (r.propertyCount === n) return r(le);
                r = r.next;
            }
            if (this.slowReads++ >= wy) {
                let o = this.length == n ? this : this.slice(0, n);
                return r = ie.keyMap ? new Function("r", "return {" + o.map((i)=>ie.decodeKey(i)).map((i)=>_h.test(i) ? jt(i) + ":r()" : "[" + JSON.stringify(i) + "]:r()").join(",") + "}") : new Function("r", "return {" + o.map((i)=>_h.test(i) ? jt(i) + ":r()" : "[" + JSON.stringify(i) + "]:r()").join(",") + "}"), this.compiledReader && (r.next = this.compiledReader), r.propertyCount = n, this.compiledReader = r, r(le);
            }
            let s = {};
            if (ie.keyMap) for(let o = 0; o < n; o++)s[jt(ie.decodeKey(this[o]))] = le();
            else for(let o = 0; o < n; o++)s[jt(this[o])] = le();
            return s;
        }
        return e.slowReads = 0, t;
    }
    function jt(e) {
        if (typeof e == "string") return e === "__proto__" ? "__proto_" : e;
        if (typeof e == "number" || typeof e == "boolean" || typeof e == "bigint") return e.toString();
        if (e == null) return e + "";
        throw new Error("Invalid property name type " + typeof e);
    }
    let Sb = Yu;
    function Yu(e) {
        let t;
        if (e < 16 && (t = vy(e))) return t;
        if (e > 64 && Gu) return Gu.decode(Z.subarray(B, B += e));
        const n = B + e, r = [];
        for(t = ""; B < n;){
            const s = Z[B++];
            if (!(s & 128)) r.push(s);
            else if ((s & 224) === 192) {
                const o = Z[B++] & 63;
                r.push((s & 31) << 6 | o);
            } else if ((s & 240) === 224) {
                const o = Z[B++] & 63, i = Z[B++] & 63;
                r.push((s & 31) << 12 | o << 6 | i);
            } else if ((s & 248) === 240) {
                const o = Z[B++] & 63, i = Z[B++] & 63, a = Z[B++] & 63;
                let l = (s & 7) << 18 | o << 12 | i << 6 | a;
                l > 65535 && (l -= 65536, r.push(l >>> 10 & 1023 | 55296), l = 56320 | l & 1023), r.push(l);
            } else r.push(s);
            r.length >= 4096 && (t += ze.apply(String, r), r.length = 0);
        }
        return r.length > 0 && (t += ze.apply(String, r)), t;
    }
    let ze = String.fromCharCode;
    function kb(e) {
        let t = B, n = new Array(e);
        for(let r = 0; r < e; r++){
            const s = Z[B++];
            if ((s & 128) > 0) {
                B = t;
                return;
            }
            n[r] = s;
        }
        return ze.apply(String, n);
    }
    function vy(e) {
        if (e < 4) if (e < 2) {
            if (e === 0) return "";
            {
                let t = Z[B++];
                if ((t & 128) > 1) {
                    B -= 1;
                    return;
                }
                return ze(t);
            }
        } else {
            let t = Z[B++], n = Z[B++];
            if ((t & 128) > 0 || (n & 128) > 0) {
                B -= 2;
                return;
            }
            if (e < 3) return ze(t, n);
            let r = Z[B++];
            if ((r & 128) > 0) {
                B -= 3;
                return;
            }
            return ze(t, n, r);
        }
        else {
            let t = Z[B++], n = Z[B++], r = Z[B++], s = Z[B++];
            if ((t & 128) > 0 || (n & 128) > 0 || (r & 128) > 0 || (s & 128) > 0) {
                B -= 4;
                return;
            }
            if (e < 6) {
                if (e === 4) return ze(t, n, r, s);
                {
                    let o = Z[B++];
                    if ((o & 128) > 0) {
                        B -= 5;
                        return;
                    }
                    return ze(t, n, r, s, o);
                }
            } else if (e < 8) {
                let o = Z[B++], i = Z[B++];
                if ((o & 128) > 0 || (i & 128) > 0) {
                    B -= 6;
                    return;
                }
                if (e < 7) return ze(t, n, r, s, o, i);
                let a = Z[B++];
                if ((a & 128) > 0) {
                    B -= 7;
                    return;
                }
                return ze(t, n, r, s, o, i, a);
            } else {
                let o = Z[B++], i = Z[B++], a = Z[B++], l = Z[B++];
                if ((o & 128) > 0 || (i & 128) > 0 || (a & 128) > 0 || (l & 128) > 0) {
                    B -= 8;
                    return;
                }
                if (e < 10) {
                    if (e === 8) return ze(t, n, r, s, o, i, a, l);
                    {
                        let f = Z[B++];
                        if ((f & 128) > 0) {
                            B -= 9;
                            return;
                        }
                        return ze(t, n, r, s, o, i, a, l, f);
                    }
                } else if (e < 12) {
                    let f = Z[B++], c = Z[B++];
                    if ((f & 128) > 0 || (c & 128) > 0) {
                        B -= 10;
                        return;
                    }
                    if (e < 11) return ze(t, n, r, s, o, i, a, l, f, c);
                    let u = Z[B++];
                    if ((u & 128) > 0) {
                        B -= 11;
                        return;
                    }
                    return ze(t, n, r, s, o, i, a, l, f, c, u);
                } else {
                    let f = Z[B++], c = Z[B++], u = Z[B++], h = Z[B++];
                    if ((f & 128) > 0 || (c & 128) > 0 || (u & 128) > 0 || (h & 128) > 0) {
                        B -= 12;
                        return;
                    }
                    if (e < 14) {
                        if (e === 12) return ze(t, n, r, s, o, i, a, l, f, c, u, h);
                        {
                            let d = Z[B++];
                            if ((d & 128) > 0) {
                                B -= 13;
                                return;
                            }
                            return ze(t, n, r, s, o, i, a, l, f, c, u, h, d);
                        }
                    } else {
                        let d = Z[B++], p = Z[B++];
                        if ((d & 128) > 0 || (p & 128) > 0) {
                            B -= 14;
                            return;
                        }
                        if (e < 15) return ze(t, n, r, s, o, i, a, l, f, c, u, h, d, p);
                        let m = Z[B++];
                        if ((m & 128) > 0) {
                            B -= 15;
                            return;
                        }
                        return ze(t, n, r, s, o, i, a, l, f, c, u, h, d, p, m);
                    }
                }
            }
        }
    }
    function Cb(e) {
        return ie.copyBuffers ? Uint8Array.prototype.slice.call(Z, B, B += e) : Z.subarray(B, B += e);
    }
    let by = new Float32Array(1), li = new Uint8Array(by.buffer, 0, 4);
    function Eb() {
        let e = Z[B++], t = Z[B++], n = (e & 127) >> 2;
        if (n === 31) return t || e & 3 ? NaN : e & 128 ? -1 / 0 : 1 / 0;
        if (n === 0) {
            let r = ((e & 3) << 8 | t) / 16777216;
            return e & 128 ? -r : r;
        }
        return li[3] = e & 128 | (n >> 1) + 56, li[2] = (e & 7) << 5 | t >> 3, li[1] = t << 5, li[0] = 0, by[0];
    }
    new Array(4096);
    class Ir {
        constructor(t, n){
            this.value = t, this.tag = n;
        }
    }
    je[0] = (e)=>new Date(e);
    je[1] = (e)=>new Date(Math.round(e * 1e3));
    je[2] = (e)=>{
        let t = BigInt(0);
        for(let n = 0, r = e.byteLength; n < r; n++)t = BigInt(e[n]) + (t << BigInt(8));
        return t;
    };
    je[3] = (e)=>BigInt(-1) - je[2](e);
    je[4] = (e)=>+(e[1] + "e" + e[0]);
    je[5] = (e)=>e[1] * Math.exp(e[0] * Math.log(2));
    const Xu = (e, t)=>{
        e = e - 57344;
        let n = Ce[e];
        n && n.isShared && ((Ce.restoreStructures || (Ce.restoreStructures = []))[e] = n), Ce[e] = t, t.read = Ju(t);
    };
    je[vb] = (e)=>{
        let t = e.length, n = e[1];
        Xu(e[0], n);
        let r = {};
        for(let s = 2; s < t; s++){
            let o = n[s - 2];
            r[jt(o)] = e[s];
        }
        return r;
    };
    je[14] = (e)=>Ue ? Ue[0].slice(Ue.position0, Ue.position0 += e) : new Ir(e, 14);
    je[15] = (e)=>Ue ? Ue[1].slice(Ue.position1, Ue.position1 += e) : new Ir(e, 15);
    let Ib = {
        Error,
        RegExp
    };
    je[27] = (e)=>(Ib[e[0]] || Error)(e[1], e[2]);
    const xy = (e)=>{
        if (Z[B++] != 132) {
            let n = new Error("Packed values structure must be followed by a 4 element array");
            throw Z.length < B && (n.incomplete = !0), n;
        }
        let t = e();
        if (!t || !t.length) {
            let n = new Error("Packed values structure must be followed by a 4 element array");
            throw n.incomplete = !0, n;
        }
        return ct = ct ? t.concat(ct.slice(t.length)) : t, ct.prefixes = e(), ct.suffixes = e(), e();
    };
    xy.handlesRead = !0;
    je[51] = xy;
    je[yh] = (e)=>{
        if (!ct) if (ie.getShared) Of();
        else return new Ir(e, yh);
        if (typeof e == "number") return ct[16 + (e >= 0 ? 2 * e : -2 * e - 1)];
        let t = new Error("No support for non-integer packed references yet");
        throw e === void 0 && (t.incomplete = !0), t;
    };
    je[28] = (e)=>{
        Tt || (Tt = new Map, Tt.id = 0);
        let t = Tt.id++, n = B, r = Z[B], s;
        r >> 5 == 4 ? s = [] : s = {};
        let o = {
            target: s
        };
        Tt.set(t, o);
        let i = e();
        return o.used ? (Object.getPrototypeOf(s) !== Object.getPrototypeOf(i) && (B = n, s = i, Tt.set(t, {
            target: s
        }), i = e()), Object.assign(s, i)) : (o.target = i, i);
    };
    je[28].handlesRead = !0;
    je[29] = (e)=>{
        let t = Tt.get(e);
        return t.used = !0, t.target;
    };
    je[258] = (e)=>new Set(e);
    (je[259] = (e)=>(ie.mapsAsObjects && (ie.mapsAsObjects = !1, Hs = !0), e())).handlesRead = !0;
    function Ur(e, t) {
        return typeof e == "string" ? e + t : e instanceof Array ? e.concat(t) : Object.assign({}, e, t);
    }
    function ir() {
        if (!ct) if (ie.getShared) Of();
        else throw new Error("No packed values available");
        return ct;
    }
    const Ab = 1399353956;
    Qu.push((e, t)=>{
        if (e >= 225 && e <= 255) return Ur(ir().prefixes[e - 224], t);
        if (e >= 28704 && e <= 32767) return Ur(ir().prefixes[e - 28672], t);
        if (e >= 1879052288 && e <= 2147483647) return Ur(ir().prefixes[e - 1879048192], t);
        if (e >= 216 && e <= 223) return Ur(t, ir().suffixes[e - 216]);
        if (e >= 27647 && e <= 28671) return Ur(t, ir().suffixes[e - 27639]);
        if (e >= 1811940352 && e <= 1879048191) return Ur(t, ir().suffixes[e - 1811939328]);
        if (e == Ab) return {
            packedValues: ct,
            structures: Ce.slice(0),
            version: t
        };
        if (e == 55799) return t;
    });
    const Ob = new Uint8Array(new Uint16Array([
        1
    ]).buffer)[0] == 1, wh = [
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        typeof BigUint64Array > "u" ? {
            name: "BigUint64Array"
        } : BigUint64Array,
        Int8Array,
        Int16Array,
        Int32Array,
        typeof BigInt64Array > "u" ? {
            name: "BigInt64Array"
        } : BigInt64Array,
        Float32Array,
        Float64Array
    ], Tb = [
        64,
        68,
        69,
        70,
        71,
        72,
        77,
        78,
        79,
        85,
        86
    ];
    for(let e = 0; e < wh.length; e++)jb(wh[e], Tb[e]);
    function jb(e, t) {
        let n = "get" + e.name.slice(0, -5), r;
        typeof e == "function" ? r = e.BYTES_PER_ELEMENT : e = null;
        for(let s = 0; s < 2; s++){
            if (!s && r == 1) continue;
            let o = r == 2 ? 1 : r == 4 ? 2 : r == 8 ? 3 : 0;
            je[s ? t : t - 4] = r == 1 || s == Ob ? (i)=>{
                if (!e) throw new Error("Could not find typed array for code " + t);
                return !ie.copyBuffers && (r === 1 || r === 2 && !(i.byteOffset & 1) || r === 4 && !(i.byteOffset & 3) || r === 8 && !(i.byteOffset & 7)) ? new e(i.buffer, i.byteOffset, i.byteLength >> o) : new e(Uint8Array.prototype.slice.call(i, 0).buffer);
            } : (i)=>{
                if (!e) throw new Error("Could not find typed array for code " + t);
                let a = new DataView(i.buffer, i.byteOffset, i.byteLength), l = i.length >> o, f = new e(l), c = a[n];
                for(let u = 0; u < l; u++)f[u] = c.call(a, u << o, s);
                return f;
            };
        }
    }
    function Mb() {
        let e = ts(), t = B + le();
        for(let r = 2; r < e; r++){
            let s = ts();
            B += s;
        }
        let n = B;
        return B = t, Ue = [
            Yu(ts()),
            Yu(ts())
        ], Ue.position0 = 0, Ue.position1 = 0, Ue.postBundlePosition = B, B = n, le();
    }
    function ts() {
        let e = Z[B++] & 31;
        if (e > 23) switch(e){
            case 24:
                e = Z[B++];
                break;
            case 25:
                e = tt.getUint16(B), B += 2;
                break;
            case 26:
                e = tt.getUint32(B), B += 4;
                break;
        }
        return e;
    }
    function Of() {
        if (ie.getShared) {
            let e = Sy(()=>(Z = null, ie.getShared())) || {}, t = e.structures || [];
            ie.sharedVersion = e.version, ct = ie.sharedValues = e.packedValues, Ce === !0 ? ie.structures = Ce = t : Ce.splice.apply(Ce, [
                0,
                t.length
            ].concat(t));
        }
    }
    function Sy(e) {
        let t = mr, n = B, r = ua, s = bo, o = la, i = Tt, a = Ue, l = new Uint8Array(Z.slice(0, mr)), f = Ce, c = ie, u = xo, h = e();
        return mr = t, B = n, ua = r, bo = s, la = o, Tt = i, Ue = a, Z = l, xo = u, Ce = f, ie = c, tt = new DataView(Z.buffer, Z.byteOffset, Z.byteLength), h;
    }
    function Zu() {
        Z = null, Tt = null, Ce = null;
    }
    const Tf = new Array(147);
    for(let e = 0; e < 256; e++)Tf[e] = +("1e" + Math.floor(45.15 - e * .30103));
    let jf = new So({
        useRecords: !1
    });
    const Rb = jf.decode;
    jf.decodeMultiple;
    let Ii;
    try {
        Ii = new TextEncoder;
    } catch  {}
    let qu, ky;
    const $a = typeof globalThis == "object" && globalThis.Buffer, Ho = typeof $a < "u", Al = Ho ? $a.allocUnsafeSlow : Uint8Array, vh = Ho ? $a : Uint8Array, bh = 256, xh = Ho ? 4294967296 : 2144337920;
    let Ol, R, me, C = 0, Mn, Re = null;
    const Pb = 61440, Db = /[\u0080-\uFFFF]/, mt = Symbol("record-id");
    class Cy extends So {
        constructor(t){
            super(t), this.offset = 0;
            let n, r, s, o, i;
            t = t || {};
            let a = vh.prototype.utf8Write ? function(y, L, S) {
                return R.utf8Write(y, L, S);
            } : Ii && Ii.encodeInto ? function(y, L) {
                return Ii.encodeInto(y, R.subarray(L)).written;
            } : !1, l = this, f = t.structures || t.saveStructures, c = t.maxSharedStructures;
            if (c == null && (c = f ? 128 : 0), c > 8190) throw new Error("Maximum maxSharedStructure is 8190");
            let u = t.sequential;
            u && (c = 0), this.structures || (this.structures = []), this.saveStructures && (this.saveShared = this.saveStructures);
            let h, d, p = t.sharedValues, m;
            if (p) {
                m = Object.create(null);
                for(let y = 0, L = p.length; y < L; y++)m[p[y]] = y;
            }
            let x = [], w = 0, _ = 0;
            this.mapEncode = function(y, L) {
                if (this._keyMap && !this._mapped) switch(y.constructor.name){
                    case "Array":
                        y = y.map((S)=>this.encodeKeys(S));
                        break;
                }
                return this.encode(y, L);
            }, this.encode = function(y, L) {
                if (R || (R = new Al(8192), me = new DataView(R.buffer, 0, 8192), C = 0), Mn = R.length - 10, Mn - C < 2048 ? (R = new Al(R.length), me = new DataView(R.buffer, 0, R.length), Mn = R.length - 10, C = 0) : L === Ch && (C = C + 7 & 2147483640), n = C, l.useSelfDescribedHeader && (me.setUint32(C, 3654940416), C += 3), i = l.structuredClone ? new Map : null, l.bundleStrings && typeof y != "string" ? (Re = [], Re.size = 1 / 0) : Re = null, r = l.structures, r) {
                    if (r.uninitialized) {
                        let I = l.getShared() || {};
                        l.structures = r = I.structures || [], l.sharedVersion = I.version;
                        let k = l.sharedValues = I.packedValues;
                        if (k) {
                            m = {};
                            for(let M = 0, v = k.length; M < v; M++)m[k[M]] = M;
                        }
                    }
                    let S = r.length;
                    if (S > c && !u && (S = c), !r.transitions) {
                        r.transitions = Object.create(null);
                        for(let I = 0; I < S; I++){
                            let k = r[I];
                            if (!k) continue;
                            let M, v = r.transitions;
                            for(let T = 0, z = k.length; T < z; T++){
                                v[mt] === void 0 && (v[mt] = I);
                                let V = k[T];
                                M = v[V], M || (M = v[V] = Object.create(null)), v = M;
                            }
                            v[mt] = I | 1048576;
                        }
                    }
                    u || (r.nextId = S);
                }
                if (s && (s = !1), o = r || [], d = m, t.pack) {
                    let S = new Map;
                    if (S.values = [], S.encoder = l, S.maxValues = t.maxPrivatePackedValues || (m ? 16 : 1 / 0), S.objectMap = m || !1, S.samplingPackedValues = h, Ai(y, S), S.values.length > 0) {
                        R[C++] = 216, R[C++] = 51, rn(4);
                        let I = S.values;
                        g(I), rn(0), rn(0), d = Object.create(m || null);
                        for(let k = 0, M = I.length; k < M; k++)d[I[k]] = k;
                    }
                }
                Ol = L & jl;
                try {
                    if (Ol) return;
                    if (g(y), Re && kh(n, g), l.offset = C, i && i.idsToInsert) {
                        C += i.idsToInsert.length * 2, C > Mn && P(C), l.offset = C;
                        let S = Fb(R.subarray(n, C), i.idsToInsert);
                        return i = null, S;
                    }
                    return L & Ch ? (R.start = n, R.end = C, R) : R.subarray(n, C);
                } finally{
                    if (r) {
                        if (_ < 10 && _++, r.length > c && (r.length = c), w > 1e4) r.transitions = null, _ = 0, w = 0, x.length > 0 && (x = []);
                        else if (x.length > 0 && !u) {
                            for(let S = 0, I = x.length; S < I; S++)x[S][mt] = void 0;
                            x = [];
                        }
                    }
                    if (s && l.saveShared) {
                        l.structures.length > c && (l.structures = l.structures.slice(0, c));
                        let S = R.subarray(n, C);
                        return l.updateSharedData() === !1 ? l.encode(y) : S;
                    }
                    L & zb && (C = n);
                }
            }, this.findCommonStringsToPack = ()=>(h = new Map, m || (m = Object.create(null)), (y)=>{
                    let L = y && y.threshold || 4, S = this.pack ? y.maxPrivatePackedValues || 16 : 0;
                    p || (p = this.sharedValues = []);
                    for (let [I, k] of h)k.count > L && (m[I] = S++, p.push(I), s = !0);
                    for(; this.saveShared && this.updateSharedData() === !1;);
                    h = null;
                });
            const g = (y)=>{
                C > Mn && (R = P(C));
                var L = typeof y, S;
                if (L === "string") {
                    if (d) {
                        let v = d[y];
                        if (v >= 0) {
                            v < 16 ? R[C++] = v + 224 : (R[C++] = 198, v & 1 ? g(15 - v >> 1) : g(v - 16 >> 1));
                            return;
                        } else if (h && !t.pack) {
                            let T = h.get(y);
                            T ? T.count++ : h.set(y, {
                                count: 1
                            });
                        }
                    }
                    let I = y.length;
                    if (Re && I >= 4 && I < 1024) {
                        if ((Re.size += I) > Pb) {
                            let T, z = (Re[0] ? Re[0].length * 3 + Re[1].length : 0) + 10;
                            C + z > Mn && (R = P(C + z)), R[C++] = 217, R[C++] = 223, R[C++] = 249, R[C++] = Re.position ? 132 : 130, R[C++] = 26, T = C - n, C += 4, Re.position && kh(n, g), Re = [
                                "",
                                ""
                            ], Re.size = 0, Re.position = T;
                        }
                        let v = Db.test(y);
                        Re[v ? 0 : 1] += y, R[C++] = v ? 206 : 207, g(I);
                        return;
                    }
                    let k;
                    I < 32 ? k = 1 : I < 256 ? k = 2 : I < 65536 ? k = 3 : k = 5;
                    let M = I * 3;
                    if (C + M > Mn && (R = P(C + M)), I < 64 || !a) {
                        let v, T, z, V = C + k;
                        for(v = 0; v < I; v++)T = y.charCodeAt(v), T < 128 ? R[V++] = T : T < 2048 ? (R[V++] = T >> 6 | 192, R[V++] = T & 63 | 128) : (T & 64512) === 55296 && ((z = y.charCodeAt(v + 1)) & 64512) === 56320 ? (T = 65536 + ((T & 1023) << 10) + (z & 1023), v++, R[V++] = T >> 18 | 240, R[V++] = T >> 12 & 63 | 128, R[V++] = T >> 6 & 63 | 128, R[V++] = T & 63 | 128) : (R[V++] = T >> 12 | 224, R[V++] = T >> 6 & 63 | 128, R[V++] = T & 63 | 128);
                        S = V - C - k;
                    } else S = a(y, C + k, M);
                    S < 24 ? R[C++] = 96 | S : S < 256 ? (k < 2 && R.copyWithin(C + 2, C + 1, C + 1 + S), R[C++] = 120, R[C++] = S) : S < 65536 ? (k < 3 && R.copyWithin(C + 3, C + 2, C + 2 + S), R[C++] = 121, R[C++] = S >> 8, R[C++] = S & 255) : (k < 5 && R.copyWithin(C + 5, C + 3, C + 3 + S), R[C++] = 122, me.setUint32(C, S), C += 4), C += S;
                } else if (L === "number") if (!this.alwaysUseFloat && y >>> 0 === y) y < 24 ? R[C++] = y : y < 256 ? (R[C++] = 24, R[C++] = y) : y < 65536 ? (R[C++] = 25, R[C++] = y >> 8, R[C++] = y & 255) : (R[C++] = 26, me.setUint32(C, y), C += 4);
                else if (!this.alwaysUseFloat && y >> 0 === y) y >= -24 ? R[C++] = 31 - y : y >= -256 ? (R[C++] = 56, R[C++] = ~y) : y >= -65536 ? (R[C++] = 57, me.setUint16(C, ~y), C += 2) : (R[C++] = 58, me.setUint32(C, ~y), C += 4);
                else {
                    let I;
                    if ((I = this.useFloat32) > 0 && y < 4294967296 && y >= -2147483648) {
                        R[C++] = 250, me.setFloat32(C, y);
                        let k;
                        if (I < 4 || (k = y * Tf[(R[C] & 127) << 1 | R[C + 1] >> 7]) >> 0 === k) {
                            C += 4;
                            return;
                        } else C--;
                    }
                    R[C++] = 251, me.setFloat64(C, y), C += 8;
                }
                else if (L === "object") if (!y) R[C++] = 246;
                else {
                    if (i) {
                        let k = i.get(y);
                        if (k) {
                            if (R[C++] = 216, R[C++] = 29, R[C++] = 25, !k.references) {
                                let M = i.idsToInsert || (i.idsToInsert = []);
                                k.references = [], M.push(k);
                            }
                            k.references.push(C - n), C += 2;
                            return;
                        } else i.set(y, {
                            offset: C - n
                        });
                    }
                    let I = y.constructor;
                    if (I === Object) A(y);
                    else if (I === Array) {
                        S = y.length, S < 24 ? R[C++] = 128 | S : rn(S);
                        for(let k = 0; k < S; k++)g(y[k]);
                    } else if (I === Map) if ((this.mapsAsObjects ? this.useTag259ForMaps !== !1 : this.useTag259ForMaps) && (R[C++] = 217, R[C++] = 1, R[C++] = 3), S = y.size, S < 24 ? R[C++] = 160 | S : S < 256 ? (R[C++] = 184, R[C++] = S) : S < 65536 ? (R[C++] = 185, R[C++] = S >> 8, R[C++] = S & 255) : (R[C++] = 186, me.setUint32(C, S), C += 4), l.keyMap) for (let [k, M] of y)g(l.encodeKey(k)), g(M);
                    else for (let [k, M] of y)g(k), g(M);
                    else {
                        for(let k = 0, M = qu.length; k < M; k++){
                            let v = ky[k];
                            if (y instanceof v) {
                                let T = qu[k], z = T.tag;
                                z == null && (z = T.getTag && T.getTag.call(this, y)), z < 24 ? R[C++] = 192 | z : z < 256 ? (R[C++] = 216, R[C++] = z) : z < 65536 ? (R[C++] = 217, R[C++] = z >> 8, R[C++] = z & 255) : z > -1 && (R[C++] = 218, me.setUint32(C, z), C += 4), T.encode.call(this, y, g, P);
                                return;
                            }
                        }
                        if (y[Symbol.iterator]) {
                            if (Ol) {
                                let k = new Error("Iterable should be serialized as iterator");
                                throw k.iteratorNotHandled = !0, k;
                            }
                            R[C++] = 159;
                            for (let k of y)g(k);
                            R[C++] = 255;
                            return;
                        }
                        if (y[Symbol.asyncIterator] || Tl(y)) {
                            let k = new Error("Iterable/blob should be serialized as iterator");
                            throw k.iteratorNotHandled = !0, k;
                        }
                        if (this.useToJSON && y.toJSON) {
                            const k = y.toJSON();
                            if (k !== y) return g(k);
                        }
                        A(y);
                    }
                }
                else if (L === "boolean") R[C++] = y ? 245 : 244;
                else if (L === "bigint") {
                    if (y < BigInt(1) << BigInt(64) && y >= 0) R[C++] = 27, me.setBigUint64(C, y);
                    else if (y > -(BigInt(1) << BigInt(64)) && y < 0) R[C++] = 59, me.setBigUint64(C, -y - BigInt(1));
                    else if (this.largeBigIntToFloat) R[C++] = 251, me.setFloat64(C, Number(y));
                    else {
                        y >= BigInt(0) ? R[C++] = 194 : (R[C++] = 195, y = BigInt(-1) - y);
                        let I = [];
                        for(; y;)I.push(Number(y & BigInt(255))), y >>= BigInt(8);
                        ec(new Uint8Array(I.reverse()), P);
                        return;
                    }
                    C += 8;
                } else if (L === "undefined") R[C++] = 247;
                else throw new Error("Unknown type: " + L);
            }, A = this.useRecords === !1 ? this.variableMapSize ? (y)=>{
                let L = Object.keys(y), S = Object.values(y), I = L.length;
                if (I < 24 ? R[C++] = 160 | I : I < 256 ? (R[C++] = 184, R[C++] = I) : I < 65536 ? (R[C++] = 185, R[C++] = I >> 8, R[C++] = I & 255) : (R[C++] = 186, me.setUint32(C, I), C += 4), l.keyMap) for(let k = 0; k < I; k++)g(l.encodeKey(L[k])), g(S[k]);
                else for(let k = 0; k < I; k++)g(L[k]), g(S[k]);
            } : (y)=>{
                R[C++] = 185;
                let L = C - n;
                C += 2;
                let S = 0;
                if (l.keyMap) for(let I in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(I)) && (g(l.encodeKey(I)), g(y[I]), S++);
                else for(let I in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(I)) && (g(I), g(y[I]), S++);
                R[L++ + n] = S >> 8, R[L + n] = S & 255;
            } : (y, L)=>{
                let S, I = o.transitions || (o.transitions = Object.create(null)), k = 0, M = 0, v, T;
                if (this.keyMap) {
                    T = Object.keys(y).map((V)=>this.encodeKey(V)), M = T.length;
                    for(let V = 0; V < M; V++){
                        let de = T[V];
                        S = I[de], S || (S = I[de] = Object.create(null), k++), I = S;
                    }
                } else for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && (S = I[V], S || (I[mt] & 1048576 && (v = I[mt] & 65535), S = I[V] = Object.create(null), k++), I = S, M++);
                let z = I[mt];
                if (z !== void 0) z &= 65535, R[C++] = 217, R[C++] = z >> 8 | 224, R[C++] = z & 255;
                else if (T || (T = I.__keys__ || (I.__keys__ = Object.keys(y))), v === void 0 ? (z = o.nextId++, z || (z = 0, o.nextId = 1), z >= bh && (o.nextId = (z = c) + 1)) : z = v, o[z] = T, z < c) {
                    R[C++] = 217, R[C++] = z >> 8 | 224, R[C++] = z & 255, I = o.transitions;
                    for(let V = 0; V < M; V++)(I[mt] === void 0 || I[mt] & 1048576) && (I[mt] = z), I = I[T[V]];
                    I[mt] = z | 1048576, s = !0;
                } else {
                    if (I[mt] = z, me.setUint32(C, 3655335680), C += 3, k && (w += _ * k), x.length >= bh - c && (x.shift()[mt] = void 0), x.push(I), rn(M + 2), g(57344 + z), g(T), L) return;
                    for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && g(y[V]);
                    return;
                }
                if (M < 24 ? R[C++] = 128 | M : rn(M), !L) for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && g(y[V]);
            }, P = (y)=>{
                let L;
                if (y > 16777216) {
                    if (y - n > xh) throw new Error("Encoded buffer would be larger than maximum buffer size");
                    L = Math.min(xh, Math.round(Math.max((y - n) * (y > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096);
                } else L = (Math.max(y - n << 2, R.length - 1) >> 12) + 1 << 12;
                let S = new Al(L);
                return me = new DataView(S.buffer, 0, L), R.copy ? R.copy(S, 0, n, y) : S.set(R.slice(n, y)), C -= n, n = 0, Mn = S.length - 10, R = S;
            };
            let j = 100, N = 1e3;
            this.encodeAsIterable = function(y, L) {
                return se(y, L, F);
            }, this.encodeAsAsyncIterable = function(y, L) {
                return se(y, L, H);
            };
            function* F(y, L, S) {
                let I = y.constructor;
                if (I === Object) {
                    let k = l.useRecords !== !1;
                    k ? A(y, !0) : Sh(Object.keys(y).length, 160);
                    for(let M in y){
                        let v = y[M];
                        k || g(M), v && typeof v == "object" ? L[M] ? yield* F(v, L[M]) : yield* J(v, L, M) : g(v);
                    }
                } else if (I === Array) {
                    let k = y.length;
                    rn(k);
                    for(let M = 0; M < k; M++){
                        let v = y[M];
                        v && (typeof v == "object" || C - n > j) ? L.element ? yield* F(v, L.element) : yield* J(v, L, "element") : g(v);
                    }
                } else if (y[Symbol.iterator] && !y.buffer) {
                    R[C++] = 159;
                    for (let k of y)k && (typeof k == "object" || C - n > j) ? L.element ? yield* F(k, L.element) : yield* J(k, L, "element") : g(k);
                    R[C++] = 255;
                } else Tl(y) ? (Sh(y.size, 64), yield R.subarray(n, C), yield y, K()) : y[Symbol.asyncIterator] ? (R[C++] = 159, yield R.subarray(n, C), yield y, K(), R[C++] = 255) : g(y);
                S && C > n ? yield R.subarray(n, C) : C - n > j && (yield R.subarray(n, C), K());
            }
            function* J(y, L, S) {
                let I = C - n;
                try {
                    g(y), C - n > j && (yield R.subarray(n, C), K());
                } catch (k) {
                    if (k.iteratorNotHandled) L[S] = {}, C = n + I, yield* F.call(this, y, L[S]);
                    else throw k;
                }
            }
            function K() {
                j = N, l.encode(null, jl);
            }
            function se(y, L, S) {
                return L && L.chunkThreshold ? j = N = L.chunkThreshold : j = 100, y && typeof y == "object" ? (l.encode(null, jl), S(y, l.iterateProperties || (l.iterateProperties = {}), !0)) : [
                    l.encode(y)
                ];
            }
            async function* H(y, L) {
                for (let S of F(y, L, !0)){
                    let I = S.constructor;
                    if (I === vh || I === Uint8Array) yield S;
                    else if (Tl(S)) {
                        let k = S.stream().getReader(), M;
                        for(; !(M = await k.read()).done;)yield M.value;
                    } else if (S[Symbol.asyncIterator]) for await (let k of S)K(), k ? yield* H(k, L.async || (L.async = {})) : yield l.encode(k);
                    else yield S;
                }
            }
        }
        useBuffer(t) {
            R = t, me = new DataView(R.buffer, R.byteOffset, R.byteLength), C = 0;
        }
        clearSharedData() {
            this.structures && (this.structures = []), this.sharedValues && (this.sharedValues = void 0);
        }
        updateSharedData() {
            let t = this.sharedVersion || 0;
            this.sharedVersion = t + 1;
            let n = this.structures.slice(0), r = new Ey(n, this.sharedValues, this.sharedVersion), s = this.saveShared(r, (o)=>(o && o.version || 0) == t);
            return s === !1 ? (r = this.getShared() || {}, this.structures = r.structures || [], this.sharedValues = r.packedValues, this.sharedVersion = r.version, this.structures.nextId = this.structures.length) : n.forEach((o, i)=>this.structures[i] = o), s;
        }
    }
    function Sh(e, t) {
        e < 24 ? R[C++] = t | e : e < 256 ? (R[C++] = t | 24, R[C++] = e) : e < 65536 ? (R[C++] = t | 25, R[C++] = e >> 8, R[C++] = e & 255) : (R[C++] = t | 26, me.setUint32(C, e), C += 4);
    }
    class Ey {
        constructor(t, n, r){
            this.structures = t, this.packedValues = n, this.version = r;
        }
    }
    function rn(e) {
        e < 24 ? R[C++] = 128 | e : e < 256 ? (R[C++] = 152, R[C++] = e) : e < 65536 ? (R[C++] = 153, R[C++] = e >> 8, R[C++] = e & 255) : (R[C++] = 154, me.setUint32(C, e), C += 4);
    }
    const Lb = typeof Blob > "u" ? function() {} : Blob;
    function Tl(e) {
        if (e instanceof Lb) return !0;
        let t = e[Symbol.toStringTag];
        return t === "Blob" || t === "File";
    }
    function Ai(e, t) {
        switch(typeof e){
            case "string":
                if (e.length > 3) {
                    if (t.objectMap[e] > -1 || t.values.length >= t.maxValues) return;
                    let r = t.get(e);
                    if (r) ++r.count == 2 && t.values.push(e);
                    else if (t.set(e, {
                        count: 1
                    }), t.samplingPackedValues) {
                        let s = t.samplingPackedValues.get(e);
                        s ? s.count++ : t.samplingPackedValues.set(e, {
                            count: 1
                        });
                    }
                }
                break;
            case "object":
                if (e) if (e instanceof Array) for(let r = 0, s = e.length; r < s; r++)Ai(e[r], t);
                else {
                    let r = !t.encoder.useRecords;
                    for(var n in e)e.hasOwnProperty(n) && (r && Ai(n, t), Ai(e[n], t));
                }
                break;
            case "function":
                console.log(e);
        }
    }
    const Ub = new Uint8Array(new Uint16Array([
        1
    ]).buffer)[0] == 1;
    ky = [
        Date,
        Set,
        Error,
        RegExp,
        Ir,
        ArrayBuffer,
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        typeof BigUint64Array > "u" ? function() {} : BigUint64Array,
        Int8Array,
        Int16Array,
        Int32Array,
        typeof BigInt64Array > "u" ? function() {} : BigInt64Array,
        Float32Array,
        Float64Array,
        Ey
    ];
    qu = [
        {
            tag: 1,
            encode (e, t) {
                let n = e.getTime() / 1e3;
                (this.useTimestamp32 || e.getMilliseconds() === 0) && n >= 0 && n < 4294967296 ? (R[C++] = 26, me.setUint32(C, n), C += 4) : (R[C++] = 251, me.setFloat64(C, n), C += 8);
            }
        },
        {
            tag: 258,
            encode (e, t) {
                let n = Array.from(e);
                t(n);
            }
        },
        {
            tag: 27,
            encode (e, t) {
                t([
                    e.name,
                    e.message
                ]);
            }
        },
        {
            tag: 27,
            encode (e, t) {
                t([
                    "RegExp",
                    e.source,
                    e.flags
                ]);
            }
        },
        {
            getTag (e) {
                return e.tag;
            },
            encode (e, t) {
                t(e.value);
            }
        },
        {
            encode (e, t, n) {
                ec(e, n);
            }
        },
        {
            getTag (e) {
                if (e.constructor === Uint8Array && (this.tagUint8Array || Ho && this.tagUint8Array !== !1)) return 64;
            },
            encode (e, t, n) {
                ec(e, n);
            }
        },
        en(68, 1),
        en(69, 2),
        en(70, 4),
        en(71, 8),
        en(72, 1),
        en(77, 2),
        en(78, 4),
        en(79, 8),
        en(85, 4),
        en(86, 8),
        {
            encode (e, t) {
                let n = e.packedValues || [], r = e.structures || [];
                if (n.values.length > 0) {
                    R[C++] = 216, R[C++] = 51, rn(4);
                    let s = n.values;
                    t(s), rn(0), rn(0), packedObjectMap = Object.create(sharedPackedObjectMap || null);
                    for(let o = 0, i = s.length; o < i; o++)packedObjectMap[s[o]] = o;
                }
                if (r) {
                    me.setUint32(C, 3655335424), C += 3;
                    let s = r.slice(0);
                    s.unshift(57344), s.push(new Ir(e.version, 1399353956)), t(s);
                } else t(new Ir(e.version, 1399353956));
            }
        }
    ];
    function en(e, t) {
        return !Ub && t > 1 && (e -= 4), {
            tag: e,
            encode: function(r, s) {
                let o = r.byteLength, i = r.byteOffset || 0, a = r.buffer || r;
                s(Ho ? $a.from(a, i, o) : new Uint8Array(a, i, o));
            }
        };
    }
    function ec(e, t) {
        let n = e.byteLength;
        n < 24 ? R[C++] = 64 + n : n < 256 ? (R[C++] = 88, R[C++] = n) : n < 65536 ? (R[C++] = 89, R[C++] = n >> 8, R[C++] = n & 255) : (R[C++] = 90, me.setUint32(C, n), C += 4), C + n >= R.length && t(C + n), R.set(e.buffer ? e : new Uint8Array(e), C), C += n;
    }
    function Fb(e, t) {
        let n, r = t.length * 2, s = e.length - r;
        t.sort((o, i)=>o.offset > i.offset ? 1 : -1);
        for(let o = 0; o < t.length; o++){
            let i = t[o];
            i.id = o;
            for (let a of i.references)e[a++] = o >> 8, e[a] = o & 255;
        }
        for(; n = t.pop();){
            let o = n.offset;
            e.copyWithin(o + r, o, s), r -= 2;
            let i = o + r;
            e[i++] = 216, e[i++] = 28, s = o;
        }
        return e;
    }
    function kh(e, t) {
        me.setUint32(Re.position + e, C - Re.position - e + 1);
        let n = Re;
        Re = null, t(n[0]), t(n[1]);
    }
    let Mf = new Cy({
        useRecords: !1
    });
    Mf.encode;
    Mf.encodeAsIterable;
    Mf.encodeAsAsyncIterable;
    const Ch = 512, zb = 1024, jl = 2048;
    function Hb(e) {
        return new Cy({
            tagUint8Array: !1,
            useRecords: !1
        }).encode(e);
    }
    const Nb = (e, t)=>e.length === t.length && e.every((n, r)=>n === t[r]), Rf = (e, t)=>Nb(e, t), Bb = async (e, t)=>{
        let n;
        const r = new Promise((s, o)=>{
            n = setTimeout(()=>o(new $b(`withTimeout: timed out after ${t}ms`)), t);
        });
        try {
            return await Promise.race([
                e,
                r
            ]);
        } finally{
            clearTimeout(n);
        }
    };
    class $b extends Error {
        constructor(t){
            super(t), this.name = "TimeoutError";
        }
    }
    class Vb extends ks {
        documentId;
        #t;
        #e;
        #r;
        #n = 6e4;
        #s = {};
        constructor(t, n = {}){
            super(), this.documentId = t, "timeoutDelay" in n && n.timeoutDelay && (this.#n = n.timeoutDelay);
            let r;
            const s = "isNew" in n && n.isNew;
            s ? (r = Mv(n.initialValue), r = xv(r)) : r = La(), this.#t = jr(`automerge-repo:dochandle:${this.documentId.slice(0, 5)}`);
            const o = this.#n, i = Bg({
                types: {
                    context: {},
                    events: {}
                },
                actions: {
                    onUpdate: vo(({ context: a, event: l })=>{
                        const f = a.doc;
                        X2(l, ci);
                        const { callback: c } = l.payload;
                        return {
                            doc: c(f)
                        };
                    }),
                    onDelete: vo(()=>(this.emit("delete", {
                            handle: this
                        }), {
                            doc: void 0
                        })),
                    onUnavailable: ()=>{
                        this.emit("unavailable", {
                            handle: this
                        });
                    }
                }
            }).createMachine({
                initial: "idle",
                context: {
                    documentId: t,
                    doc: r
                },
                on: {
                    UPDATE: {
                        actions: "onUpdate"
                    },
                    DELETE: ".deleted"
                },
                states: {
                    idle: {
                        on: {
                            CREATE: "ready",
                            FIND: "loading"
                        }
                    },
                    loading: {
                        on: {
                            REQUEST: "requesting",
                            DOC_READY: "ready",
                            AWAIT_NETWORK: "awaitingNetwork"
                        },
                        after: {
                            [o]: "unavailable"
                        }
                    },
                    awaitingNetwork: {
                        on: {
                            NETWORK_READY: "requesting"
                        }
                    },
                    requesting: {
                        on: {
                            DOC_UNAVAILABLE: "unavailable",
                            DOC_READY: "ready"
                        },
                        after: {
                            [o]: "unavailable"
                        }
                    },
                    unavailable: {
                        entry: "onUnavailable",
                        on: {
                            DOC_READY: "ready"
                        }
                    },
                    ready: {},
                    deleted: {
                        entry: "onDelete",
                        type: "final"
                    }
                }
            });
            this.#e = wo(i), this.#e.subscribe((a)=>{
                const l = this.#r, f = a.context.doc;
                this.#t(`→ ${a.value} %o`, f), this.#l(l, f);
            }), this.#e.start(), this.#e.send(s ? {
                type: Kb
            } : {
                type: Gb
            });
        }
        get #o() {
            return this.#e?.getSnapshot().context.doc;
        }
        get #a() {
            return this.#e?.getSnapshot().value;
        }
        #i(t) {
            const n = Array.isArray(t) ? t : [
                t
            ];
            return eb(this.#e, (r)=>n.some((s)=>r.matches(s)), {
                timeout: this.#n * 2
            });
        }
        #l(t, n) {
            if (n && t && !Rf(Kt(n), Kt(t))) {
                this.emit("heads-changed", {
                    handle: this,
                    doc: n
                });
                const s = Cv(n, Kt(t), Kt(n));
                s.length > 0 && this.emit("change", {
                    handle: this,
                    doc: n,
                    patches: s,
                    patchInfo: {
                        before: t,
                        after: n,
                        source: "change"
                    }
                }), this.isReady() || this.#e.send({
                    type: Jb
                });
            }
            this.#r = n;
        }
        get url() {
            return Af({
                documentId: this.documentId
            });
        }
        isReady = ()=>this.inState([
                "ready"
            ]);
        isDeleted = ()=>this.inState([
                "deleted"
            ]);
        isUnavailable = ()=>this.inState([
                "unavailable"
            ]);
        inState = (t)=>t.some((n)=>this.#e.getSnapshot().matches(n));
        get state() {
            return this.#e.getSnapshot().value;
        }
        async whenReady(t = [
            "ready"
        ]) {
            await Bb(this.#i(t), this.#n);
        }
        async doc(t = [
            "ready",
            "unavailable"
        ]) {
            try {
                await this.#i(t);
            } catch  {
                return;
            }
            return this.isUnavailable() ? void 0 : this.#o;
        }
        docSync() {
            if (this.isReady()) return this.#o;
        }
        heads() {
            if (this.isReady()) return Kt(this.#o);
        }
        update(t) {
            this.#e.send({
                type: ci,
                payload: {
                    callback: t
                }
            });
        }
        setRemoteHeads(t, n) {
            this.#s[t] = n, this.emit("remote-heads", {
                storageId: t,
                heads: n
            });
        }
        getRemoteHeads(t) {
            return this.#s[t];
        }
        change(t, n = {}) {
            if (!this.isReady()) throw new Error(`DocHandle#${this.documentId} is not ready. Check \`handle.isReady()\` before accessing the document.`);
            this.#e.send({
                type: ci,
                payload: {
                    callback: (r)=>vv(r, n, t)
                }
            });
        }
        changeAt(t, n, r = {}) {
            if (!this.isReady()) throw new Error(`DocHandle#${this.documentId} is not ready. Check \`handle.isReady()\` before accessing the document.`);
            let s;
            return this.#e.send({
                type: ci,
                payload: {
                    callback: (o)=>{
                        const i = bv(o, t, r, n);
                        return s = i.newHeads || void 0, i.newDoc;
                    }
                }
            }), s;
        }
        merge(t) {
            if (!this.isReady() || !t.isReady()) throw new Error("Both handles must be ready to merge");
            const n = t.docSync();
            if (!n) throw new Error("The document to be merged in is falsy, aborting.");
            this.update((r)=>kv(r, n));
        }
        unavailable() {
            this.#e.send({
                type: qb
            });
        }
        request() {
            this.#a === "loading" && this.#e.send({
                type: Qb
            });
        }
        awaitNetwork() {
            this.#a === "loading" && this.#e.send({
                type: Yb
            });
        }
        networkReady() {
            this.#a === "awaitingNetwork" && this.#e.send({
                type: Xb
            });
        }
        delete() {
            this.#e.send({
                type: Zb
            });
        }
        broadcast(t) {
            this.emit("ephemeral-message-outbound", {
                handle: this,
                data: Hb(t)
            });
        }
    }
    const Wb = {
        IDLE: "idle",
        LOADING: "loading",
        AWAITING_NETWORK: "awaitingNetwork",
        REQUESTING: "requesting",
        READY: "ready",
        DELETED: "deleted",
        UNAVAILABLE: "unavailable"
    }, { IDLE: j4, LOADING: M4, AWAITING_NETWORK: R4, REQUESTING: ui, READY: Ml, DELETED: P4, UNAVAILABLE: Eh } = Wb, Kb = "CREATE", Gb = "FIND", Qb = "REQUEST", Jb = "DOC_READY", Yb = "AWAIT_NETWORK", Xb = "NETWORK_READY", ci = "UPDATE", Zb = "DELETE", qb = "DOC_UNAVAILABLE";
    class e3 extends ks {
        #t = new Map;
        #e = new Set;
        #r = new Map;
        #n = new Set;
        #s = new Map;
        #o = jr("automerge-repo:remote-heads-subscriptions");
        subscribeToRemotes(t) {
            this.#o("subscribeToRemotes", t);
            const n = [];
            for (const r of t)this.#e.has(r) || (this.#e.add(r), n.push(r));
            n.length > 0 && this.emit("change-remote-subs", {
                add: n,
                peers: Array.from(this.#n)
            });
        }
        unsubscribeFromRemotes(t) {
            this.#o("subscribeToRemotes", t);
            const n = [];
            for (const r of t)this.#e.has(r) && (this.#e.delete(r), this.#r.has(r) || n.push(r));
            n.length > 0 && this.emit("change-remote-subs", {
                remove: n,
                peers: Array.from(this.#n)
            });
        }
        handleControlMessage(t) {
            const n = [], r = [], s = [];
            if (this.#o("handleControlMessage", t), t.add) for (const o of t.add){
                let i = this.#r.get(o);
                (this.#e.has(o) || i) && s.push(o), i || (i = new Set, this.#r.set(o, i), this.#e.has(o) || n.push(o)), i.add(t.senderId);
            }
            if (t.remove) for (const o of t.remove){
                const i = this.#r.get(o);
                i && (i.delete(t.senderId), i.size == 0 && !this.#e.has(o) && r.push(o));
            }
            (n.length > 0 || r.length > 0) && this.emit("change-remote-subs", {
                peers: Array.from(this.#n),
                add: n,
                remove: r
            });
            for (const o of s){
                const i = this.#s.get(t.senderId);
                if (i) for (const a of i){
                    const l = this.#t.get(a);
                    if (!l) continue;
                    const f = l.get(o);
                    f && this.emit("notify-remote-heads", {
                        targetId: t.senderId,
                        documentId: a,
                        heads: f.heads,
                        timestamp: f.timestamp,
                        storageId: o
                    });
                }
            }
        }
        handleRemoteHeads(t) {
            this.#o("handleRemoteHeads", t);
            const n = this.#i(t);
            for (const r of n)this.#e.has(r.storageId) && this.emit("remote-heads-changed", r);
            for (const r of n)for (const s of this.#n)s !== t.senderId && this.emit("notify-remote-heads", {
                targetId: s,
                documentId: r.documentId,
                heads: r.remoteHeads,
                timestamp: r.timestamp,
                storageId: r.storageId
            });
            for (const r of n){
                const s = this.#r.get(r.storageId);
                if (s) for (const o of s)this.#a(o, r.documentId) && this.emit("notify-remote-heads", {
                    targetId: o,
                    documentId: r.documentId,
                    heads: r.remoteHeads,
                    timestamp: r.timestamp,
                    storageId: r.storageId
                });
            }
        }
        handleImmediateRemoteHeadsChanged(t, n, r) {
            this.#o("handleLocalHeadsChanged", t, n, r);
            const s = this.#t.get(t), o = Date.now();
            if (!s) this.#t.set(t, new Map([
                [
                    n,
                    {
                        heads: r,
                        timestamp: o
                    }
                ]
            ]));
            else {
                const a = s.get(n);
                (!a || a.timestamp < Date.now()) && s.set(n, {
                    heads: r,
                    timestamp: Date.now()
                });
            }
            const i = this.#r.get(n);
            if (i) for (const a of i)this.#a(a, t) && this.emit("notify-remote-heads", {
                targetId: a,
                documentId: t,
                heads: r,
                timestamp: o,
                storageId: n
            });
        }
        addGenerousPeer(t) {
            this.#o("addGenerousPeer", t), this.#n.add(t), this.#e.size > 0 && this.emit("change-remote-subs", {
                add: Array.from(this.#e),
                peers: [
                    t
                ]
            });
            for (const [n, r] of this.#t)for (const [s, { heads: o, timestamp: i }] of r)this.emit("notify-remote-heads", {
                targetId: t,
                documentId: n,
                heads: o,
                timestamp: i,
                storageId: s
            });
        }
        removePeer(t) {
            this.#o("removePeer", t);
            const n = [];
            this.#n.delete(t), this.#s.delete(t);
            for (const [r, s] of this.#r)s.has(t) && (s.delete(t), s.size == 0 && (n.push(r), this.#r.delete(r)));
            n.length > 0 && this.emit("change-remote-subs", {
                remove: n,
                peers: Array.from(this.#n)
            });
        }
        subscribePeerToDoc(t, n) {
            let r = this.#s.get(t);
            r || (r = new Set, this.#s.set(t, r)), r.add(n);
            const s = this.#t.get(n);
            if (s) for (const [o, i] of s){
                const a = this.#r.get(o);
                a && a.has(t) && this.emit("notify-remote-heads", {
                    targetId: t,
                    documentId: n,
                    heads: i.heads,
                    timestamp: i.timestamp,
                    storageId: o
                });
            }
        }
        #a(t, n) {
            const r = this.#s.get(t);
            return r && r.has(n);
        }
        #i(t) {
            const n = [], { documentId: r, newHeads: s } = t;
            for (const [o, { heads: i, timestamp: a }] of Object.entries(s)){
                if (!this.#e.has(o) && !this.#r.has(o)) continue;
                let l = this.#t.get(r);
                l || (l = new Map, this.#t.set(r, l));
                const f = l.get(o);
                f && f.timestamp >= a || (l.set(o, {
                    timestamp: a,
                    heads: i
                }), n.push({
                    documentId: r,
                    storageId: o,
                    remoteHeads: i,
                    timestamp: a
                }));
            }
            return n;
        }
    }
    const tc = (e, t)=>{
        let n = Date.now(), r, s;
        return function(...o) {
            r = n + t - Date.now(), clearTimeout(s), s = setTimeout(()=>{
                e(...o), n = Date.now();
            }, r);
        };
    }, t3 = (e)=>r3(e) || Ay(e) || Iy(e) || n3(e) || s3(e) || o3(e), n3 = (e)=>e.type === "doc-unavailable", Iy = (e)=>e.type === "request", r3 = (e)=>e.type === "sync", Ay = (e)=>e.type === "ephemeral", s3 = (e)=>e.type === "remote-subscription-change", o3 = (e)=>e.type === "remote-heads-changed", i3 = (e)=>`${e.senderId}:${e.sessionId}`;
    class a3 extends ks {
        peerId;
        peerMetadata;
        #t;
        #e = {};
        #r = 0;
        #n = Math.random().toString(36).slice(2);
        #s = {};
        #o = 0;
        #a = [];
        constructor(t, n = l3(), r){
            super(), this.peerId = n, this.peerMetadata = r, this.#t = jr(`automerge-repo:network:${this.peerId}`), t.forEach((s)=>this.addNetworkAdapter(s));
        }
        addNetworkAdapter(t) {
            this.#a.push(t), t.once("ready", ()=>{
                this.#o++, this.#t("Adapters ready: ", this.#o, "/", this.#a.length), this.#o === this.#a.length && this.emit("ready");
            }), t.on("peer-candidate", ({ peerId: n, peerMetadata: r })=>{
                this.#t(`peer candidate: ${n} `), this.#e[n] || (this.#e[n] = t), this.emit("peer", {
                    peerId: n,
                    peerMetadata: r
                });
            }), t.on("peer-disconnected", ({ peerId: n })=>{
                this.#t(`peer disconnected: ${n} `), delete this.#e[n], this.emit("peer-disconnected", {
                    peerId: n
                });
            }), t.on("message", (n)=>{
                if (!t3(n)) {
                    this.#t(`invalid message: ${JSON.stringify(n)}`);
                    return;
                }
                if (this.#t(`message from ${n.senderId}`), Ay(n)) {
                    const r = i3(n);
                    (this.#s[r] === void 0 || n.count > this.#s[r]) && (this.#s[r] = n.count, this.emit("message", n));
                    return;
                }
                this.emit("message", n);
            }), t.on("close", ()=>{
                this.#t("adapter closed"), Object.entries(this.#e).forEach(([n, r])=>{
                    r === t && delete this.#e[n];
                });
            }), this.peerMetadata.then((n)=>{
                t.connect(this.peerId, n);
            }).catch((n)=>{
                this.#t("error connecting to network", n);
            });
        }
        send(t) {
            const n = this.#e[t.targetId];
            if (!n) {
                this.#t(`Tried to send message but peer not found: ${t.targetId}`);
                return;
            }
            const s = ((o)=>o.type === "ephemeral" ? "count" in o ? o : {
                    ...o,
                    count: ++this.#r,
                    sessionId: this.#n,
                    senderId: this.peerId
                } : {
                    ...o,
                    senderId: this.peerId
                })(t);
            this.#t("sending message %o", s), n.send(s);
        }
        isReady = ()=>this.#o === this.#a.length;
        whenReady = async ()=>{
            if (!this.isReady()) return new Promise((t)=>{
                this.once("ready", ()=>{
                    t();
                });
            });
        };
    }
    function l3() {
        return `user-${Math.round(Math.random() * 1e5)}`;
    }
    function Oy(e) {
        let t = 0;
        e.forEach((s)=>{
            t += s.length;
        });
        const n = new Uint8Array(t);
        let r = 0;
        return e.forEach((s)=>{
            n.set(s, r), r += s.length;
        }), n;
    }
    var Ty = {
        exports: {}
    };
    (function(e) {
        (function(t, n) {
            var r = {};
            n(r);
            var s = r.default;
            for(var o in r)s[o] = r[o];
            e.exports = s;
        })(C_, function(t) {
            t.__esModule = !0, t.digestLength = 32, t.blockSize = 64;
            var n = new Uint32Array([
                1116352408,
                1899447441,
                3049323471,
                3921009573,
                961987163,
                1508970993,
                2453635748,
                2870763221,
                3624381080,
                310598401,
                607225278,
                1426881987,
                1925078388,
                2162078206,
                2614888103,
                3248222580,
                3835390401,
                4022224774,
                264347078,
                604807628,
                770255983,
                1249150122,
                1555081692,
                1996064986,
                2554220882,
                2821834349,
                2952996808,
                3210313671,
                3336571891,
                3584528711,
                113926993,
                338241895,
                666307205,
                773529912,
                1294757372,
                1396182291,
                1695183700,
                1986661051,
                2177026350,
                2456956037,
                2730485921,
                2820302411,
                3259730800,
                3345764771,
                3516065817,
                3600352804,
                4094571909,
                275423344,
                430227734,
                506948616,
                659060556,
                883997877,
                958139571,
                1322822218,
                1537002063,
                1747873779,
                1955562222,
                2024104815,
                2227730452,
                2361852424,
                2428436474,
                2756734187,
                3204031479,
                3329325298
            ]);
            function r(h, d, p, m, x) {
                for(var w, _, g, A, P, j, N, F, J, K, se, H, y; x >= 64;){
                    for(w = d[0], _ = d[1], g = d[2], A = d[3], P = d[4], j = d[5], N = d[6], F = d[7], K = 0; K < 16; K++)se = m + K * 4, h[K] = (p[se] & 255) << 24 | (p[se + 1] & 255) << 16 | (p[se + 2] & 255) << 8 | p[se + 3] & 255;
                    for(K = 16; K < 64; K++)J = h[K - 2], H = (J >>> 17 | J << 32 - 17) ^ (J >>> 19 | J << 32 - 19) ^ J >>> 10, J = h[K - 15], y = (J >>> 7 | J << 32 - 7) ^ (J >>> 18 | J << 32 - 18) ^ J >>> 3, h[K] = (H + h[K - 7] | 0) + (y + h[K - 16] | 0);
                    for(K = 0; K < 64; K++)H = (((P >>> 6 | P << 32 - 6) ^ (P >>> 11 | P << 32 - 11) ^ (P >>> 25 | P << 32 - 25)) + (P & j ^ ~P & N) | 0) + (F + (n[K] + h[K] | 0) | 0) | 0, y = ((w >>> 2 | w << 32 - 2) ^ (w >>> 13 | w << 32 - 13) ^ (w >>> 22 | w << 32 - 22)) + (w & _ ^ w & g ^ _ & g) | 0, F = N, N = j, j = P, P = A + H | 0, A = g, g = _, _ = w, w = H + y | 0;
                    d[0] += w, d[1] += _, d[2] += g, d[3] += A, d[4] += P, d[5] += j, d[6] += N, d[7] += F, m += 64, x -= 64;
                }
                return m;
            }
            var s = function() {
                function h() {
                    this.digestLength = t.digestLength, this.blockSize = t.blockSize, this.state = new Int32Array(8), this.temp = new Int32Array(64), this.buffer = new Uint8Array(128), this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this.reset();
                }
                return h.prototype.reset = function() {
                    return this.state[0] = 1779033703, this.state[1] = 3144134277, this.state[2] = 1013904242, this.state[3] = 2773480762, this.state[4] = 1359893119, this.state[5] = 2600822924, this.state[6] = 528734635, this.state[7] = 1541459225, this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this;
                }, h.prototype.clean = function() {
                    for(var d = 0; d < this.buffer.length; d++)this.buffer[d] = 0;
                    for(var d = 0; d < this.temp.length; d++)this.temp[d] = 0;
                    this.reset();
                }, h.prototype.update = function(d, p) {
                    if (p === void 0 && (p = d.length), this.finished) throw new Error("SHA256: can't update because hash was finished.");
                    var m = 0;
                    if (this.bytesHashed += p, this.bufferLength > 0) {
                        for(; this.bufferLength < 64 && p > 0;)this.buffer[this.bufferLength++] = d[m++], p--;
                        this.bufferLength === 64 && (r(this.temp, this.state, this.buffer, 0, 64), this.bufferLength = 0);
                    }
                    for(p >= 64 && (m = r(this.temp, this.state, d, m, p), p %= 64); p > 0;)this.buffer[this.bufferLength++] = d[m++], p--;
                    return this;
                }, h.prototype.finish = function(d) {
                    if (!this.finished) {
                        var p = this.bytesHashed, m = this.bufferLength, x = p / 536870912 | 0, w = p << 3, _ = p % 64 < 56 ? 64 : 128;
                        this.buffer[m] = 128;
                        for(var g = m + 1; g < _ - 8; g++)this.buffer[g] = 0;
                        this.buffer[_ - 8] = x >>> 24 & 255, this.buffer[_ - 7] = x >>> 16 & 255, this.buffer[_ - 6] = x >>> 8 & 255, this.buffer[_ - 5] = x >>> 0 & 255, this.buffer[_ - 4] = w >>> 24 & 255, this.buffer[_ - 3] = w >>> 16 & 255, this.buffer[_ - 2] = w >>> 8 & 255, this.buffer[_ - 1] = w >>> 0 & 255, r(this.temp, this.state, this.buffer, 0, _), this.finished = !0;
                    }
                    for(var g = 0; g < 8; g++)d[g * 4 + 0] = this.state[g] >>> 24 & 255, d[g * 4 + 1] = this.state[g] >>> 16 & 255, d[g * 4 + 2] = this.state[g] >>> 8 & 255, d[g * 4 + 3] = this.state[g] >>> 0 & 255;
                    return this;
                }, h.prototype.digest = function() {
                    var d = new Uint8Array(this.digestLength);
                    return this.finish(d), d;
                }, h.prototype._saveState = function(d) {
                    for(var p = 0; p < this.state.length; p++)d[p] = this.state[p];
                }, h.prototype._restoreState = function(d, p) {
                    for(var m = 0; m < this.state.length; m++)this.state[m] = d[m];
                    this.bytesHashed = p, this.finished = !1, this.bufferLength = 0;
                }, h;
            }();
            t.Hash = s;
            var o = function() {
                function h(d) {
                    this.inner = new s, this.outer = new s, this.blockSize = this.inner.blockSize, this.digestLength = this.inner.digestLength;
                    var p = new Uint8Array(this.blockSize);
                    if (d.length > this.blockSize) new s().update(d).finish(p).clean();
                    else for(var m = 0; m < d.length; m++)p[m] = d[m];
                    for(var m = 0; m < p.length; m++)p[m] ^= 54;
                    this.inner.update(p);
                    for(var m = 0; m < p.length; m++)p[m] ^= 106;
                    this.outer.update(p), this.istate = new Uint32Array(8), this.ostate = new Uint32Array(8), this.inner._saveState(this.istate), this.outer._saveState(this.ostate);
                    for(var m = 0; m < p.length; m++)p[m] = 0;
                }
                return h.prototype.reset = function() {
                    return this.inner._restoreState(this.istate, this.inner.blockSize), this.outer._restoreState(this.ostate, this.outer.blockSize), this;
                }, h.prototype.clean = function() {
                    for(var d = 0; d < this.istate.length; d++)this.ostate[d] = this.istate[d] = 0;
                    this.inner.clean(), this.outer.clean();
                }, h.prototype.update = function(d) {
                    return this.inner.update(d), this;
                }, h.prototype.finish = function(d) {
                    return this.outer.finished ? this.outer.finish(d) : (this.inner.finish(d), this.outer.update(d, this.digestLength).finish(d)), this;
                }, h.prototype.digest = function() {
                    var d = new Uint8Array(this.digestLength);
                    return this.finish(d), d;
                }, h;
            }();
            t.HMAC = o;
            function i(h) {
                var d = new s().update(h), p = d.digest();
                return d.clean(), p;
            }
            t.hash = i, t.default = i;
            function a(h, d) {
                var p = new o(h).update(d), m = p.digest();
                return p.clean(), m;
            }
            t.hmac = a;
            function l(h, d, p, m) {
                var x = m[0];
                if (x === 0) throw new Error("hkdf: cannot expand more");
                d.reset(), x > 1 && d.update(h), p && d.update(p), d.update(m), d.finish(h), m[0]++;
            }
            var f = new Uint8Array(t.digestLength);
            function c(h, d, p, m) {
                d === void 0 && (d = f), m === void 0 && (m = 32);
                for(var x = new Uint8Array([
                    1
                ]), w = a(d, h), _ = new o(w), g = new Uint8Array(_.digestLength), A = g.length, P = new Uint8Array(m), j = 0; j < m; j++)A === g.length && (l(g, _, p, x), A = 0), P[j] = g[A++];
                return _.clean(), g.fill(0), x.fill(0), P;
            }
            t.hkdf = c;
            function u(h, d, p, m) {
                for(var x = new o(h), w = x.digestLength, _ = new Uint8Array(4), g = new Uint8Array(w), A = new Uint8Array(w), P = new Uint8Array(m), j = 0; j * w < m; j++){
                    var N = j + 1;
                    _[0] = N >>> 24 & 255, _[1] = N >>> 16 & 255, _[2] = N >>> 8 & 255, _[3] = N >>> 0 & 255, x.reset(), x.update(d), x.update(_), x.finish(A);
                    for(var F = 0; F < w; F++)g[F] = A[F];
                    for(var F = 2; F <= p; F++){
                        x.reset(), x.update(A).finish(A);
                        for(var J = 0; J < w; J++)g[J] ^= A[J];
                    }
                    for(var F = 0; F < w && j * w + F < m; F++)P[j * w + F] = g[F];
                }
                for(var j = 0; j < w; j++)g[j] = A[j] = 0;
                for(var j = 0; j < 4; j++)_[j] = 0;
                return x.clean(), P;
            }
            t.pbkdf2 = u;
        });
    })(Ty);
    var u3 = Ty.exports;
    function jy(e) {
        const t = u3.hash(e);
        return f3(t);
    }
    function c3(e) {
        const t = new TextEncoder, n = Oy(e.map((r)=>t.encode(r)));
        return jy(n);
    }
    function f3(e) {
        return Array.from(e, (t)=>t.toString(16).padStart(2, "0")).join("");
    }
    function d3(e) {
        if (e.length < 2) return null;
        const t = e[e.length - 2];
        return t === "snapshot" || t === "incremental" ? t : null;
    }
    class h3 {
        #t;
        #e = new Map;
        #r = new Map;
        #n = !1;
        #s = jr("automerge-repo:storage-subsystem");
        constructor(t){
            this.#t = t;
        }
        async id() {
            const t = await this.#t.load([
                "storage-adapter-id"
            ]);
            let n;
            return t ? n = new TextDecoder().decode(t) : (n = cg(), await this.#t.save([
                "storage-adapter-id"
            ], new TextEncoder().encode(n))), n;
        }
        async load(t, n) {
            const r = [
                t,
                n
            ];
            return await this.#t.load(r);
        }
        async save(t, n, r) {
            const s = [
                t,
                n
            ];
            await this.#t.save(s, r);
        }
        async remove(t, n) {
            const r = [
                t,
                n
            ];
            await this.#t.remove(r);
        }
        async loadDoc(t) {
            const n = await this.#t.loadRange([
                t
            ]), r = [], s = [];
            for (const a of n){
                if (a.data === void 0) continue;
                const l = d3(a.key);
                l != null && (s.push({
                    key: a.key,
                    type: l,
                    size: a.data.length
                }), r.push(a.data));
            }
            this.#r.set(t, s);
            const o = Oy(r);
            if (o.length === 0) return null;
            const i = pg(La(), o);
            return this.#e.set(t, Kt(i)), i;
        }
        async saveDoc(t, n) {
            if (!this.#i(t, n)) return;
            const r = this.#r.get(t) ?? [];
            this.#l(r) ? await this.#a(t, n, r) : await this.#o(t, n), this.#e.set(t, Kt(n));
        }
        async removeDoc(t) {
            await this.#t.removeRange([
                t,
                "snapshot"
            ]), await this.#t.removeRange([
                t,
                "incremental"
            ]), await this.#t.removeRange([
                t,
                "sync-state"
            ]);
        }
        async #o(t, n) {
            const r = jv(n, this.#e.get(t) ?? []);
            if (r && r.length > 0) {
                const s = [
                    t,
                    "incremental",
                    jy(r)
                ];
                this.#s(`Saving incremental ${s} for document ${t}`), await this.#t.save(s, r), this.#r.has(t) || this.#r.set(t, []), this.#r.get(t).push({
                    key: s,
                    type: "incremental",
                    size: r.length
                }), this.#e.set(t, Kt(n));
            } else return Promise.resolve();
        }
        async #a(t, n, r) {
            this.#n = !0;
            const s = gg(n), o = c3(Kt(n)), i = [
                t,
                "snapshot",
                o
            ], a = new Set(r.map((f)=>f.key).filter((f)=>f[2] !== o));
            this.#s(`Saving snapshot ${i} for document ${t}`), this.#s(`deleting old chunks ${Array.from(a)}`), await this.#t.save(i, s);
            for (const f of a)await this.#t.remove(f);
            const l = this.#r.get(t)?.filter((f)=>!a.has(f.key)) ?? [];
            l.push({
                key: i,
                type: "snapshot",
                size: s.length
            }), this.#r.set(t, l), this.#n = !1;
        }
        async loadSyncState(t, n) {
            const r = [
                t,
                "sync-state",
                n
            ], s = await this.#t.load(r);
            return s ? mg(s) : void 0;
        }
        async saveSyncState(t, n, r) {
            const s = [
                t,
                "sync-state",
                n
            ];
            await this.#t.save(s, yg(r));
        }
        #i(t, n) {
            const r = this.#e.get(t);
            if (!r) return !0;
            const s = Kt(n);
            return !Rf(s, r);
        }
        #l(t) {
            if (this.#n) return !1;
            let n = 0, r = 0;
            for (const s of t)s.type === "snapshot" ? n += s.size : r += s.size;
            return n < 1024 || r >= n;
        }
    }
    class My extends ks {
    }
    class p3 extends My {
        #t;
        syncDebounceRate = 100;
        #e = [];
        #r = {};
        #n = {};
        #s = {};
        #o = [];
        #a = !1;
        #i;
        #l;
        constructor({ handle: t, onLoadSyncState: n }){
            super(), this.#i = t, this.#l = n ?? (()=>Promise.resolve(void 0));
            const r = t.documentId.slice(0, 5);
            this.#t = jr(`automerge-repo:docsync:${r}`), t.on("change", tc(()=>this.#g(), this.syncDebounceRate)), t.on("ephemeral-message-outbound", (s)=>this.#y(s)), (async ()=>(await t.doc([
                    Ml,
                    ui
                ]), this.#p()))();
        }
        get peerStates() {
            return this.#n;
        }
        get documentId() {
            return this.#i.documentId;
        }
        async #g() {
            this.#t("syncWithPeers");
            const t = await this.#i.doc();
            t !== void 0 && this.#e.forEach((n)=>this.#d(n, t));
        }
        async #y({ data: t }) {
            this.#t("broadcastToPeers", this.#e), this.#e.forEach((n)=>this.#m(n, t));
        }
        #m(t, n) {
            this.#t(`sendEphemeralMessage ->${t}`);
            const r = {
                type: "ephemeral",
                targetId: t,
                documentId: this.#i.documentId,
                data: n
            };
            this.emit("message", r);
        }
        #c(t, n) {
            this.#_(t), t in this.#n || (this.#n[t] = "unknown");
            const r = this.#s[t];
            if (r) {
                n(r);
                return;
            }
            let s = this.#r[t];
            s || (this.#l(t).then((o)=>{
                this.#w(t, o ?? Ov());
            }).catch((o)=>{
                this.#t(`Error loading sync state for ${t}: ${o}`);
            }), s = this.#r[t] = []), s.push(n);
        }
        #_(t) {
            this.#e.includes(t) || (this.#e.push(t), this.emit("open-doc", {
                documentId: this.documentId,
                peerId: t
            }));
        }
        #w(t, n) {
            const r = this.#r[t];
            if (r) for (const s of r)s(n);
            delete this.#r[t], this.#s[t] = n;
        }
        #f(t, n) {
            this.#s[t] = n, this.emit("sync-state", {
                peerId: t,
                syncState: n,
                documentId: this.#i.documentId
            });
        }
        #d(t, n) {
            this.#t(`sendSyncMessage ->${t}`), this.#c(t, (r)=>{
                const [s, o] = Iv(n, r);
                if (o) {
                    this.#f(t, s);
                    const i = Kt(n).length === 0;
                    !this.#i.isReady() && i && s.sharedHeads.length === 0 && !Object.values(this.#n).includes("has") && this.#n[t] === "unknown" ? this.emit("message", {
                        type: "request",
                        targetId: t,
                        documentId: this.#i.documentId,
                        data: o
                    }) : this.emit("message", {
                        type: "sync",
                        targetId: t,
                        data: o,
                        documentId: this.#i.documentId
                    }), i || (this.#n[t] = "has");
                }
            });
        }
        hasPeer(t) {
            return this.#e.includes(t);
        }
        beginSync(t) {
            const n = t.every((s)=>this.#n[s] in [
                    "unavailable",
                    "wants"
                ]), r = this.#i.doc([
                Ml,
                ui,
                Eh
            ]).then((s)=>{
                if (this.#a = !0, this.#u(), !(s === void 0 && n)) return s ?? La();
            });
            this.#t(`beginSync: ${t.join(", ")}`), t.forEach((s)=>{
                this.#c(s, (o)=>{
                    const i = mg(yg(o));
                    this.#f(s, i), r.then((a)=>{
                        a && this.#d(s, a);
                    }).catch((a)=>{
                        this.#t(`Error loading doc for ${s}: ${a}`);
                    });
                });
            });
        }
        endSync(t) {
            this.#t(`removing peer ${t}`), this.#e = this.#e.filter((n)=>n !== t);
        }
        receiveMessage(t) {
            switch(t.type){
                case "sync":
                case "request":
                    this.receiveSyncMessage(t);
                    break;
                case "ephemeral":
                    this.receiveEphemeralMessage(t);
                    break;
                case "doc-unavailable":
                    this.#n[t.senderId] = "unavailable", this.#u();
                    break;
                default:
                    throw new Error(`unknown message type: ${t}`);
            }
        }
        receiveEphemeralMessage(t) {
            if (t.documentId !== this.#i.documentId) throw new Error("channelId doesn't match documentId");
            const { senderId: n, data: r } = t, s = Rb(new Uint8Array(r));
            this.#i.emit("ephemeral-message", {
                handle: this.#i,
                senderId: n,
                message: s
            }), this.#e.forEach((o)=>{
                o !== n && this.emit("message", {
                    ...t,
                    targetId: o
                });
            });
        }
        receiveSyncMessage(t) {
            if (t.documentId !== this.#i.documentId) throw new Error("channelId doesn't match documentId");
            if (!this.#i.inState([
                Ml,
                ui,
                Eh
            ])) {
                this.#o.push({
                    message: t,
                    received: new Date
                });
                return;
            }
            this.#p(), this.#h(t);
        }
        #h(t) {
            Iy(t) && (this.#n[t.senderId] = "wants"), this.#u(), Tv(t.data).heads.length > 0 && (this.#n[t.senderId] = "has"), this.#c(t.senderId, (n)=>{
                this.#i.update((r)=>{
                    const [s, o] = Av(r, n, t.data);
                    return this.#f(t.senderId, o), this.#d(t.senderId, r), s;
                }), this.#u();
            });
        }
        #u() {
            this.#a && this.#i.inState([
                ui
            ]) && this.#e.every((t)=>this.#n[t] === "unavailable" || this.#n[t] === "wants") && (this.#e.filter((t)=>this.#n[t] === "wants").forEach((t)=>{
                const n = {
                    type: "doc-unavailable",
                    documentId: this.#i.documentId,
                    targetId: t
                };
                this.emit("message", n);
            }), this.#i.unavailable());
        }
        #p() {
            for (const t of this.#o)this.#h(t.message);
            this.#o = [];
        }
    }
    const Rl = jr("automerge-repo:collectionsync");
    class g3 extends My {
        repo;
        #t = new Set;
        #e = {};
        #r = {};
        constructor(t){
            super(), this.repo = t;
        }
        #n(t) {
            if (!this.#e[t]) {
                const n = this.repo.find(Af({
                    documentId: t
                }));
                this.#e[t] = this.#s(n);
            }
            return this.#e[t];
        }
        #s(t) {
            const n = new p3({
                handle: t,
                onLoadSyncState: async (r)=>{
                    if (!this.repo.storageSubsystem) return;
                    const { storageId: s, isEphemeral: o } = this.repo.peerMetadataByPeerId[r] || {};
                    if (!(!s || o)) return this.repo.storageSubsystem.loadSyncState(t.documentId, s);
                }
            });
            return n.on("message", (r)=>this.emit("message", r)), n.on("open-doc", (r)=>this.emit("open-doc", r)), n.on("sync-state", (r)=>this.emit("sync-state", r)), n;
        }
        async #o(t) {
            const n = Array.from(this.#t), r = [];
            for (const s of n)await this.repo.sharePolicy(s, t) && r.push(s);
            return r;
        }
        async receiveMessage(t) {
            Rl(`onSyncMessage: ${t.senderId}, ${t.documentId}, ${"data" in t ? t.data.byteLength + "bytes" : ""}`);
            const n = t.documentId;
            if (!n) throw new Error("received a message with an invalid documentId");
            this.#r[n] = !0;
            const r = this.#n(n);
            r.receiveMessage(t);
            const s = await this.#o(n);
            r.beginSync(s.filter((o)=>!r.hasPeer(o)));
        }
        addDocument(t) {
            if (this.#r[t]) return;
            const n = this.#n(t);
            this.#o(t).then((r)=>{
                n.beginSync(r);
            });
        }
        removeDocument(t) {
            throw new Error("not implemented");
        }
        addPeer(t) {
            if (Rl(`adding ${t} & synchronizing with them`), !this.#t.has(t)) {
                this.#t.add(t);
                for (const n of Object.values(this.#e)){
                    const { documentId: r } = n;
                    this.repo.sharePolicy(t, r).then((s)=>{
                        s && n.beginSync([
                            t
                        ]);
                    });
                }
            }
        }
        removePeer(t) {
            Rl(`removing peer ${t}`), this.#t.delete(t);
            for (const n of Object.values(this.#e))n.endSync(t);
        }
        get peers() {
            return Array.from(this.#t);
        }
    }
    class y3 extends ks {
        #t;
        networkSubsystem;
        storageSubsystem;
        saveDebounceRate = 100;
        #e = {};
        #r;
        sharePolicy = async ()=>!0;
        peerMetadataByPeerId = {};
        #n = new e3;
        #s = !1;
        constructor({ storage: t, network: n = [], peerId: r, sharePolicy: s, isEphemeral: o = t === void 0, enableRemoteHeadsGossiping: i = !1 } = {}){
            super(), this.#s = i, this.#t = jr("automerge-repo:repo"), this.sharePolicy = s ?? this.sharePolicy, this.on("document", async ({ handle: c, isNew: u })=>{
                if (a) {
                    const h = ({ handle: d, doc: p })=>{
                        a.saveDoc(d.documentId, p);
                    };
                    if (c.on("heads-changed", tc(h, this.saveDebounceRate)), u) await a.saveDoc(c.documentId, c.docSync());
                    else {
                        const d = await a.loadDoc(c.documentId);
                        d && c.update(()=>d);
                    }
                }
                c.on("unavailable", ()=>{
                    this.#t("document unavailable", {
                        documentId: c.documentId
                    }), this.emit("unavailable-document", {
                        documentId: c.documentId
                    });
                }), this.networkSubsystem.isReady() ? c.request() : (c.awaitNetwork(), this.networkSubsystem.whenReady().then(()=>{
                    c.networkReady();
                }).catch((h)=>{
                    this.#t("error waiting for network", {
                        err: h
                    });
                })), this.#r.addDocument(c.documentId);
            }), this.on("delete-document", ({ documentId: c })=>{
                a && a.removeDoc(c).catch((u)=>{
                    this.#t("error deleting document", {
                        documentId: c,
                        err: u
                    });
                });
            }), this.#r = new g3(this), this.#r.on("message", (c)=>{
                this.#t(`sending ${c.type} message to ${c.targetId}`), f.send(c);
            }), this.#s && this.#r.on("open-doc", ({ peerId: c, documentId: u })=>{
                this.#n.subscribePeerToDoc(c, u);
            });
            const a = t ? new h3(t) : void 0;
            this.storageSubsystem = a;
            const l = (async ()=>({
                    storageId: await a?.id(),
                    isEphemeral: o
                }))(), f = new a3(n, r, l);
            this.networkSubsystem = f, f.on("peer", async ({ peerId: c, peerMetadata: u })=>{
                this.#t("peer connected", {
                    peerId: c
                }), u && (this.peerMetadataByPeerId[c] = {
                    ...u
                }), this.sharePolicy(c).then((h)=>{
                    h && this.#s && this.#n.addGenerousPeer(c);
                }).catch((h)=>{
                    console.log("error in share policy", {
                        err: h
                    });
                }), this.#r.addPeer(c);
            }), f.on("peer-disconnected", ({ peerId: c })=>{
                this.#r.removePeer(c), this.#n.removePeer(c);
            }), f.on("message", async (c)=>{
                this.#o(c);
            }), this.#r.on("sync-state", (c)=>{
                this.#i(c);
                const u = this.#e[c.documentId], { storageId: h } = this.peerMetadataByPeerId[c.peerId] || {};
                if (!h) return;
                const d = u.getRemoteHeads(h);
                c.syncState.theirHeads && (!d || !Rf(d, c.syncState.theirHeads)) && c.syncState.theirHeads && (u.setRemoteHeads(h, c.syncState.theirHeads), h && this.#s && this.#n.handleImmediateRemoteHeadsChanged(c.documentId, h, c.syncState.theirHeads));
            }), this.#s && (this.#n.on("notify-remote-heads", (c)=>{
                this.networkSubsystem.send({
                    type: "remote-heads-changed",
                    targetId: c.targetId,
                    documentId: c.documentId,
                    newHeads: {
                        [c.storageId]: {
                            heads: c.heads,
                            timestamp: c.timestamp
                        }
                    }
                });
            }), this.#n.on("change-remote-subs", (c)=>{
                this.#t("change-remote-subs", c);
                for (const u of c.peers)this.networkSubsystem.send({
                    type: "remote-subscription-change",
                    targetId: u,
                    add: c.add,
                    remove: c.remove
                });
            }), this.#n.on("remote-heads-changed", (c)=>{
                this.#e[c.documentId].setRemoteHeads(c.storageId, c.remoteHeads);
            }));
        }
        #o(t) {
            switch(t.type){
                case "remote-subscription-change":
                    this.#s && this.#n.handleControlMessage(t);
                    break;
                case "remote-heads-changed":
                    this.#s && this.#n.handleRemoteHeads(t);
                    break;
                case "sync":
                case "request":
                case "ephemeral":
                case "doc-unavailable":
                    this.#r.receiveMessage(t).catch((n)=>{
                        console.log("error receiving message", {
                            err: n
                        });
                    });
            }
        }
        #a = {};
        #i(t) {
            if (!this.storageSubsystem) return;
            const { storageId: n, isEphemeral: r } = this.peerMetadataByPeerId[t.peerId] || {};
            if (!n || r) return;
            let s = this.#a[n];
            s || (s = this.#a[n] = tc(({ documentId: o, syncState: i })=>{
                this.storageSubsystem.saveSyncState(o, n, i);
            }, this.saveDebounceRate)), s(t);
        }
        #l({ documentId: t, isNew: n, initialValue: r }) {
            if (this.#e[t]) return this.#e[t];
            if (!t) throw new Error(`Invalid documentId ${t}`);
            const s = new Vb(t, {
                isNew: n,
                initialValue: r
            });
            return this.#e[t] = s, s;
        }
        get handles() {
            return this.#e;
        }
        get peers() {
            return this.#r.peers;
        }
        getStorageIdOfPeer(t) {
            return this.peerMetadataByPeerId[t]?.storageId;
        }
        create(t) {
            const { documentId: n } = If(wb()), r = this.#l({
                documentId: n,
                isNew: !0,
                initialValue: t
            });
            return this.emit("document", {
                handle: r,
                isNew: !0
            }), r;
        }
        clone(t) {
            if (!t.isReady()) throw new Error(`Cloned handle is not yet in ready state.
        (Try await handle.waitForReady() first.)`);
            const n = t.docSync();
            if (!n) throw new Error("Cloned handle doesn't have a document.");
            const r = this.create();
            return r.update(()=>rh(n)), r;
        }
        find(t) {
            const n = Il(t);
            if (this.#e[n]) return this.#e[n].isUnavailable() && setTimeout(()=>{
                this.#e[n].emit("unavailable", {
                    handle: this.#e[n]
                });
            }), this.#e[n];
            const r = this.#l({
                documentId: n,
                isNew: !1
            });
            return this.emit("document", {
                handle: r,
                isNew: !1
            }), r;
        }
        delete(t) {
            const n = Il(t);
            this.#l({
                documentId: n,
                isNew: !1
            }).delete(), delete this.#e[n], this.emit("delete-document", {
                documentId: n
            });
        }
        async export(t) {
            const n = Il(t), s = await this.#l({
                documentId: n,
                isNew: !1
            }).doc();
            if (s) return gg(s);
        }
        import(t) {
            const n = Rv(t), r = this.create();
            return r.update(()=>rh(n)), r;
        }
        subscribeToRemotes = (t)=>{
            this.#s ? (this.#t("subscribeToRemotes", {
                remotes: t
            }), this.#n.subscribeToRemotes(t)) : this.#t("WARN: subscribeToRemotes called but remote heads gossiping is not enabled");
        };
        storageId = async ()=>{
            if (this.storageSubsystem) return this.storageSubsystem.id();
        };
        async flush(t) {
            if (!this.storageSubsystem) return;
            const n = t ? t.map((r)=>this.#e[r]) : Object.values(this.#e);
            await Promise.all(n.map(async (r)=>{
                const s = r.docSync();
                if (s) return this.storageSubsystem.saveDoc(r.documentId, s);
            }));
        }
    }
    class m3 extends ks {
        peerId;
        peerMetadata;
    }
    const _3 = "/tasks/assets/automerge_wasm_bg-211c8fa6.wasm", w3 = async (e = {}, t)=>{
        let n;
        if (t.startsWith("data:")) {
            const r = t.replace(/^data:.*?base64,/, "");
            let s;
            if (typeof Buffer == "function" && typeof Buffer.from == "function") s = Buffer.from(r, "base64");
            else if (typeof atob == "function") {
                const o = atob(r);
                s = new Uint8Array(o.length);
                for(let i = 0; i < o.length; i++)s[i] = o.charCodeAt(i);
            } else throw new Error("Cannot decode base64-encoded data URL");
            n = await WebAssembly.instantiate(s, e);
        } else {
            const r = await fetch(t), s = r.headers.get("Content-Type") || "";
            if ("instantiateStreaming" in WebAssembly && s.startsWith("application/wasm")) n = await WebAssembly.instantiateStreaming(r, e);
            else {
                const o = await r.arrayBuffer();
                n = await WebAssembly.instantiate(o, e);
            }
        }
        return n.instance.exports;
    };
    let b;
    function Ry(e) {
        b = e;
    }
    const mn = new Array(128).fill(void 0);
    mn.push(void 0, null, !0, !1);
    function Y(e) {
        return mn[e];
    }
    let Pt = 0, fi = null;
    function Xs() {
        return (fi === null || fi.byteLength === 0) && (fi = new Uint8Array(b.memory.buffer)), fi;
    }
    const v3 = typeof TextEncoder > "u" ? (0, module.require)("util").TextEncoder : TextEncoder;
    let Oi = new v3("utf-8");
    const b3 = typeof Oi.encodeInto == "function" ? function(e, t) {
        return Oi.encodeInto(e, t);
    } : function(e, t) {
        const n = Oi.encode(e);
        return t.set(n), {
            read: e.length,
            written: n.length
        };
    };
    function un(e, t, n) {
        if (n === void 0) {
            const a = Oi.encode(e), l = t(a.length, 1) >>> 0;
            return Xs().subarray(l, l + a.length).set(a), Pt = a.length, l;
        }
        let r = e.length, s = t(r, 1) >>> 0;
        const o = Xs();
        let i = 0;
        for(; i < r; i++){
            const a = e.charCodeAt(i);
            if (a > 127) break;
            o[s + i] = a;
        }
        if (i !== r) {
            i !== 0 && (e = e.slice(i)), s = n(s, r, r = i + e.length * 3, 1) >>> 0;
            const a = Xs().subarray(s + i, s + r), l = b3(e, a);
            i += l.written, s = n(s, r, i, 1) >>> 0;
        }
        return Pt = i, s;
    }
    let Fr = null;
    function O() {
        return (Fr === null || Fr.buffer.detached === !0 || Fr.buffer.detached === void 0 && Fr.buffer !== b.memory.buffer) && (Fr = new DataView(b.memory.buffer)), Fr;
    }
    let Zs = mn.length;
    function U(e) {
        Zs === mn.length && mn.push(mn.length + 1);
        const t = Zs;
        return Zs = mn[t], mn[t] = e, t;
    }
    function In(e, t) {
        try {
            return e.apply(this, t);
        } catch (n) {
            b.__wbindgen_exn_store(U(n));
        }
    }
    const x3 = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
    let Py = new x3("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    });
    Py.decode();
    function Dt(e, t) {
        return e = e >>> 0, Py.decode(Xs().subarray(e, e + t));
    }
    function S3(e, t) {
        return e = e >>> 0, Xs().subarray(e / 1, e / 1 + t);
    }
    function k3(e) {
        e < 132 || (mn[e] = Zs, Zs = e);
    }
    function W(e) {
        const t = Y(e);
        return k3(e), t;
    }
    function nc(e) {
        const t = typeof e;
        if (t == "number" || t == "boolean" || e == null) return `${e}`;
        if (t == "string") return `"${e}"`;
        if (t == "symbol") {
            const s = e.description;
            return s == null ? "Symbol" : `Symbol(${s})`;
        }
        if (t == "function") {
            const s = e.name;
            return typeof s == "string" && s.length > 0 ? `Function(${s})` : "Function";
        }
        if (Array.isArray(e)) {
            const s = e.length;
            let o = "[";
            s > 0 && (o += nc(e[0]));
            for(let i = 1; i < s; i++)o += ", " + nc(e[i]);
            return o += "]", o;
        }
        const n = /\[object ([^\]]+)\]/.exec(toString.call(e));
        let r;
        if (n && n.length > 1) r = n[1];
        else return toString.call(e);
        if (r == "Object") try {
            return "Object(" + JSON.stringify(e) + ")";
        } catch  {
            return "Object";
        }
        return e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : r;
    }
    function he(e) {
        return e == null;
    }
    function ur(e, t) {
        if (!(e instanceof t)) throw new Error(`expected instance of ${t.name}`);
    }
    function C3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.create(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return on.__wrap(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function E3(e, t) {
        try {
            const o = b.__wbindgen_add_to_stack_pointer(-16);
            b.load(o, U(e), U(t));
            var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
            if (s) throw W(r);
            return on.__wrap(n);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function I3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.encodeChange(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return W(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function A3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.decodeChange(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return W(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function O3() {
        const e = b.initSyncState();
        return zt.__wrap(e);
    }
    function T3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.importSyncState(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return zt.__wrap(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function j3(e) {
        ur(e, zt);
        const t = b.exportSyncState(e.__wbg_ptr);
        return W(t);
    }
    function M3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.encodeSyncMessage(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return W(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function R3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.decodeSyncMessage(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return W(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    function P3(e) {
        ur(e, zt);
        const t = b.encodeSyncState(e.__wbg_ptr);
        return W(t);
    }
    function D3(e) {
        try {
            const s = b.__wbindgen_add_to_stack_pointer(-16);
            b.decodeSyncState(s, U(e));
            var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
            if (r) throw W(n);
            return zt.__wrap(t);
        } finally{
            b.__wbindgen_add_to_stack_pointer(16);
        }
    }
    const L3 = Object.freeze({
        Array: 0,
        0: "Array",
        String: 1,
        1: "String"
    }), Ih = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((e)=>b.__wbg_automerge_free(e >>> 0, 1));
    class on {
        static __wrap(t) {
            t = t >>> 0;
            const n = Object.create(on.prototype);
            return n.__wbg_ptr = t, Ih.register(n, n.__wbg_ptr, n), n;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ih.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            b.__wbg_automerge_free(t, 0);
        }
        static new(t, n) {
            try {
                const l = b.__wbindgen_add_to_stack_pointer(-16);
                var r = he(t) ? 0 : un(t, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
                b.automerge_new(l, r, s, n);
                var o = O().getInt32(l + 4 * 0, !0), i = O().getInt32(l + 4 * 1, !0), a = O().getInt32(l + 4 * 2, !0);
                if (a) throw W(i);
                return on.__wrap(o);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        clone(t) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                var n = he(t) ? 0 : un(t, b.__wbindgen_malloc, b.__wbindgen_realloc), r = Pt;
                b.automerge_clone(a, this.__wbg_ptr, n, r);
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return on.__wrap(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        fork(t, n) {
            try {
                const l = b.__wbindgen_add_to_stack_pointer(-16);
                var r = he(t) ? 0 : un(t, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
                b.automerge_fork(l, this.__wbg_ptr, r, s, U(n));
                var o = O().getInt32(l + 4 * 0, !0), i = O().getInt32(l + 4 * 1, !0), a = O().getInt32(l + 4 * 2, !0);
                if (a) throw W(i);
                return on.__wrap(o);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        pendingOps() {
            const t = b.automerge_pendingOps(this.__wbg_ptr);
            return W(t);
        }
        commit(t, n) {
            var r = he(t) ? 0 : un(t, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
            const o = b.automerge_commit(this.__wbg_ptr, r, s, !he(n), he(n) ? 0 : n);
            return W(o);
        }
        merge(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                ur(t, on), b.automerge_merge(o, this.__wbg_ptr, t.__wbg_ptr);
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        rollback() {
            return b.automerge_rollback(this.__wbg_ptr);
        }
        keys(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_keys(i, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        text(t, n) {
            let r, s;
            try {
                const u = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_text(u, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var o = O().getInt32(u + 4 * 0, !0), i = O().getInt32(u + 4 * 1, !0), a = O().getInt32(u + 4 * 2, !0), l = O().getInt32(u + 4 * 3, !0), f = o, c = i;
                if (l) throw f = 0, c = 0, W(a);
                return r = f, s = c, Dt(f, c);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16), b.__wbindgen_free(r, s, 1);
            }
        }
        spans(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_spans(i, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        splice(t, n, r, s) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_splice(a, this.__wbg_ptr, U(t), n, r, U(s));
                var o = O().getInt32(a + 4 * 0, !0), i = O().getInt32(a + 4 * 1, !0);
                if (i) throw W(o);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        updateText(t, n) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_updateText(o, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                if (s) throw W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        updateSpans(t, n) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_updateSpans(o, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                if (s) throw W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        push(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_push(i, this.__wbg_ptr, U(t), U(n), U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        pushObject(t, n) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_pushObject(a, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(a + 4 * 0, !0), s = O().getInt32(a + 4 * 1, !0), o = O().getInt32(a + 4 * 2, !0), i = O().getInt32(a + 4 * 3, !0);
                if (i) throw W(o);
                let l;
                return r !== 0 && (l = Dt(r, s).slice(), b.__wbindgen_free(r, s * 1, 1)), l;
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        insert(t, n, r, s) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_insert(a, this.__wbg_ptr, U(t), n, U(r), U(s));
                var o = O().getInt32(a + 4 * 0, !0), i = O().getInt32(a + 4 * 1, !0);
                if (i) throw W(o);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        splitBlock(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_splitBlock(i, this.__wbg_ptr, U(t), n, U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        joinBlock(t, n) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_joinBlock(o, this.__wbg_ptr, U(t), n);
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                if (s) throw W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        updateBlock(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_updateBlock(i, this.__wbg_ptr, U(t), n, U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getBlock(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getBlock(a, this.__wbg_ptr, U(t), n, he(r) ? 0 : U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        insertObject(t, n, r) {
            try {
                const l = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_insertObject(l, this.__wbg_ptr, U(t), n, U(r));
                var s = O().getInt32(l + 4 * 0, !0), o = O().getInt32(l + 4 * 1, !0), i = O().getInt32(l + 4 * 2, !0), a = O().getInt32(l + 4 * 3, !0);
                if (a) throw W(i);
                let f;
                return s !== 0 && (f = Dt(s, o).slice(), b.__wbindgen_free(s, o * 1, 1)), f;
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        put(t, n, r, s) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_put(a, this.__wbg_ptr, U(t), U(n), U(r), U(s));
                var o = O().getInt32(a + 4 * 0, !0), i = O().getInt32(a + 4 * 1, !0);
                if (i) throw W(o);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        putObject(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_putObject(a, this.__wbg_ptr, U(t), U(n), U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        increment(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_increment(i, this.__wbg_ptr, U(t), U(n), U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        get(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_get(a, this.__wbg_ptr, U(t), U(n), he(r) ? 0 : U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getWithType(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getWithType(a, this.__wbg_ptr, U(t), U(n), he(r) ? 0 : U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        objInfo(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_objInfo(i, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getAll(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getAll(a, this.__wbg_ptr, U(t), U(n), he(r) ? 0 : U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        enableFreeze(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_enableFreeze(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        registerDatatype(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_registerDatatype(i, this.__wbg_ptr, U(t), U(n), U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        applyPatches(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_applyPatches(i, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        applyAndReturnPatches(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_applyAndReturnPatches(i, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        diffIncremental() {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_diffIncremental(s, this.__wbg_ptr);
                var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
                if (r) throw W(n);
                return W(t);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        updateDiffCursor() {
            b.automerge_updateDiffCursor(this.__wbg_ptr);
        }
        resetDiffCursor() {
            b.automerge_resetDiffCursor(this.__wbg_ptr);
        }
        diff(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_diff(i, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        isolate(t) {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_isolate(s, this.__wbg_ptr, U(t));
                var n = O().getInt32(s + 4 * 0, !0), r = O().getInt32(s + 4 * 1, !0);
                if (r) throw W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        integrate() {
            b.automerge_integrate(this.__wbg_ptr);
        }
        length(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_length(i, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var r = O().getFloat64(i + 8 * 0, !0), s = O().getInt32(i + 4 * 2, !0), o = O().getInt32(i + 4 * 3, !0);
                if (o) throw W(s);
                return r;
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        delete(t, n) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_delete(o, this.__wbg_ptr, U(t), U(n));
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                if (s) throw W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        save() {
            const t = b.automerge_save(this.__wbg_ptr);
            return W(t);
        }
        saveIncremental() {
            const t = b.automerge_saveIncremental(this.__wbg_ptr);
            return W(t);
        }
        saveSince(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_saveSince(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        saveNoCompress() {
            const t = b.automerge_saveNoCompress(this.__wbg_ptr);
            return W(t);
        }
        saveAndVerify() {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_saveAndVerify(s, this.__wbg_ptr);
                var t = O().getInt32(s + 4 * 0, !0), n = O().getInt32(s + 4 * 1, !0), r = O().getInt32(s + 4 * 2, !0);
                if (r) throw W(n);
                return W(t);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        loadIncremental(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_loadIncremental(o, this.__wbg_ptr, U(t));
                var n = O().getFloat64(o + 8 * 0, !0), r = O().getInt32(o + 4 * 2, !0), s = O().getInt32(o + 4 * 3, !0);
                if (s) throw W(r);
                return n;
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        applyChanges(t) {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_applyChanges(s, this.__wbg_ptr, U(t));
                var n = O().getInt32(s + 4 * 0, !0), r = O().getInt32(s + 4 * 1, !0);
                if (r) throw W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getChanges(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getChanges(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getChangeByHash(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getChangeByHash(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getDecodedChangeByHash(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getDecodedChangeByHash(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getChangesAdded(t) {
            ur(t, on);
            const n = b.automerge_getChangesAdded(this.__wbg_ptr, t.__wbg_ptr);
            return W(n);
        }
        getHeads() {
            const t = b.automerge_getHeads(this.__wbg_ptr);
            return W(t);
        }
        getActorId() {
            let t, n;
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getActorId(o, this.__wbg_ptr);
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                return t = r, n = s, Dt(r, s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16), b.__wbindgen_free(t, n, 1);
            }
        }
        getLastLocalChange() {
            const t = b.automerge_getLastLocalChange(this.__wbg_ptr);
            return W(t);
        }
        dump() {
            b.automerge_dump(this.__wbg_ptr);
        }
        getMissingDeps(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getMissingDeps(o, this.__wbg_ptr, he(t) ? 0 : U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        receiveSyncMessage(t, n) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                ur(t, zt), b.automerge_receiveSyncMessage(o, this.__wbg_ptr, t.__wbg_ptr, U(n));
                var r = O().getInt32(o + 4 * 0, !0), s = O().getInt32(o + 4 * 1, !0);
                if (s) throw W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        generateSyncMessage(t) {
            ur(t, zt);
            const n = b.automerge_generateSyncMessage(this.__wbg_ptr, t.__wbg_ptr);
            return W(n);
        }
        toJS(t) {
            try {
                const o = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_toJS(o, this.__wbg_ptr, U(t));
                var n = O().getInt32(o + 4 * 0, !0), r = O().getInt32(o + 4 * 1, !0), s = O().getInt32(o + 4 * 2, !0);
                if (s) throw W(r);
                return W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        materialize(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_materialize(a, this.__wbg_ptr, U(t), he(n) ? 0 : U(n), U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        getCursor(t, n, r, s) {
            let o, i;
            try {
                const d = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getCursor(d, this.__wbg_ptr, U(t), U(n), he(r) ? 0 : U(r), U(s));
                var a = O().getInt32(d + 4 * 0, !0), l = O().getInt32(d + 4 * 1, !0), f = O().getInt32(d + 4 * 2, !0), c = O().getInt32(d + 4 * 3, !0), u = a, h = l;
                if (c) throw u = 0, h = 0, W(f);
                return o = u, i = h, Dt(u, h);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16), b.__wbindgen_free(o, i, 1);
            }
        }
        getCursorPosition(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_getCursorPosition(a, this.__wbg_ptr, U(t), U(n), he(r) ? 0 : U(r));
                var s = O().getFloat64(a + 8 * 0, !0), o = O().getInt32(a + 4 * 2, !0), i = O().getInt32(a + 4 * 3, !0);
                if (i) throw W(o);
                return s;
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        emptyChange(t, n) {
            var r = he(t) ? 0 : un(t, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
            const o = b.automerge_emptyChange(this.__wbg_ptr, r, s, !he(n), he(n) ? 0 : n);
            return W(o);
        }
        mark(t, n, r, s, o) {
            try {
                const l = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_mark(l, this.__wbg_ptr, U(t), U(n), U(r), U(s), U(o));
                var i = O().getInt32(l + 4 * 0, !0), a = O().getInt32(l + 4 * 1, !0);
                if (a) throw W(i);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        unmark(t, n, r) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_unmark(i, this.__wbg_ptr, U(t), U(n), U(r));
                var s = O().getInt32(i + 4 * 0, !0), o = O().getInt32(i + 4 * 1, !0);
                if (o) throw W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        marks(t, n) {
            try {
                const i = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_marks(i, this.__wbg_ptr, U(t), he(n) ? 0 : U(n));
                var r = O().getInt32(i + 4 * 0, !0), s = O().getInt32(i + 4 * 1, !0), o = O().getInt32(i + 4 * 2, !0);
                if (o) throw W(s);
                return W(r);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        marksAt(t, n, r) {
            try {
                const a = b.__wbindgen_add_to_stack_pointer(-16);
                b.automerge_marksAt(a, this.__wbg_ptr, U(t), n, he(r) ? 0 : U(r));
                var s = O().getInt32(a + 4 * 0, !0), o = O().getInt32(a + 4 * 1, !0), i = O().getInt32(a + 4 * 2, !0);
                if (i) throw W(o);
                return W(s);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        hasOurChanges(t) {
            ur(t, zt);
            const n = b.automerge_hasOurChanges(this.__wbg_ptr, t.__wbg_ptr);
            return W(n);
        }
        topoHistoryTraversal() {
            const t = b.automerge_topoHistoryTraversal(this.__wbg_ptr);
            return W(t);
        }
        stats() {
            const t = b.automerge_stats(this.__wbg_ptr);
            return W(t);
        }
    }
    const Ah = typeof FinalizationRegistry > "u" ? {
        register: ()=>{},
        unregister: ()=>{}
    } : new FinalizationRegistry((e)=>b.__wbg_syncstate_free(e >>> 0, 1));
    class zt {
        static __wrap(t) {
            t = t >>> 0;
            const n = Object.create(zt.prototype);
            return n.__wbg_ptr = t, Ah.register(n, n.__wbg_ptr, n), n;
        }
        __destroy_into_raw() {
            const t = this.__wbg_ptr;
            return this.__wbg_ptr = 0, Ah.unregister(this), t;
        }
        free() {
            const t = this.__destroy_into_raw();
            b.__wbg_syncstate_free(t, 0);
        }
        get sharedHeads() {
            const t = b.syncstate_sharedHeads(this.__wbg_ptr);
            return W(t);
        }
        get lastSentHeads() {
            const t = b.syncstate_lastSentHeads(this.__wbg_ptr);
            return W(t);
        }
        set lastSentHeads(t) {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.syncstate_set_lastSentHeads(s, this.__wbg_ptr, U(t));
                var n = O().getInt32(s + 4 * 0, !0), r = O().getInt32(s + 4 * 1, !0);
                if (r) throw W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set sentHashes(t) {
            try {
                const s = b.__wbindgen_add_to_stack_pointer(-16);
                b.syncstate_set_sentHashes(s, this.__wbg_ptr, U(t));
                var n = O().getInt32(s + 4 * 0, !0), r = O().getInt32(s + 4 * 1, !0);
                if (r) throw W(n);
            } finally{
                b.__wbindgen_add_to_stack_pointer(16);
            }
        }
        clone() {
            const t = b.syncstate_clone(this.__wbg_ptr);
            return zt.__wrap(t);
        }
    }
    function Dy(e, t) {
        const n = String(Y(t)), r = un(n, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
        O().setInt32(e + 4 * 1, s, !0), O().setInt32(e + 4 * 0, r, !0);
    }
    function Ly() {
        return In(function(e, t, n) {
            const r = Reflect.apply(Y(e), Y(t), Y(n));
            return U(r);
        }, arguments);
    }
    function Uy(e, t) {
        const n = Object.assign(Y(e), Y(t));
        return U(n);
    }
    function Fy(e) {
        const t = Y(e).buffer;
        return U(t);
    }
    function zy() {
        return In(function(e, t) {
            const n = Y(e).call(Y(t));
            return U(n);
        }, arguments);
    }
    function Hy() {
        return In(function(e, t, n) {
            const r = Y(e).call(Y(t), Y(n));
            return U(r);
        }, arguments);
    }
    function Ny(e, t) {
        const n = Y(e).concat(Y(t));
        return U(n);
    }
    function By(e, t, n) {
        const r = Object.defineProperty(Y(e), Y(t), Y(n));
        return U(r);
    }
    function $y() {
        return In(function(e, t) {
            return Reflect.deleteProperty(Y(e), Y(t));
        }, arguments);
    }
    function Vy(e) {
        return Y(e).done;
    }
    function Wy(e) {
        const t = Object.entries(Y(e));
        return U(t);
    }
    function Ky(e, t) {
        let n, r;
        try {
            n = e, r = t, console.error(Dt(e, t));
        } finally{
            b.__wbindgen_free(n, r, 1);
        }
    }
    function Gy(e, t) {
        const n = Symbol.for(Dt(e, t));
        return U(n);
    }
    function Qy(e) {
        const t = Object.freeze(Y(e));
        return U(t);
    }
    function Jy(e) {
        const t = Array.from(Y(e));
        return U(t);
    }
    function Yy() {
        return In(function(e, t) {
            globalThis.crypto.getRandomValues(S3(e, t));
        }, arguments);
    }
    function Xy(e) {
        return Y(e).getTime();
    }
    function Zy() {
        return In(function(e, t) {
            const n = Reflect.get(Y(e), Y(t));
            return U(n);
        }, arguments);
    }
    function qy(e, t) {
        const n = Y(e)[t >>> 0];
        return U(n);
    }
    function em(e) {
        let t;
        try {
            t = Y(e) instanceof ArrayBuffer;
        } catch  {
            t = !1;
        }
        return t;
    }
    function tm(e) {
        let t;
        try {
            t = Y(e) instanceof Date;
        } catch  {
            t = !1;
        }
        return t;
    }
    function nm(e) {
        let t;
        try {
            t = Y(e) instanceof Object;
        } catch  {
            t = !1;
        }
        return t;
    }
    function rm(e) {
        let t;
        try {
            t = Y(e) instanceof Uint8Array;
        } catch  {
            t = !1;
        }
        return t;
    }
    function sm(e) {
        return Array.isArray(Y(e));
    }
    function om() {
        return U(Symbol.iterator);
    }
    function im(e) {
        const t = Object.keys(Y(e));
        return U(t);
    }
    function am(e) {
        return Y(e).length;
    }
    function lm(e) {
        return Y(e).length;
    }
    function um(e) {
        return Y(e).length;
    }
    function cm(e, t) {
        console.log(Y(e), Y(t));
    }
    function fm(e) {
        console.log(Y(e));
    }
    function dm(e, t) {
        const n = new RangeError(Dt(e, t));
        return U(n);
    }
    function hm(e) {
        const t = new Date(Y(e));
        return U(t);
    }
    function pm() {
        const e = new Object;
        return U(e);
    }
    function gm() {
        const e = new Array;
        return U(e);
    }
    function ym() {
        const e = new Error;
        return U(e);
    }
    function mm(e) {
        const t = new Uint8Array(Y(e));
        return U(t);
    }
    function _m(e, t) {
        const n = new Error(Dt(e, t));
        return U(n);
    }
    function wm(e, t, n) {
        const r = new Uint8Array(Y(e), t >>> 0, n >>> 0);
        return U(r);
    }
    function vm(e) {
        const t = Y(e).next;
        return U(t);
    }
    function bm() {
        return In(function(e) {
            const t = Y(e).next();
            return U(t);
        }, arguments);
    }
    function xm() {
        return In(function(e) {
            const t = Reflect.ownKeys(Y(e));
            return U(t);
        }, arguments);
    }
    function Sm(e, t) {
        return Y(e).push(Y(t));
    }
    function km(e, t, n) {
        Y(e)[t >>> 0] = W(n);
    }
    function Cm(e, t, n) {
        Y(e)[W(t)] = W(n);
    }
    function Em(e, t, n) {
        Y(e).set(Y(t), n >>> 0);
    }
    function Im() {
        return In(function(e, t, n) {
            return Reflect.set(Y(e), Y(t), Y(n));
        }, arguments);
    }
    function Am(e, t, n) {
        const r = Y(e).slice(t >>> 0, n >>> 0);
        return U(r);
    }
    function Om(e, t) {
        const n = Y(t).stack, r = un(n, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
        O().setInt32(e + 4 * 1, s, !0), O().setInt32(e + 4 * 0, r, !0);
    }
    function Tm(e) {
        const t = Y(e).toString();
        return U(t);
    }
    function jm(e, t) {
        return Y(e).unshift(Y(t));
    }
    function Mm(e) {
        const t = Y(e).value;
        return U(t);
    }
    function Rm(e) {
        const t = Object.values(Y(e));
        return U(t);
    }
    function Pm(e) {
        return U(e);
    }
    function Dm(e) {
        const t = BigInt.asUintN(64, e);
        return U(t);
    }
    function Lm(e) {
        const t = Y(e);
        return typeof t == "boolean" ? t ? 1 : 0 : 2;
    }
    function Um(e, t) {
        const n = nc(Y(t)), r = un(n, b.__wbindgen_malloc, b.__wbindgen_realloc), s = Pt;
        O().setInt32(e + 4 * 1, s, !0), O().setInt32(e + 4 * 0, r, !0);
    }
    function Fm(e, t) {
        const n = new Error(Dt(e, t));
        return U(n);
    }
    function zm(e) {
        return Array.isArray(Y(e));
    }
    function Hm(e) {
        return typeof Y(e) == "function";
    }
    function Nm(e) {
        return Y(e) === null;
    }
    function Bm(e) {
        const t = Y(e);
        return typeof t == "object" && t !== null;
    }
    function $m(e) {
        return typeof Y(e) == "string";
    }
    function Vm(e) {
        return Y(e) === void 0;
    }
    function Wm(e, t) {
        const n = Y(t), r = JSON.stringify(n === void 0 ? null : n), s = un(r, b.__wbindgen_malloc, b.__wbindgen_realloc), o = Pt;
        O().setInt32(e + 4 * 1, o, !0), O().setInt32(e + 4 * 0, s, !0);
    }
    function Km(e, t) {
        return Y(e) == Y(t);
    }
    function Gm() {
        const e = b.memory;
        return U(e);
    }
    function Qm(e, t) {
        const n = Y(t), r = typeof n == "number" ? n : void 0;
        O().setFloat64(e + 8 * 1, he(r) ? 0 : r, !0), O().setInt32(e + 4 * 0, !he(r), !0);
    }
    function Jm(e) {
        return U(e);
    }
    function Ym(e) {
        const t = Y(e);
        return U(t);
    }
    function Xm(e) {
        W(e);
    }
    function Zm(e, t) {
        const n = Y(t), r = typeof n == "string" ? n : void 0;
        var s = he(r) ? 0 : un(r, b.__wbindgen_malloc, b.__wbindgen_realloc), o = Pt;
        O().setInt32(e + 4 * 1, o, !0), O().setInt32(e + 4 * 0, s, !0);
    }
    function qm(e, t) {
        const n = Dt(e, t);
        return U(n);
    }
    function e_(e, t) {
        throw new Error(Dt(e, t));
    }
    URL = globalThis.URL;
    const G = await w3({
        "./automerge_wasm_bg.js": {
            __wbindgen_object_drop_ref: Xm,
            __wbindgen_string_get: Zm,
            __wbindgen_error_new: Fm,
            __wbindgen_string_new: qm,
            __wbindgen_number_new: Jm,
            __wbindgen_object_clone_ref: Ym,
            __wbindgen_number_get: Qm,
            __wbindgen_is_undefined: Vm,
            __wbindgen_boolean_get: Lm,
            __wbindgen_is_null: Nm,
            __wbindgen_is_string: $m,
            __wbindgen_is_function: Hm,
            __wbindgen_is_object: Bm,
            __wbindgen_is_array: zm,
            __wbindgen_json_serialize: Wm,
            __wbg_new_8a6f238a6ece86ea: ym,
            __wbg_stack_0ed75d68575b0f3c: Om,
            __wbg_error_7534b8e9a36f1ab4: Ky,
            __wbindgen_jsval_loose_eq: Km,
            __wbg_String_fed4d24b68977888: Dy,
            __wbindgen_bigint_from_i64: Pm,
            __wbindgen_bigint_from_u64: Dm,
            __wbg_set_3fda3bac07393de4: Cm,
            __wbg_getRandomValues_3d90134a348e46b3: Yy,
            __wbg_log_c222819a41e063d3: fm,
            __wbg_log_1ae1e9f741096e91: cm,
            __wbg_get_b9b93047fe3cf45b: qy,
            __wbg_length_e2d2a49132c1b256: um,
            __wbg_new_78feb108b6472713: gm,
            __wbg_next_25feadfc0913fea9: vm,
            __wbg_next_6574e1a8a62d1055: bm,
            __wbg_done_769e5ede4b31c67b: Vy,
            __wbg_value_cd1ffa7b1ab794f1: Mm,
            __wbg_iterator_9a24c88df860dc65: om,
            __wbg_get_67b2ba62fc30de12: Zy,
            __wbg_call_672a4d21634d4a24: zy,
            __wbg_new_405e22f390576ce2: pm,
            __wbg_length_d56737991078581b: lm,
            __wbg_set_37837023f3d740e8: km,
            __wbg_from_2a5d3e218e67aa85: Jy,
            __wbg_isArray_a1eab7e0d067391b: sm,
            __wbg_push_737cfc8c1432c2c6: Sm,
            __wbg_unshift_c290010f73f04fb1: jm,
            __wbg_instanceof_ArrayBuffer_e14585432e3737fc: em,
            __wbg_new_c68d7209be747379: _m,
            __wbg_call_7cccdd69e0791ae2: Hy,
            __wbg_instanceof_Date_e9a9be8b9cea7890: tm,
            __wbg_getTime_46267b1c24877e30: Xy,
            __wbg_new_31a97dac4f10fab7: hm,
            __wbg_instanceof_Object_7f2dcef8f78644a4: nm,
            __wbg_assign_3627b8559449930a: Uy,
            __wbg_defineProperty_a3ddad9901e2d29e: By,
            __wbg_entries_3265d4158b33e5dc: Wy,
            __wbg_freeze_ef6d70cf38e8d948: Qy,
            __wbg_keys_5c77a08ddc2fb8a6: im,
            __wbg_values_fcb8ba8c0aad8b58: Rm,
            __wbg_new_1ab78df5e132f715: dm,
            __wbg_apply_eb9e9b97497f91e4: Ly,
            __wbg_deleteProperty_96363d4a1d977c97: $y,
            __wbg_ownKeys_3930041068756f1f: xm,
            __wbg_set_bb8cecf6a62b9f46: Im,
            __wbg_buffer_609cc3eee51ed158: Fy,
            __wbg_concat_9de968491c4340cf: Ny,
            __wbg_slice_972c243648c9fd2e: Am,
            __wbg_for_4ff07bddd743c5e7: Gy,
            __wbg_toString_66ab719c2a98bdf1: Tm,
            __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: wm,
            __wbg_new_a12002a7f91c75be: mm,
            __wbg_set_65595bdd868b3009: Em,
            __wbg_length_a446193dc22c12f8: am,
            __wbg_instanceof_Uint8Array_17156bcf118086a9: rm,
            __wbindgen_debug_string: Um,
            __wbindgen_throw: e_,
            __wbindgen_memory: Gm
        }
    }, _3), U3 = G.memory, F3 = G.__wbg_syncstate_free, z3 = G.syncstate_sharedHeads, H3 = G.syncstate_lastSentHeads, N3 = G.syncstate_set_lastSentHeads, B3 = G.syncstate_set_sentHashes, $3 = G.syncstate_clone, V3 = G.__wbg_automerge_free, W3 = G.automerge_new, K3 = G.automerge_clone, G3 = G.automerge_fork, Q3 = G.automerge_pendingOps, J3 = G.automerge_commit, Y3 = G.automerge_merge, X3 = G.automerge_rollback, Z3 = G.automerge_keys, q3 = G.automerge_text, ex = G.automerge_spans, tx = G.automerge_splice, nx = G.automerge_updateText, rx = G.automerge_updateSpans, sx = G.automerge_push, ox = G.automerge_pushObject, ix = G.automerge_insert, ax = G.automerge_splitBlock, lx = G.automerge_joinBlock, ux = G.automerge_updateBlock, cx = G.automerge_getBlock, fx = G.automerge_insertObject, dx = G.automerge_put, hx = G.automerge_putObject, px = G.automerge_increment, gx = G.automerge_get, yx = G.automerge_getWithType, mx = G.automerge_objInfo, _x = G.automerge_getAll, wx = G.automerge_enableFreeze, vx = G.automerge_registerDatatype, bx = G.automerge_applyPatches, xx = G.automerge_applyAndReturnPatches, Sx = G.automerge_diffIncremental, kx = G.automerge_updateDiffCursor, Cx = G.automerge_resetDiffCursor, Ex = G.automerge_diff, Ix = G.automerge_isolate, Ax = G.automerge_integrate, Ox = G.automerge_length, Tx = G.automerge_delete, jx = G.automerge_save, Mx = G.automerge_saveIncremental, Rx = G.automerge_saveSince, Px = G.automerge_saveNoCompress, Dx = G.automerge_saveAndVerify, Lx = G.automerge_loadIncremental, Ux = G.automerge_applyChanges, Fx = G.automerge_getChanges, zx = G.automerge_getChangeByHash, Hx = G.automerge_getDecodedChangeByHash, Nx = G.automerge_getChangesAdded, Bx = G.automerge_getHeads, $x = G.automerge_getActorId, Vx = G.automerge_getLastLocalChange, Wx = G.automerge_dump, Kx = G.automerge_getMissingDeps, Gx = G.automerge_receiveSyncMessage, Qx = G.automerge_generateSyncMessage, Jx = G.automerge_toJS, Yx = G.automerge_materialize, Xx = G.automerge_getCursor, Zx = G.automerge_getCursorPosition, qx = G.automerge_emptyChange, eS = G.automerge_mark, tS = G.automerge_unmark, nS = G.automerge_marks, rS = G.automerge_marksAt, sS = G.automerge_hasOurChanges, oS = G.automerge_topoHistoryTraversal, iS = G.automerge_stats, aS = G.create, lS = G.load, uS = G.encodeChange, cS = G.decodeChange, fS = G.initSyncState, dS = G.importSyncState, hS = G.exportSyncState, pS = G.encodeSyncMessage, gS = G.decodeSyncMessage, yS = G.encodeSyncState, mS = G.decodeSyncState, _S = G.__wbindgen_malloc, wS = G.__wbindgen_realloc, vS = G.__wbindgen_exn_store, bS = G.__wbindgen_free, xS = G.__wbindgen_add_to_stack_pointer, SS = Object.freeze(Object.defineProperty({
        __proto__: null,
        __wbg_automerge_free: V3,
        __wbg_syncstate_free: F3,
        __wbindgen_add_to_stack_pointer: xS,
        __wbindgen_exn_store: vS,
        __wbindgen_free: bS,
        __wbindgen_malloc: _S,
        __wbindgen_realloc: wS,
        automerge_applyAndReturnPatches: xx,
        automerge_applyChanges: Ux,
        automerge_applyPatches: bx,
        automerge_clone: K3,
        automerge_commit: J3,
        automerge_delete: Tx,
        automerge_diff: Ex,
        automerge_diffIncremental: Sx,
        automerge_dump: Wx,
        automerge_emptyChange: qx,
        automerge_enableFreeze: wx,
        automerge_fork: G3,
        automerge_generateSyncMessage: Qx,
        automerge_get: gx,
        automerge_getActorId: $x,
        automerge_getAll: _x,
        automerge_getBlock: cx,
        automerge_getChangeByHash: zx,
        automerge_getChanges: Fx,
        automerge_getChangesAdded: Nx,
        automerge_getCursor: Xx,
        automerge_getCursorPosition: Zx,
        automerge_getDecodedChangeByHash: Hx,
        automerge_getHeads: Bx,
        automerge_getLastLocalChange: Vx,
        automerge_getMissingDeps: Kx,
        automerge_getWithType: yx,
        automerge_hasOurChanges: sS,
        automerge_increment: px,
        automerge_insert: ix,
        automerge_insertObject: fx,
        automerge_integrate: Ax,
        automerge_isolate: Ix,
        automerge_joinBlock: lx,
        automerge_keys: Z3,
        automerge_length: Ox,
        automerge_loadIncremental: Lx,
        automerge_mark: eS,
        automerge_marks: nS,
        automerge_marksAt: rS,
        automerge_materialize: Yx,
        automerge_merge: Y3,
        automerge_new: W3,
        automerge_objInfo: mx,
        automerge_pendingOps: Q3,
        automerge_push: sx,
        automerge_pushObject: ox,
        automerge_put: dx,
        automerge_putObject: hx,
        automerge_receiveSyncMessage: Gx,
        automerge_registerDatatype: vx,
        automerge_resetDiffCursor: Cx,
        automerge_rollback: X3,
        automerge_save: jx,
        automerge_saveAndVerify: Dx,
        automerge_saveIncremental: Mx,
        automerge_saveNoCompress: Px,
        automerge_saveSince: Rx,
        automerge_spans: ex,
        automerge_splice: tx,
        automerge_splitBlock: ax,
        automerge_stats: iS,
        automerge_text: q3,
        automerge_toJS: Jx,
        automerge_topoHistoryTraversal: oS,
        automerge_unmark: tS,
        automerge_updateBlock: ux,
        automerge_updateDiffCursor: kx,
        automerge_updateSpans: rx,
        automerge_updateText: nx,
        create: aS,
        decodeChange: cS,
        decodeSyncMessage: gS,
        decodeSyncState: mS,
        encodeChange: uS,
        encodeSyncMessage: pS,
        encodeSyncState: yS,
        exportSyncState: hS,
        importSyncState: dS,
        initSyncState: fS,
        load: lS,
        memory: U3,
        syncstate_clone: $3,
        syncstate_lastSentHeads: H3,
        syncstate_set_lastSentHeads: N3,
        syncstate_set_sentHashes: B3,
        syncstate_sharedHeads: z3
    }, Symbol.toStringTag, {
        value: "Module"
    }));
    Ry(SS);
    const kS = Object.freeze(Object.defineProperty({
        __proto__: null,
        Automerge: on,
        SyncState: zt,
        TextRepresentation: L3,
        __wbg_String_fed4d24b68977888: Dy,
        __wbg_apply_eb9e9b97497f91e4: Ly,
        __wbg_assign_3627b8559449930a: Uy,
        __wbg_buffer_609cc3eee51ed158: Fy,
        __wbg_call_672a4d21634d4a24: zy,
        __wbg_call_7cccdd69e0791ae2: Hy,
        __wbg_concat_9de968491c4340cf: Ny,
        __wbg_defineProperty_a3ddad9901e2d29e: By,
        __wbg_deleteProperty_96363d4a1d977c97: $y,
        __wbg_done_769e5ede4b31c67b: Vy,
        __wbg_entries_3265d4158b33e5dc: Wy,
        __wbg_error_7534b8e9a36f1ab4: Ky,
        __wbg_for_4ff07bddd743c5e7: Gy,
        __wbg_freeze_ef6d70cf38e8d948: Qy,
        __wbg_from_2a5d3e218e67aa85: Jy,
        __wbg_getRandomValues_3d90134a348e46b3: Yy,
        __wbg_getTime_46267b1c24877e30: Xy,
        __wbg_get_67b2ba62fc30de12: Zy,
        __wbg_get_b9b93047fe3cf45b: qy,
        __wbg_instanceof_ArrayBuffer_e14585432e3737fc: em,
        __wbg_instanceof_Date_e9a9be8b9cea7890: tm,
        __wbg_instanceof_Object_7f2dcef8f78644a4: nm,
        __wbg_instanceof_Uint8Array_17156bcf118086a9: rm,
        __wbg_isArray_a1eab7e0d067391b: sm,
        __wbg_iterator_9a24c88df860dc65: om,
        __wbg_keys_5c77a08ddc2fb8a6: im,
        __wbg_length_a446193dc22c12f8: am,
        __wbg_length_d56737991078581b: lm,
        __wbg_length_e2d2a49132c1b256: um,
        __wbg_log_1ae1e9f741096e91: cm,
        __wbg_log_c222819a41e063d3: fm,
        __wbg_new_1ab78df5e132f715: dm,
        __wbg_new_31a97dac4f10fab7: hm,
        __wbg_new_405e22f390576ce2: pm,
        __wbg_new_78feb108b6472713: gm,
        __wbg_new_8a6f238a6ece86ea: ym,
        __wbg_new_a12002a7f91c75be: mm,
        __wbg_new_c68d7209be747379: _m,
        __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: wm,
        __wbg_next_25feadfc0913fea9: vm,
        __wbg_next_6574e1a8a62d1055: bm,
        __wbg_ownKeys_3930041068756f1f: xm,
        __wbg_push_737cfc8c1432c2c6: Sm,
        __wbg_set_37837023f3d740e8: km,
        __wbg_set_3fda3bac07393de4: Cm,
        __wbg_set_65595bdd868b3009: Em,
        __wbg_set_bb8cecf6a62b9f46: Im,
        __wbg_set_wasm: Ry,
        __wbg_slice_972c243648c9fd2e: Am,
        __wbg_stack_0ed75d68575b0f3c: Om,
        __wbg_toString_66ab719c2a98bdf1: Tm,
        __wbg_unshift_c290010f73f04fb1: jm,
        __wbg_value_cd1ffa7b1ab794f1: Mm,
        __wbg_values_fcb8ba8c0aad8b58: Rm,
        __wbindgen_bigint_from_i64: Pm,
        __wbindgen_bigint_from_u64: Dm,
        __wbindgen_boolean_get: Lm,
        __wbindgen_debug_string: Um,
        __wbindgen_error_new: Fm,
        __wbindgen_is_array: zm,
        __wbindgen_is_function: Hm,
        __wbindgen_is_null: Nm,
        __wbindgen_is_object: Bm,
        __wbindgen_is_string: $m,
        __wbindgen_is_undefined: Vm,
        __wbindgen_json_serialize: Wm,
        __wbindgen_jsval_loose_eq: Km,
        __wbindgen_memory: Gm,
        __wbindgen_number_get: Qm,
        __wbindgen_number_new: Jm,
        __wbindgen_object_clone_ref: Ym,
        __wbindgen_object_drop_ref: Xm,
        __wbindgen_string_get: Zm,
        __wbindgen_string_new: qm,
        __wbindgen_throw: e_,
        create: C3,
        decodeChange: A3,
        decodeSyncMessage: R3,
        decodeSyncState: D3,
        encodeChange: I3,
        encodeSyncMessage: M3,
        encodeSyncState: P3,
        exportSyncState: j3,
        importSyncState: T3,
        initSyncState: O3,
        load: E3
    }, Symbol.toStringTag, {
        value: "Module"
    }));
    gv(kS);
    La();
    const t_ = Lt.createContext(null);
    function n_() {
        const e = Lt.useContext(t_);
        if (!e) throw new Error("Repo was not found on RepoContext.");
        return e;
    }
    function CS(e) {
        const t = n_(), n = e ? t.find(e) : null, r = Lt.useRef(n);
        n !== r.current && (r.current = n);
        const [, s] = Lt.useState(0), o = ()=>s((a)=>a + 1);
        Lt.useEffect(()=>!e || !n ? void 0 : (r.current = n, n.doc().then(()=>{
                o();
            }).catch((a)=>console.error(a)), n.on("change", o), n.on("delete", o), ()=>{
                n.removeListener("change", o), n.removeListener("delete", o);
            }), [
            e,
            n
        ]);
        const i = Lt.useCallback((a, l)=>{
            n && n.change(a, l);
        }, [
            n
        ]);
        return [
            n?.docSync(),
            i
        ];
    }
    const _r = Symbol.for("_am_meta"), ko = Symbol.for("_am_trace"), Co = Symbol.for("_am_objectId"), Pf = Symbol.for("_am_isProxy"), r_ = Symbol.for("_am_clearCache"), ES = Symbol.for("_am_uint"), IS = Symbol.for("_am_int"), AS = Symbol.for("_am_f64"), s_ = Symbol.for("_am_counter"), OS = Symbol.for("_am_text");
    class wr {
        constructor(t){
            if (typeof t == "string") this.elems = [
                ...t
            ];
            else if (Array.isArray(t)) this.elems = t;
            else if (t === void 0) this.elems = [];
            else throw new TypeError(`Unsupported initial value for Text: ${t}`);
            Reflect.defineProperty(this, OS, {
                value: !0
            });
        }
        get length() {
            return this.elems.length;
        }
        get(t) {
            return this.elems[t];
        }
        [Symbol.iterator]() {
            const t = this.elems;
            let n = -1;
            return {
                next () {
                    return n += 1, n < t.length ? {
                        done: !1,
                        value: t[n]
                    } : {
                        done: !0
                    };
                }
            };
        }
        toString() {
            if (!this.str) {
                this.str = "";
                for (const t of this.elems)typeof t == "string" ? this.str += t : this.str += "￼";
            }
            return this.str;
        }
        toSpans() {
            if (!this.spans) {
                this.spans = [];
                let t = "";
                for (const n of this.elems)typeof n == "string" ? t += n : (t.length > 0 && (this.spans.push(t), t = ""), this.spans.push(n));
                t.length > 0 && this.spans.push(t);
            }
            return this.spans;
        }
        toJSON() {
            return this.toString();
        }
        set(t, n) {
            if (this[_r]) throw new RangeError("object cannot be modified outside of a change block");
            this.elems[t] = n;
        }
        insertAt(t, ...n) {
            if (this[_r]) throw new RangeError("object cannot be modified outside of a change block");
            n.every((r)=>typeof r == "string") ? this.elems.splice(t, 0, ...n.join("")) : this.elems.splice(t, 0, ...n);
        }
        deleteAt(t, n = 1) {
            if (this[_r]) throw new RangeError("object cannot be modified outside of a change block");
            this.elems.splice(t, n);
        }
        map(t) {
            this.elems.map(t);
        }
        lastIndexOf(t, n) {
            this.elems.lastIndexOf(t, n);
        }
        concat(t) {
            return new wr(this.elems.concat(t.elems));
        }
        every(t) {
            return this.elems.every(t);
        }
        filter(t) {
            return new wr(this.elems.filter(t));
        }
        find(t) {
            return this.elems.find(t);
        }
        findIndex(t) {
            return this.elems.findIndex(t);
        }
        forEach(t) {
            this.elems.forEach(t);
        }
        includes(t) {
            return this.elems.includes(t);
        }
        indexOf(t) {
            return this.elems.indexOf(t);
        }
        join(t) {
            return this.elems.join(t);
        }
        reduce(t) {
            this.elems.reduce(t);
        }
        reduceRight(t) {
            this.elems.reduceRight(t);
        }
        slice(t, n) {
            return new wr(this.elems.slice(t, n));
        }
        some(t) {
            return this.elems.some(t);
        }
        toLocaleString() {
            this.toString();
        }
    }
    class TS {
        constructor(t){
            this.value = t || 0, Reflect.defineProperty(this, s_, {
                value: !0
            });
        }
        valueOf() {
            return this.value;
        }
        toString() {
            return this.valueOf().toString();
        }
        toJSON() {
            return this.value;
        }
        increment(t) {
            throw new Error("Counters should not be incremented outside of a change callback");
        }
        decrement(t) {
            throw new Error("Counters should not be decremented outside of a change callback");
        }
    }
    class jS extends TS {
        constructor(t, n, r, s, o){
            super(t), this.context = n, this.path = r, this.objectId = s, this.key = o;
        }
        increment(t) {
            return t = typeof t == "number" ? t : 1, this.context.increment(this.objectId, this.key, t), this.value += t, this.value;
        }
        decrement(t) {
            return this.increment(typeof t == "number" ? -t : -1);
        }
    }
    function MS(e, t, n, r, s) {
        return new jS(e, t, n, r, s);
    }
    class RS {
        constructor(t){
            this.val = t;
        }
        toString() {
            return this.val;
        }
        toJSON() {
            return this.val;
        }
    }
    function cn(e) {
        if (typeof e == "string" && /^[0-9]+$/.test(e) && (e = parseInt(e, 10)), typeof e != "number") return e;
        if (e < 0 || isNaN(e) || e === 1 / 0 || e === -1 / 0) throw new RangeError("A list index must be positive, but you passed " + e);
        return e;
    }
    function It(e, t) {
        const { context: n, objectId: r, path: s, textV2: o } = e, i = n.getWithType(r, t);
        if (i === null) return;
        const a = i[0], l = i[1];
        switch(a){
            case void 0:
                return;
            case "map":
                return Wa(n, l, o, [
                    ...s,
                    t
                ]);
            case "list":
                return Ka(n, l, o, [
                    ...s,
                    t
                ]);
            case "text":
                return o ? n.text(l) : Eo(n, l, [
                    ...s,
                    t
                ]);
            case "str":
                return l;
            case "uint":
                return l;
            case "int":
                return l;
            case "f64":
                return l;
            case "boolean":
                return l;
            case "null":
                return null;
            case "bytes":
                return l;
            case "timestamp":
                return l;
            case "counter":
                return MS(l, n, s, r, t);
            default:
                throw RangeError(`datatype ${a} unimplemented`);
        }
    }
    function ca(e, t, n, r) {
        const s = typeof e;
        switch(s){
            case "object":
                if (e == null) return [
                    null,
                    "null"
                ];
                if (e[ES]) return [
                    e.value,
                    "uint"
                ];
                if (e[IS]) return [
                    e.value,
                    "int"
                ];
                if (e[AS]) return [
                    e.value,
                    "f64"
                ];
                if (e[s_]) return [
                    e.value,
                    "counter"
                ];
                if (e instanceof Date) return [
                    e.getTime(),
                    "timestamp"
                ];
                if (e instanceof RS) return [
                    e.toString(),
                    "str"
                ];
                if (e instanceof wr) return [
                    e,
                    "text"
                ];
                if (e instanceof Uint8Array) return [
                    e,
                    "bytes"
                ];
                if (e instanceof Array) return [
                    e,
                    "list"
                ];
                if (Object.prototype.toString.call(e) === "[object Object]") return [
                    e,
                    "map"
                ];
                throw Va(e, r) ? new RangeError("Cannot create a reference to an existing document object") : new RangeError(`Cannot assign unknown object: ${e}`);
            case "boolean":
                return [
                    e,
                    "boolean"
                ];
            case "number":
                return Number.isInteger(e) ? [
                    e,
                    "int"
                ] : [
                    e,
                    "f64"
                ];
            case "string":
                return t ? [
                    e,
                    "text"
                ] : [
                    e,
                    "str"
                ];
            case "undefined":
                throw new RangeError([
                    `Cannot assign undefined value at ${Oh(n)}, `,
                    "because `undefined` is not a valid JSON data type. ",
                    "You might consider setting the property's value to `null`, ",
                    "or using `delete` to remove it altogether."
                ].join(""));
            default:
                throw new RangeError([
                    `Cannot assign ${s} value at ${Oh(n)}. `,
                    "All JSON primitive datatypes (object, array, string, number, boolean, null) ",
                    `are supported in an Automerge document; ${s} values are not. `
                ].join(""));
        }
    }
    function Va(e, t) {
        var n, r;
        return e instanceof Date ? !1 : !!(e && ((r = (n = e[_r]) === null || n === void 0 ? void 0 : n.handle) === null || r === void 0 ? void 0 : r.__wbg_ptr) === t.__wbg_ptr);
    }
    const PS = {
        get (e, t) {
            const { context: n, objectId: r, cache: s } = e;
            return t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === Co ? r : t === Pf ? !0 : t === ko ? e.trace : t === _r ? {
                handle: n,
                textV2: e.textV2
            } : (s[t] || (s[t] = It(e, t)), s[t]);
        },
        set (e, t, n) {
            const { context: r, objectId: s, path: o, textV2: i } = e;
            if (e.cache = {}, Va(n, r)) throw new RangeError("Cannot create a reference to an existing document object");
            if (t === ko) return e.trace = n, !0;
            if (t === r_) return !0;
            const [a, l] = ca(n, i, [
                ...o,
                t
            ], r);
            switch(l){
                case "list":
                    {
                        const f = r.putObject(s, t, []), c = Ka(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(let u = 0; u < a.length; u++)c[u] = a[u];
                        break;
                    }
                case "text":
                    {
                        if (i) fa(a), r.putObject(s, t, a);
                        else {
                            Lf(a);
                            const f = r.putObject(s, t, "");
                            Eo(r, f, [
                                ...o,
                                t
                            ]).splice(0, 0, ...a);
                        }
                        break;
                    }
                case "map":
                    {
                        const f = r.putObject(s, t, {}), c = Wa(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(const u in a)c[u] = a[u];
                        break;
                    }
                default:
                    r.put(s, t, a, l);
            }
            return !0;
        },
        deleteProperty (e, t) {
            const { context: n, objectId: r } = e;
            return e.cache = {}, n.delete(r, t), !0;
        },
        has (e, t) {
            return this.get(e, t) !== void 0;
        },
        getOwnPropertyDescriptor (e, t) {
            const n = this.get(e, t);
            if (typeof n < "u") return {
                configurable: !0,
                enumerable: !0,
                value: n
            };
        },
        ownKeys (e) {
            const { context: t, objectId: n } = e, r = t.keys(n);
            return [
                ...new Set(r)
            ];
        }
    }, o_ = {
        get (e, t) {
            const { context: n, objectId: r } = e;
            return t = cn(t), t === Symbol.hasInstance ? (s)=>Array.isArray(s) : t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === Co ? r : t === Pf ? !0 : t === ko ? e.trace : t === _r ? {
                handle: n
            } : t === "length" ? n.length(r) : typeof t == "number" ? It(e, t) : Df(e)[t];
        },
        set (e, t, n) {
            const { context: r, objectId: s, path: o, textV2: i } = e;
            if (t = cn(t), Va(n, r)) throw new RangeError("Cannot create a reference to an existing document object");
            if (t === r_) return !0;
            if (t === ko) return e.trace = n, !0;
            if (typeof t == "string") throw new RangeError("list index must be a number");
            const [a, l] = ca(n, i, [
                ...o,
                t
            ], r);
            switch(l){
                case "list":
                    {
                        let f;
                        t >= r.length(s) ? f = r.insertObject(s, t, []) : f = r.putObject(s, t, []), Ka(r, f, i, [
                            ...o,
                            t
                        ]).splice(0, 0, ...a);
                        break;
                    }
                case "text":
                    {
                        if (i) fa(a), t >= r.length(s) ? r.insertObject(s, t, a) : r.putObject(s, t, a);
                        else {
                            let f;
                            Lf(a), t >= r.length(s) ? f = r.insertObject(s, t, "") : f = r.putObject(s, t, ""), Eo(r, f, [
                                ...o,
                                t
                            ]).splice(0, 0, ...a);
                        }
                        break;
                    }
                case "map":
                    {
                        let f;
                        t >= r.length(s) ? f = r.insertObject(s, t, {}) : f = r.putObject(s, t, {});
                        const c = Wa(r, f, i, [
                            ...o,
                            t
                        ]);
                        for(const u in a)c[u] = a[u];
                        break;
                    }
                default:
                    t >= r.length(s) ? r.insert(s, t, a, l) : r.put(s, t, a, l);
            }
            return !0;
        },
        deleteProperty (e, t) {
            const { context: n, objectId: r } = e;
            t = cn(t);
            const s = n.get(r, t);
            if (s != null && s[0] == "counter") throw new TypeError("Unsupported operation: deleting a counter from a list");
            return n.delete(r, t), !0;
        },
        has (e, t) {
            const { context: n, objectId: r } = e;
            return t = cn(t), typeof t == "number" ? t < n.length(r) : t === "length";
        },
        getOwnPropertyDescriptor (e, t) {
            const { context: n, objectId: r } = e;
            return t === "length" ? {
                writable: !0,
                value: n.length(r)
            } : t === Co ? {
                configurable: !1,
                enumerable: !1,
                value: r
            } : (t = cn(t), {
                configurable: !0,
                enumerable: !0,
                value: It(e, t)
            });
        },
        getPrototypeOf (e) {
            return Object.getPrototypeOf(e);
        },
        ownKeys () {
            const e = [];
            return e.push("length"), e;
        }
    }, DS = Object.assign({}, o_, {
        get (e, t) {
            const { context: n, objectId: r } = e;
            return t = cn(t), t === Symbol.hasInstance ? (s)=>Array.isArray(s) : t === Symbol.toStringTag ? e[Symbol.toStringTag] : t === Co ? r : t === Pf ? !0 : t === ko ? e.trace : t === _r ? {
                handle: n
            } : t === "length" ? n.length(r) : typeof t == "number" ? It(e, t) : LS(e)[t] || Df(e)[t];
        },
        getPrototypeOf () {
            return Object.getPrototypeOf(new wr);
        }
    });
    function Wa(e, t, n, r) {
        const s = {
            context: e,
            objectId: t,
            path: r || [],
            cache: {},
            textV2: n
        }, o = {};
        return Object.assign(o, s), new Proxy(o, PS);
    }
    function Ka(e, t, n, r) {
        const s = {
            context: e,
            objectId: t,
            path: r || [],
            cache: {},
            textV2: n
        }, o = [];
        return Object.assign(o, s), new Proxy(o, o_);
    }
    function Eo(e, t, n) {
        const r = {
            context: e,
            objectId: t,
            path: n || [],
            cache: {},
            textV2: !1
        }, s = {};
        return Object.assign(s, r), new Proxy(s, DS);
    }
    function Df(e) {
        const { context: t, objectId: n, path: r, textV2: s } = e;
        return {
            deleteAt (o, i) {
                return typeof i == "number" ? t.splice(n, o, i) : t.delete(n, o), this;
            },
            fill (o, i, a) {
                const [l, f] = ca(o, s, [
                    ...r,
                    i
                ], t), c = t.length(n);
                i = cn(i || 0), a = cn(a || c);
                for(let u = i; u < Math.min(a, c); u++)if (f === "list" || f === "map") t.putObject(n, u, l);
                else if (f === "text") if (s) fa(l), t.putObject(n, u, l);
                else {
                    Lf(l);
                    const h = t.putObject(n, u, ""), d = Eo(t, h, [
                        ...r,
                        u
                    ]);
                    for(let p = 0; p < l.length; p++)d[p] = l.get(p);
                }
                else t.put(n, u, l, f);
                return this;
            },
            indexOf (o, i = 0) {
                const a = t.length(n);
                for(let l = i; l < a; l++){
                    const f = t.getWithType(n, l);
                    if (f && (f[1] === o[Co] || f[1] === o)) return l;
                }
                return -1;
            },
            insertAt (o, ...i) {
                return this.splice(o, 0, ...i), this;
            },
            pop () {
                const o = t.length(n);
                if (o == 0) return;
                const i = It(e, o - 1);
                return t.delete(n, o - 1), i;
            },
            push (...o) {
                const i = t.length(n);
                return this.splice(i, 0, ...o), t.length(n);
            },
            shift () {
                if (t.length(n) == 0) return;
                const o = It(e, 0);
                return t.delete(n, 0), o;
            },
            splice (o, i, ...a) {
                o = cn(o), typeof i != "number" && (i = t.length(n) - o), i = cn(i);
                for (const c of a)if (Va(c, t)) throw new RangeError("Cannot create a reference to an existing document object");
                const l = [];
                for(let c = 0; c < i; c++){
                    const u = It(e, o);
                    u !== void 0 && l.push(u), t.delete(n, o);
                }
                const f = a.map((c, u)=>{
                    try {
                        return ca(c, s, [
                            ...r
                        ], t);
                    } catch (h) {
                        throw h instanceof RangeError ? new RangeError(`${h.message} (at index ${u} in the input)`) : h;
                    }
                });
                for (const [c, u] of f){
                    switch(u){
                        case "list":
                            {
                                const h = t.insertObject(n, o, []);
                                Ka(t, h, s, [
                                    ...r,
                                    o
                                ]).splice(0, 0, ...c);
                                break;
                            }
                        case "text":
                            {
                                if (s) fa(c), t.insertObject(n, o, c);
                                else {
                                    const h = t.insertObject(n, o, "");
                                    Eo(t, h, [
                                        ...r,
                                        o
                                    ]).splice(0, 0, ...c);
                                }
                                break;
                            }
                        case "map":
                            {
                                const h = t.insertObject(n, o, {}), d = Wa(t, h, s, [
                                    ...r,
                                    o
                                ]);
                                for(const p in c)d[p] = c[p];
                                break;
                            }
                        default:
                            t.insert(n, o, c, u);
                    }
                    o += 1;
                }
                return l;
            },
            unshift (...o) {
                return this.splice(0, 0, ...o), t.length(n);
            },
            entries () {
                let o = 0;
                return {
                    next: ()=>{
                        const i = It(e, o);
                        return i === void 0 ? {
                            value: void 0,
                            done: !0
                        } : {
                            value: [
                                o++,
                                i
                            ],
                            done: !1
                        };
                    },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            keys () {
                let o = 0;
                const i = t.length(n);
                return {
                    next: ()=>o < i ? {
                            value: o++,
                            done: !1
                        } : {
                            value: void 0,
                            done: !0
                        },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            values () {
                let o = 0;
                return {
                    next: ()=>{
                        const i = It(e, o++);
                        return i === void 0 ? {
                            value: void 0,
                            done: !0
                        } : {
                            value: i,
                            done: !1
                        };
                    },
                    [Symbol.iterator] () {
                        return this;
                    }
                };
            },
            toArray () {
                const o = [];
                let i;
                do i = It(e, o.length), i !== void 0 && o.push(i);
                while (i !== void 0);
                return o;
            },
            map (o) {
                return this.toArray().map(o);
            },
            toString () {
                return this.toArray().toString();
            },
            toLocaleString () {
                return this.toArray().toLocaleString();
            },
            forEach (o) {
                return this.toArray().forEach(o);
            },
            concat (o) {
                return this.toArray().concat(o);
            },
            every (o) {
                return this.toArray().every(o);
            },
            filter (o) {
                return this.toArray().filter(o);
            },
            find (o) {
                let i = 0;
                for (const a of this){
                    if (o(a, i)) return a;
                    i += 1;
                }
            },
            findIndex (o) {
                let i = 0;
                for (const a of this){
                    if (o(a, i)) return i;
                    i += 1;
                }
                return -1;
            },
            includes (o) {
                return this.find((i)=>i === o) !== void 0;
            },
            join (o) {
                return this.toArray().join(o);
            },
            reduce (o, i) {
                return this.toArray().reduce(o, i);
            },
            reduceRight (o, i) {
                return this.toArray().reduceRight(o, i);
            },
            lastIndexOf (o, i = 1 / 0) {
                return this.toArray().lastIndexOf(o, i);
            },
            slice (o, i) {
                return this.toArray().slice(o, i);
            },
            some (o) {
                let i = 0;
                for (const a of this){
                    if (o(a, i)) return !0;
                    i += 1;
                }
                return !1;
            },
            [Symbol.iterator]: function*() {
                let o = 0, i = It(e, o);
                for(; i !== void 0;)yield i, o += 1, i = It(e, o);
            }
        };
    }
    function LS(e) {
        const { context: t, objectId: n } = e;
        return {
            set (r, s) {
                return this[r] = s;
            },
            get (r) {
                return this[r];
            },
            toString () {
                return t.text(n).replace(/￼/g, "");
            },
            toSpans () {
                const r = [];
                let s = "";
                const o = t.length(n);
                for(let i = 0; i < o; i++){
                    const a = this[i];
                    typeof a == "string" ? s += a : (s.length > 0 && (r.push(s), s = ""), r.push(a));
                }
                return s.length > 0 && r.push(s), r;
            },
            toJSON () {
                return this.toString();
            },
            indexOf (r, s = 0) {
                return t.text(n).indexOf(r, s);
            },
            insertAt (r, ...s) {
                s.every((o)=>typeof o == "string") ? t.splice(n, r, 0, s.join("")) : Df(e).insertAt(r, ...s);
            }
        };
    }
    function Lf(e) {
        if (!(e instanceof wr)) throw new Error("value was not a Text instance");
    }
    function fa(e) {
        if (typeof e != "string") throw new Error("value was not a string");
    }
    function Oh(e) {
        const t = e.map((n)=>{
            if (typeof n == "number") return n.toString();
            if (typeof n == "string") return n.replace(/~/g, "~0").replace(/\//g, "~1");
        });
        return e.length === 0 ? "" : "/" + t.join("/");
    }
    const US = [];
    for(let e = 0; e < 256; ++e)US.push((e + 256).toString(16).slice(1));
    let i_;
    const a_ = new Array(128).fill(void 0);
    a_.push(void 0, null, !0, !1);
    a_.length;
    const FS = typeof TextEncoder < "u" ? new TextEncoder("utf-8") : {
        encode: ()=>{
            throw Error("TextEncoder not available");
        }
    };
    FS.encodeInto;
    const zS = typeof TextDecoder < "u" ? new TextDecoder("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    }) : {
        decode: ()=>{
            throw Error("TextDecoder not available");
        }
    };
    typeof TextDecoder < "u" && zS.decode();
    typeof FinalizationRegistry > "u" || new FinalizationRegistry((e)=>i_.__wbg_automerge_free(e >>> 0));
    typeof FinalizationRegistry > "u" || new FinalizationRegistry((e)=>i_.__wbg_syncstate_free(e >>> 0));
    var HS = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
    function l_(e) {
        return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
    }
    var rc = {
        exports: {}
    }, Pl, Th;
    function NS() {
        if (Th) return Pl;
        Th = 1;
        var e = 1e3, t = e * 60, n = t * 60, r = n * 24, s = r * 7, o = r * 365.25;
        Pl = function(c, u) {
            u = u || {};
            var h = typeof c;
            if (h === "string" && c.length > 0) return i(c);
            if (h === "number" && isFinite(c)) return u.long ? l(c) : a(c);
            throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(c));
        };
        function i(c) {
            if (c = String(c), !(c.length > 100)) {
                var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(c);
                if (u) {
                    var h = parseFloat(u[1]), d = (u[2] || "ms").toLowerCase();
                    switch(d){
                        case "years":
                        case "year":
                        case "yrs":
                        case "yr":
                        case "y":
                            return h * o;
                        case "weeks":
                        case "week":
                        case "w":
                            return h * s;
                        case "days":
                        case "day":
                        case "d":
                            return h * r;
                        case "hours":
                        case "hour":
                        case "hrs":
                        case "hr":
                        case "h":
                            return h * n;
                        case "minutes":
                        case "minute":
                        case "mins":
                        case "min":
                        case "m":
                            return h * t;
                        case "seconds":
                        case "second":
                        case "secs":
                        case "sec":
                        case "s":
                            return h * e;
                        case "milliseconds":
                        case "millisecond":
                        case "msecs":
                        case "msec":
                        case "ms":
                            return h;
                        default:
                            return;
                    }
                }
            }
        }
        function a(c) {
            var u = Math.abs(c);
            return u >= r ? Math.round(c / r) + "d" : u >= n ? Math.round(c / n) + "h" : u >= t ? Math.round(c / t) + "m" : u >= e ? Math.round(c / e) + "s" : c + "ms";
        }
        function l(c) {
            var u = Math.abs(c);
            return u >= r ? f(c, u, r, "day") : u >= n ? f(c, u, n, "hour") : u >= t ? f(c, u, t, "minute") : u >= e ? f(c, u, e, "second") : c + " ms";
        }
        function f(c, u, h, d) {
            var p = u >= h * 1.5;
            return Math.round(c / h) + " " + d + (p ? "s" : "");
        }
        return Pl;
    }
    function BS(e) {
        n.debug = n, n.default = n, n.coerce = l, n.disable = o, n.enable = s, n.enabled = i, n.humanize = NS(), n.destroy = f, Object.keys(e).forEach((c)=>{
            n[c] = e[c];
        }), n.names = [], n.skips = [], n.formatters = {};
        function t(c) {
            let u = 0;
            for(let h = 0; h < c.length; h++)u = (u << 5) - u + c.charCodeAt(h), u |= 0;
            return n.colors[Math.abs(u) % n.colors.length];
        }
        n.selectColor = t;
        function n(c) {
            let u, h = null, d, p;
            function m(...x) {
                if (!m.enabled) return;
                const w = m, _ = Number(new Date), g = _ - (u || _);
                w.diff = g, w.prev = u, w.curr = _, u = _, x[0] = n.coerce(x[0]), typeof x[0] != "string" && x.unshift("%O");
                let A = 0;
                x[0] = x[0].replace(/%([a-zA-Z%])/g, (P, j)=>{
                    if (P === "%%") return "%";
                    A++;
                    const N = n.formatters[j];
                    if (typeof N == "function") {
                        const F = x[A];
                        P = N.call(w, F), x.splice(A, 1), A--;
                    }
                    return P;
                }), n.formatArgs.call(w, x), (w.log || n.log).apply(w, x);
            }
            return m.namespace = c, m.useColors = n.useColors(), m.color = n.selectColor(c), m.extend = r, m.destroy = n.destroy, Object.defineProperty(m, "enabled", {
                enumerable: !0,
                configurable: !1,
                get: ()=>h !== null ? h : (d !== n.namespaces && (d = n.namespaces, p = n.enabled(c)), p),
                set: (x)=>{
                    h = x;
                }
            }), typeof n.init == "function" && n.init(m), m;
        }
        function r(c, u) {
            const h = n(this.namespace + (typeof u > "u" ? ":" : u) + c);
            return h.log = this.log, h;
        }
        function s(c) {
            n.save(c), n.namespaces = c, n.names = [], n.skips = [];
            let u;
            const h = (typeof c == "string" ? c : "").split(/[\s,]+/), d = h.length;
            for(u = 0; u < d; u++)h[u] && (c = h[u].replace(/\*/g, ".*?"), c[0] === "-" ? n.skips.push(new RegExp("^" + c.slice(1) + "$")) : n.names.push(new RegExp("^" + c + "$")));
        }
        function o() {
            const c = [
                ...n.names.map(a),
                ...n.skips.map(a).map((u)=>"-" + u)
            ].join(",");
            return n.enable(""), c;
        }
        function i(c) {
            if (c[c.length - 1] === "*") return !0;
            let u, h;
            for(u = 0, h = n.skips.length; u < h; u++)if (n.skips[u].test(c)) return !1;
            for(u = 0, h = n.names.length; u < h; u++)if (n.names[u].test(c)) return !0;
            return !1;
        }
        function a(c) {
            return c.toString().substring(2, c.toString().length - 2).replace(/\.\*\?$/, "*");
        }
        function l(c) {
            return c instanceof Error ? c.stack || c.message : c;
        }
        function f() {
            console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
        return n.enable(n.load()), n;
    }
    var $S = BS;
    (function(e, t) {
        t.formatArgs = r, t.save = s, t.load = o, t.useColors = n, t.storage = i(), t.destroy = (()=>{
            let l = !1;
            return ()=>{
                l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
            };
        })(), t.colors = [
            "#0000CC",
            "#0000FF",
            "#0033CC",
            "#0033FF",
            "#0066CC",
            "#0066FF",
            "#0099CC",
            "#0099FF",
            "#00CC00",
            "#00CC33",
            "#00CC66",
            "#00CC99",
            "#00CCCC",
            "#00CCFF",
            "#3300CC",
            "#3300FF",
            "#3333CC",
            "#3333FF",
            "#3366CC",
            "#3366FF",
            "#3399CC",
            "#3399FF",
            "#33CC00",
            "#33CC33",
            "#33CC66",
            "#33CC99",
            "#33CCCC",
            "#33CCFF",
            "#6600CC",
            "#6600FF",
            "#6633CC",
            "#6633FF",
            "#66CC00",
            "#66CC33",
            "#9900CC",
            "#9900FF",
            "#9933CC",
            "#9933FF",
            "#99CC00",
            "#99CC33",
            "#CC0000",
            "#CC0033",
            "#CC0066",
            "#CC0099",
            "#CC00CC",
            "#CC00FF",
            "#CC3300",
            "#CC3333",
            "#CC3366",
            "#CC3399",
            "#CC33CC",
            "#CC33FF",
            "#CC6600",
            "#CC6633",
            "#CC9900",
            "#CC9933",
            "#CCCC00",
            "#CCCC33",
            "#FF0000",
            "#FF0033",
            "#FF0066",
            "#FF0099",
            "#FF00CC",
            "#FF00FF",
            "#FF3300",
            "#FF3333",
            "#FF3366",
            "#FF3399",
            "#FF33CC",
            "#FF33FF",
            "#FF6600",
            "#FF6633",
            "#FF9900",
            "#FF9933",
            "#FFCC00",
            "#FFCC33"
        ];
        function n() {
            return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
        }
        function r(l) {
            if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors) return;
            const f = "color: " + this.color;
            l.splice(1, 0, f, "color: inherit");
            let c = 0, u = 0;
            l[0].replace(/%[a-zA-Z%]/g, (h)=>{
                h !== "%%" && (c++, h === "%c" && (u = c));
            }), l.splice(u, 0, f);
        }
        t.log = console.debug || console.log || (()=>{});
        function s(l) {
            try {
                l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
            } catch  {}
        }
        function o() {
            let l;
            try {
                l = t.storage.getItem("debug");
            } catch  {}
            return !l && typeof process < "u" && "env" in process && (l = {}.DEBUG), l;
        }
        function i() {
            try {
                return localStorage;
            } catch  {}
        }
        e.exports = $S(t);
        const { formatters: a } = e.exports;
        a.j = function(l) {
            try {
                return JSON.stringify(l);
            } catch (f) {
                return "[UnexpectedJSONParseError]: " + f.message;
            }
        };
    })(rc, rc.exports);
    var VS = rc.exports;
    const WS = l_(VS);
    var u_ = {
        exports: {}
    };
    (function(e) {
        var t = Object.prototype.hasOwnProperty, n = "~";
        function r() {}
        Object.create && (r.prototype = Object.create(null), new r().__proto__ || (n = !1));
        function s(l, f, c) {
            this.fn = l, this.context = f, this.once = c || !1;
        }
        function o(l, f, c, u, h) {
            if (typeof c != "function") throw new TypeError("The listener must be a function");
            var d = new s(c, u || l, h), p = n ? n + f : f;
            return l._events[p] ? l._events[p].fn ? l._events[p] = [
                l._events[p],
                d
            ] : l._events[p].push(d) : (l._events[p] = d, l._eventsCount++), l;
        }
        function i(l, f) {
            --l._eventsCount === 0 ? l._events = new r : delete l._events[f];
        }
        function a() {
            this._events = new r, this._eventsCount = 0;
        }
        a.prototype.eventNames = function() {
            var l = [], f, c;
            if (this._eventsCount === 0) return l;
            for(c in f = this._events)t.call(f, c) && l.push(n ? c.slice(1) : c);
            return Object.getOwnPropertySymbols ? l.concat(Object.getOwnPropertySymbols(f)) : l;
        }, a.prototype.listeners = function(l) {
            var f = n ? n + l : l, c = this._events[f];
            if (!c) return [];
            if (c.fn) return [
                c.fn
            ];
            for(var u = 0, h = c.length, d = new Array(h); u < h; u++)d[u] = c[u].fn;
            return d;
        }, a.prototype.listenerCount = function(l) {
            var f = n ? n + l : l, c = this._events[f];
            return c ? c.fn ? 1 : c.length : 0;
        }, a.prototype.emit = function(l, f, c, u, h, d) {
            var p = n ? n + l : l;
            if (!this._events[p]) return !1;
            var m = this._events[p], x = arguments.length, w, _;
            if (m.fn) {
                switch(m.once && this.removeListener(l, m.fn, void 0, !0), x){
                    case 1:
                        return m.fn.call(m.context), !0;
                    case 2:
                        return m.fn.call(m.context, f), !0;
                    case 3:
                        return m.fn.call(m.context, f, c), !0;
                    case 4:
                        return m.fn.call(m.context, f, c, u), !0;
                    case 5:
                        return m.fn.call(m.context, f, c, u, h), !0;
                    case 6:
                        return m.fn.call(m.context, f, c, u, h, d), !0;
                }
                for(_ = 1, w = new Array(x - 1); _ < x; _++)w[_ - 1] = arguments[_];
                m.fn.apply(m.context, w);
            } else {
                var g = m.length, A;
                for(_ = 0; _ < g; _++)switch(m[_].once && this.removeListener(l, m[_].fn, void 0, !0), x){
                    case 1:
                        m[_].fn.call(m[_].context);
                        break;
                    case 2:
                        m[_].fn.call(m[_].context, f);
                        break;
                    case 3:
                        m[_].fn.call(m[_].context, f, c);
                        break;
                    case 4:
                        m[_].fn.call(m[_].context, f, c, u);
                        break;
                    default:
                        if (!w) for(A = 1, w = new Array(x - 1); A < x; A++)w[A - 1] = arguments[A];
                        m[_].fn.apply(m[_].context, w);
                }
            }
            return !0;
        }, a.prototype.on = function(l, f, c) {
            return o(this, l, f, c, !1);
        }, a.prototype.once = function(l, f, c) {
            return o(this, l, f, c, !0);
        }, a.prototype.removeListener = function(l, f, c, u) {
            var h = n ? n + l : l;
            if (!this._events[h]) return this;
            if (!f) return i(this, h), this;
            var d = this._events[h];
            if (d.fn) d.fn === f && (!u || d.once) && (!c || d.context === c) && i(this, h);
            else {
                for(var p = 0, m = [], x = d.length; p < x; p++)(d[p].fn !== f || u && !d[p].once || c && d[p].context !== c) && m.push(d[p]);
                m.length ? this._events[h] = m.length === 1 ? m[0] : m : i(this, h);
            }
            return this;
        }, a.prototype.removeAllListeners = function(l) {
            var f;
            return l ? (f = n ? n + l : l, this._events[f] && i(this, f)) : (this._events = new r, this._eventsCount = 0), this;
        }, a.prototype.off = a.prototype.removeListener, a.prototype.addListener = a.prototype.on, a.prefixed = n, a.EventEmitter = a, e.exports = a;
    })(u_);
    var KS = u_.exports;
    const GS = l_(KS);
    var Io = {}, Xn = {}, Be = {};
    Object.defineProperty(Be, "__esModule", {
        value: !0
    });
    Be.output = Be.exists = Be.hash = Be.bytes = Be.bool = Be.number = Be.isBytes = void 0;
    function da(e) {
        if (!Number.isSafeInteger(e) || e < 0) throw new Error(`positive integer expected, not ${e}`);
    }
    Be.number = da;
    function c_(e) {
        if (typeof e != "boolean") throw new Error(`boolean expected, not ${e}`);
    }
    Be.bool = c_;
    function f_(e) {
        return e instanceof Uint8Array || e != null && typeof e == "object" && e.constructor.name === "Uint8Array";
    }
    Be.isBytes = f_;
    function Uf(e, ...t) {
        if (!f_(e)) throw new Error("Uint8Array expected");
        if (t.length > 0 && !t.includes(e.length)) throw new Error(`Uint8Array expected of length ${t}, not of length=${e.length}`);
    }
    Be.bytes = Uf;
    function d_(e) {
        if (typeof e != "function" || typeof e.create != "function") throw new Error("Hash should be wrapped by utils.wrapConstructor");
        da(e.outputLen), da(e.blockLen);
    }
    Be.hash = d_;
    function h_(e, t = !0) {
        if (e.destroyed) throw new Error("Hash instance has been destroyed");
        if (t && e.finished) throw new Error("Hash#digest() has already been called");
    }
    Be.exists = h_;
    function p_(e, t) {
        Uf(e);
        const n = t.outputLen;
        if (e.length < n) throw new Error(`digestInto() expects output buffer of length at least ${n}`);
    }
    Be.output = p_;
    const QS = {
        number: da,
        bool: c_,
        bytes: Uf,
        hash: d_,
        exists: h_,
        output: p_
    };
    Be.default = QS;
    var Ff = {}, Ga = {};
    Object.defineProperty(Ga, "__esModule", {
        value: !0
    });
    Ga.crypto = void 0;
    Ga.crypto = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    (function(e) {
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.randomBytes = e.wrapXOFConstructorWithOpts = e.wrapConstructorWithOpts = e.wrapConstructor = e.checkOpts = e.Hash = e.concatBytes = e.toBytes = e.utf8ToBytes = e.asyncLoop = e.nextTick = e.hexToBytes = e.bytesToHex = e.byteSwap32 = e.byteSwapIfBE = e.byteSwap = e.isLE = e.rotl = e.rotr = e.createView = e.u32 = e.u8 = e.isBytes = void 0;
        const t = Ga, n = Be;
        function r(H) {
            return H instanceof Uint8Array || H != null && typeof H == "object" && H.constructor.name === "Uint8Array";
        }
        e.isBytes = r;
        const s = (H)=>new Uint8Array(H.buffer, H.byteOffset, H.byteLength);
        e.u8 = s;
        const o = (H)=>new Uint32Array(H.buffer, H.byteOffset, Math.floor(H.byteLength / 4));
        e.u32 = o;
        const i = (H)=>new DataView(H.buffer, H.byteOffset, H.byteLength);
        e.createView = i;
        const a = (H, y)=>H << 32 - y | H >>> y;
        e.rotr = a;
        const l = (H, y)=>H << y | H >>> 32 - y >>> 0;
        e.rotl = l, e.isLE = new Uint8Array(new Uint32Array([
            287454020
        ]).buffer)[0] === 68;
        const f = (H)=>H << 24 & 4278190080 | H << 8 & 16711680 | H >>> 8 & 65280 | H >>> 24 & 255;
        e.byteSwap = f, e.byteSwapIfBE = e.isLE ? (H)=>H : (H)=>(0, e.byteSwap)(H);
        function c(H) {
            for(let y = 0; y < H.length; y++)H[y] = (0, e.byteSwap)(H[y]);
        }
        e.byteSwap32 = c;
        const u = Array.from({
            length: 256
        }, (H, y)=>y.toString(16).padStart(2, "0"));
        function h(H) {
            (0, n.bytes)(H);
            let y = "";
            for(let L = 0; L < H.length; L++)y += u[H[L]];
            return y;
        }
        e.bytesToHex = h;
        const d = {
            _0: 48,
            _9: 57,
            _A: 65,
            _F: 70,
            _a: 97,
            _f: 102
        };
        function p(H) {
            if (H >= d._0 && H <= d._9) return H - d._0;
            if (H >= d._A && H <= d._F) return H - (d._A - 10);
            if (H >= d._a && H <= d._f) return H - (d._a - 10);
        }
        function m(H) {
            if (typeof H != "string") throw new Error("hex string expected, got " + typeof H);
            const y = H.length, L = y / 2;
            if (y % 2) throw new Error("padded hex string expected, got unpadded hex of length " + y);
            const S = new Uint8Array(L);
            for(let I = 0, k = 0; I < L; I++, k += 2){
                const M = p(H.charCodeAt(k)), v = p(H.charCodeAt(k + 1));
                if (M === void 0 || v === void 0) {
                    const T = H[k] + H[k + 1];
                    throw new Error('hex string expected, got non-hex character "' + T + '" at index ' + k);
                }
                S[I] = M * 16 + v;
            }
            return S;
        }
        e.hexToBytes = m;
        const x = async ()=>{};
        e.nextTick = x;
        async function w(H, y, L) {
            let S = Date.now();
            for(let I = 0; I < H; I++){
                L(I);
                const k = Date.now() - S;
                k >= 0 && k < y || (await (0, e.nextTick)(), S += k);
            }
        }
        e.asyncLoop = w;
        function _(H) {
            if (typeof H != "string") throw new Error(`utf8ToBytes expected string, got ${typeof H}`);
            return new Uint8Array(new TextEncoder().encode(H));
        }
        e.utf8ToBytes = _;
        function g(H) {
            return typeof H == "string" && (H = _(H)), (0, n.bytes)(H), H;
        }
        e.toBytes = g;
        function A(...H) {
            let y = 0;
            for(let S = 0; S < H.length; S++){
                const I = H[S];
                (0, n.bytes)(I), y += I.length;
            }
            const L = new Uint8Array(y);
            for(let S = 0, I = 0; S < H.length; S++){
                const k = H[S];
                L.set(k, I), I += k.length;
            }
            return L;
        }
        e.concatBytes = A;
        class P {
            clone() {
                return this._cloneInto();
            }
        }
        e.Hash = P;
        const j = {}.toString;
        function N(H, y) {
            if (y !== void 0 && j.call(y) !== "[object Object]") throw new Error("Options should be object or undefined");
            return Object.assign(H, y);
        }
        e.checkOpts = N;
        function F(H) {
            const y = (S)=>H().update(g(S)).digest(), L = H();
            return y.outputLen = L.outputLen, y.blockLen = L.blockLen, y.create = ()=>H(), y;
        }
        e.wrapConstructor = F;
        function J(H) {
            const y = (S, I)=>H(I).update(g(S)).digest(), L = H({});
            return y.outputLen = L.outputLen, y.blockLen = L.blockLen, y.create = (S)=>H(S), y;
        }
        e.wrapConstructorWithOpts = J;
        function K(H) {
            const y = (S, I)=>H(I).update(g(S)).digest(), L = H({});
            return y.outputLen = L.outputLen, y.blockLen = L.blockLen, y.create = (S)=>H(S), y;
        }
        e.wrapXOFConstructorWithOpts = K;
        function se(H = 32) {
            if (t.crypto && typeof t.crypto.getRandomValues == "function") return t.crypto.getRandomValues(new Uint8Array(H));
            throw new Error("crypto.getRandomValues must be defined");
        }
        e.randomBytes = se;
    })(Ff);
    Object.defineProperty(Xn, "__esModule", {
        value: !0
    });
    Xn.HashMD = Xn.Maj = Xn.Chi = void 0;
    const Dl = Be, Ds = Ff;
    function JS(e, t, n, r) {
        if (typeof e.setBigUint64 == "function") return e.setBigUint64(t, n, r);
        const s = BigInt(32), o = BigInt(4294967295), i = Number(n >> s & o), a = Number(n & o), l = r ? 4 : 0, f = r ? 0 : 4;
        e.setUint32(t + l, i, r), e.setUint32(t + f, a, r);
    }
    const YS = (e, t, n)=>e & t ^ ~e & n;
    Xn.Chi = YS;
    const XS = (e, t, n)=>e & t ^ e & n ^ t & n;
    Xn.Maj = XS;
    class ZS extends Ds.Hash {
        constructor(t, n, r, s){
            super(), this.blockLen = t, this.outputLen = n, this.padOffset = r, this.isLE = s, this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.buffer = new Uint8Array(t), this.view = (0, Ds.createView)(this.buffer);
        }
        update(t) {
            (0, Dl.exists)(this);
            const { view: n, buffer: r, blockLen: s } = this;
            t = (0, Ds.toBytes)(t);
            const o = t.length;
            for(let i = 0; i < o;){
                const a = Math.min(s - this.pos, o - i);
                if (a === s) {
                    const l = (0, Ds.createView)(t);
                    for(; s <= o - i; i += s)this.process(l, i);
                    continue;
                }
                r.set(t.subarray(i, i + a), this.pos), this.pos += a, i += a, this.pos === s && (this.process(n, 0), this.pos = 0);
            }
            return this.length += t.length, this.roundClean(), this;
        }
        digestInto(t) {
            (0, Dl.exists)(this), (0, Dl.output)(t, this), this.finished = !0;
            const { buffer: n, view: r, blockLen: s, isLE: o } = this;
            let { pos: i } = this;
            n[i++] = 128, this.buffer.subarray(i).fill(0), this.padOffset > s - i && (this.process(r, 0), i = 0);
            for(let u = i; u < s; u++)n[u] = 0;
            JS(r, s - 8, BigInt(this.length * 8), o), this.process(r, 0);
            const a = (0, Ds.createView)(t), l = this.outputLen;
            if (l % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
            const f = l / 4, c = this.get();
            if (f > c.length) throw new Error("_sha2: outputLen bigger than state");
            for(let u = 0; u < f; u++)a.setUint32(4 * u, c[u], o);
        }
        digest() {
            const { buffer: t, outputLen: n } = this;
            this.digestInto(t);
            const r = t.slice(0, n);
            return this.destroy(), r;
        }
        _cloneInto(t) {
            t || (t = new this.constructor), t.set(...this.get());
            const { blockLen: n, buffer: r, length: s, finished: o, destroyed: i, pos: a } = this;
            return t.length = s, t.pos = a, t.finished = o, t.destroyed = i, s % n && t.buffer.set(r), t;
        }
    }
    Xn.HashMD = ZS;
    Object.defineProperty(Io, "__esModule", {
        value: !0
    });
    Io.sha224 = Io.sha256 = void 0;
    const Ll = Xn, Et = Ff, qS = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
    ]), Rn = new Uint32Array([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
    ]), Pn = new Uint32Array(64);
    class g_ extends Ll.HashMD {
        constructor(){
            super(64, 32, 8, !1), this.A = Rn[0] | 0, this.B = Rn[1] | 0, this.C = Rn[2] | 0, this.D = Rn[3] | 0, this.E = Rn[4] | 0, this.F = Rn[5] | 0, this.G = Rn[6] | 0, this.H = Rn[7] | 0;
        }
        get() {
            const { A: t, B: n, C: r, D: s, E: o, F: i, G: a, H: l } = this;
            return [
                t,
                n,
                r,
                s,
                o,
                i,
                a,
                l
            ];
        }
        set(t, n, r, s, o, i, a, l) {
            this.A = t | 0, this.B = n | 0, this.C = r | 0, this.D = s | 0, this.E = o | 0, this.F = i | 0, this.G = a | 0, this.H = l | 0;
        }
        process(t, n) {
            for(let u = 0; u < 16; u++, n += 4)Pn[u] = t.getUint32(n, !1);
            for(let u = 16; u < 64; u++){
                const h = Pn[u - 15], d = Pn[u - 2], p = (0, Et.rotr)(h, 7) ^ (0, Et.rotr)(h, 18) ^ h >>> 3, m = (0, Et.rotr)(d, 17) ^ (0, Et.rotr)(d, 19) ^ d >>> 10;
                Pn[u] = m + Pn[u - 7] + p + Pn[u - 16] | 0;
            }
            let { A: r, B: s, C: o, D: i, E: a, F: l, G: f, H: c } = this;
            for(let u = 0; u < 64; u++){
                const h = (0, Et.rotr)(a, 6) ^ (0, Et.rotr)(a, 11) ^ (0, Et.rotr)(a, 25), d = c + h + (0, Ll.Chi)(a, l, f) + qS[u] + Pn[u] | 0, p = ((0, Et.rotr)(r, 2) ^ (0, Et.rotr)(r, 13) ^ (0, Et.rotr)(r, 22)) + (0, Ll.Maj)(r, s, o) | 0;
                c = f, f = l, l = a, a = i + d | 0, i = o, o = s, s = r, r = d + p | 0;
            }
            r = r + this.A | 0, s = s + this.B | 0, o = o + this.C | 0, i = i + this.D | 0, a = a + this.E | 0, l = l + this.F | 0, f = f + this.G | 0, c = c + this.H | 0, this.set(r, s, o, i, a, l, f, c);
        }
        roundClean() {
            Pn.fill(0);
        }
        destroy() {
            this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
        }
    }
    class e4 extends g_ {
        constructor(){
            super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
        }
    }
    Io.sha256 = (0, Et.wrapConstructor)(()=>new g_);
    Io.sha224 = (0, Et.wrapConstructor)(()=>new e4);
    function t4(e) {
        if (e.length >= 255) throw new TypeError("Alphabet too long");
        for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
        for(var r = 0; r < e.length; r++){
            var s = e.charAt(r), o = s.charCodeAt(0);
            if (t[o] !== 255) throw new TypeError(s + " is ambiguous");
            t[o] = r;
        }
        var i = e.length, a = e.charAt(0), l = Math.log(i) / Math.log(256), f = Math.log(256) / Math.log(i);
        function c(d) {
            if (d instanceof Uint8Array || (ArrayBuffer.isView(d) ? d = new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : Array.isArray(d) && (d = Uint8Array.from(d))), !(d instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (d.length === 0) return "";
            for(var p = 0, m = 0, x = 0, w = d.length; x !== w && d[x] === 0;)x++, p++;
            for(var _ = (w - x) * f + 1 >>> 0, g = new Uint8Array(_); x !== w;){
                for(var A = d[x], P = 0, j = _ - 1; (A !== 0 || P < m) && j !== -1; j--, P++)A += 256 * g[j] >>> 0, g[j] = A % i >>> 0, A = A / i >>> 0;
                if (A !== 0) throw new Error("Non-zero carry");
                m = P, x++;
            }
            for(var N = _ - m; N !== _ && g[N] === 0;)N++;
            for(var F = a.repeat(p); N < _; ++N)F += e.charAt(g[N]);
            return F;
        }
        function u(d) {
            if (typeof d != "string") throw new TypeError("Expected String");
            if (d.length === 0) return new Uint8Array;
            for(var p = 0, m = 0, x = 0; d[p] === a;)m++, p++;
            for(var w = (d.length - p) * l + 1 >>> 0, _ = new Uint8Array(w); d[p];){
                var g = t[d.charCodeAt(p)];
                if (g === 255) return;
                for(var A = 0, P = w - 1; (g !== 0 || A < x) && P !== -1; P--, A++)g += i * _[P] >>> 0, _[P] = g % 256 >>> 0, g = g / 256 >>> 0;
                if (g !== 0) throw new Error("Non-zero carry");
                x = A, p++;
            }
            for(var j = w - x; j !== w && _[j] === 0;)j++;
            for(var N = new Uint8Array(m + (w - j)), F = m; j !== w;)N[F++] = _[j++];
            return N;
        }
        function h(d) {
            var p = u(d);
            if (p) return p;
            throw new Error("Non-base" + i + " character");
        }
        return {
            encode: c,
            decodeUnsafe: u,
            decode: h
        };
    }
    var n4 = t4;
    const r4 = n4, s4 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    r4(s4);
    let sc;
    try {
        sc = new TextDecoder;
    } catch  {}
    let q, vr, $ = 0;
    const o4 = 105, i4 = 57342, a4 = 57343, jh = 57337, Mh = 6, zr = {};
    let ae = {}, Ee, ha, pa = 0, Ao = 0, Fe, Mt, Me = [], oc = [], ft, nt, Ns, Rh = {
        useRecords: !1,
        mapsAsObjects: !0
    }, Oo = !1, y_ = 2;
    try {
        new Function("");
    } catch  {
        y_ = 1 / 0;
    }
    class To {
        constructor(t){
            if (t && ((t.keyMap || t._keyMap) && !t.useRecords && (t.useRecords = !1, t.mapsAsObjects = !0), t.useRecords === !1 && t.mapsAsObjects === void 0 && (t.mapsAsObjects = !0), t.getStructures && (t.getShared = t.getStructures), t.getShared && !t.structures && ((t.structures = []).uninitialized = !0), t.keyMap)) {
                this.mapKey = new Map;
                for (let [n, r] of Object.entries(t.keyMap))this.mapKey.set(r, n);
            }
            Object.assign(this, t);
        }
        decodeKey(t) {
            return this.keyMap && this.mapKey.get(t) || t;
        }
        encodeKey(t) {
            return this.keyMap && this.keyMap.hasOwnProperty(t) ? this.keyMap[t] : t;
        }
        encodeKeys(t) {
            if (!this._keyMap) return t;
            let n = new Map;
            for (let [r, s] of Object.entries(t))n.set(this._keyMap.hasOwnProperty(r) ? this._keyMap[r] : r, s);
            return n;
        }
        decodeKeys(t) {
            if (!this._keyMap || t.constructor.name != "Map") return t;
            if (!this._mapKey) {
                this._mapKey = new Map;
                for (let [r, s] of Object.entries(this._keyMap))this._mapKey.set(s, r);
            }
            let n = {};
            return t.forEach((r, s)=>n[Rt(this._mapKey.has(s) ? this._mapKey.get(s) : s)] = r), n;
        }
        mapDecode(t, n) {
            let r = this.decode(t);
            if (this._keyMap) switch(r.constructor.name){
                case "Array":
                    return r.map((s)=>this.decodeKeys(s));
            }
            return r;
        }
        decode(t, n) {
            if (q) return v_(()=>(uc(), this ? this.decode(t, n) : To.prototype.decode.call(Rh, t, n)));
            vr = n > -1 ? n : t.length, $ = 0, Ao = 0, ha = null, Fe = null, q = t;
            try {
                nt = t.dataView || (t.dataView = new DataView(t.buffer, t.byteOffset, t.byteLength));
            } catch (r) {
                throw q = null, t instanceof Uint8Array ? r : new Error("Source must be a Uint8Array or Buffer but was a " + (t && typeof t == "object" ? t.constructor.name : typeof t));
            }
            if (this instanceof To) {
                if (ae = this, ft = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues), this.structures) return Ee = this.structures, di();
                (!Ee || Ee.length > 0) && (Ee = []);
            } else ae = Rh, (!Ee || Ee.length > 0) && (Ee = []), ft = null;
            return di();
        }
        decodeMultiple(t, n) {
            let r, s = 0;
            try {
                let o = t.length;
                Oo = !0;
                let i = this ? this.decode(t, o) : Nf.decode(t, o);
                if (n) {
                    if (n(i) === !1) return;
                    for(; $ < o;)if (s = $, n(di()) === !1) return;
                } else {
                    for(r = [
                        i
                    ]; $ < o;)s = $, r.push(di());
                    return r;
                }
            } catch (o) {
                throw o.lastPosition = s, o.values = r, o;
            } finally{
                Oo = !1, uc();
            }
        }
    }
    function di() {
        try {
            let e = ue();
            if (Fe) {
                if ($ >= Fe.postBundlePosition) {
                    let t = new Error("Unexpected bundle position");
                    throw t.incomplete = !0, t;
                }
                $ = Fe.postBundlePosition, Fe = null;
            }
            if ($ == vr) Ee = null, q = null, Mt && (Mt = null);
            else if ($ > vr) {
                let t = new Error("Unexpected end of CBOR data");
                throw t.incomplete = !0, t;
            } else if (!Oo) throw new Error("Data read, but end of buffer not reached");
            return e;
        } catch (e) {
            throw uc(), (e instanceof RangeError || e.message.startsWith("Unexpected end of buffer")) && (e.incomplete = !0), e;
        }
    }
    function ue() {
        let e = q[$++], t = e >> 5;
        if (e = e & 31, e > 23) switch(e){
            case 24:
                e = q[$++];
                break;
            case 25:
                if (t == 7) return f4();
                e = nt.getUint16($), $ += 2;
                break;
            case 26:
                if (t == 7) {
                    let n = nt.getFloat32($);
                    if (ae.useFloat32 > 2) {
                        let r = Hf[(q[$] & 127) << 1 | q[$ + 1] >> 7];
                        return $ += 4, (r * n + (n > 0 ? .5 : -.5) >> 0) / r;
                    }
                    return $ += 4, n;
                }
                e = nt.getUint32($), $ += 4;
                break;
            case 27:
                if (t == 7) {
                    let n = nt.getFloat64($);
                    return $ += 8, n;
                }
                if (t > 1) {
                    if (nt.getUint32($) > 0) throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
                    e = nt.getUint32($ + 4);
                } else ae.int64AsNumber ? (e = nt.getUint32($) * 4294967296, e += nt.getUint32($ + 4)) : e = nt.getBigUint64($);
                $ += 8;
                break;
            case 31:
                switch(t){
                    case 2:
                    case 3:
                        throw new Error("Indefinite length not supported for byte or text strings");
                    case 4:
                        let n = [], r, s = 0;
                        for(; (r = ue()) != zr;)n[s++] = r;
                        return t == 4 ? n : t == 3 ? n.join("") : Buffer.concat(n);
                    case 5:
                        let o;
                        if (ae.mapsAsObjects) {
                            let i = {};
                            if (ae.keyMap) for(; (o = ue()) != zr;)i[Rt(ae.decodeKey(o))] = ue();
                            else for(; (o = ue()) != zr;)i[Rt(o)] = ue();
                            return i;
                        } else {
                            Ns && (ae.mapsAsObjects = !0, Ns = !1);
                            let i = new Map;
                            if (ae.keyMap) for(; (o = ue()) != zr;)i.set(ae.decodeKey(o), ue());
                            else for(; (o = ue()) != zr;)i.set(o, ue());
                            return i;
                        }
                    case 7:
                        return zr;
                    default:
                        throw new Error("Invalid major type for indefinite length " + t);
                }
            default:
                throw new Error("Unknown token " + e);
        }
        switch(t){
            case 0:
                return e;
            case 1:
                return ~e;
            case 2:
                return c4(e);
            case 3:
                if (Ao >= $) return ha.slice($ - pa, ($ += e) - pa);
                if (Ao == 0 && vr < 140 && e < 32) {
                    let s = e < 16 ? m_(e) : u4(e);
                    if (s != null) return s;
                }
                return l4(e);
            case 4:
                let n = new Array(e);
                for(let s = 0; s < e; s++)n[s] = ue();
                return n;
            case 5:
                if (ae.mapsAsObjects) {
                    let s = {};
                    if (ae.keyMap) for(let o = 0; o < e; o++)s[Rt(ae.decodeKey(ue()))] = ue();
                    else for(let o = 0; o < e; o++)s[Rt(ue())] = ue();
                    return s;
                } else {
                    Ns && (ae.mapsAsObjects = !0, Ns = !1);
                    let s = new Map;
                    if (ae.keyMap) for(let o = 0; o < e; o++)s.set(ae.decodeKey(ue()), ue());
                    else for(let o = 0; o < e; o++)s.set(ue(), ue());
                    return s;
                }
            case 6:
                if (e >= jh) {
                    let s = Ee[e & 8191];
                    if (s) return s.read || (s.read = ic(s)), s.read();
                    if (e < 65536) {
                        if (e == a4) {
                            let o = ns(), i = ue(), a = ue();
                            lc(i, a);
                            let l = {};
                            if (ae.keyMap) for(let f = 2; f < o; f++){
                                let c = ae.decodeKey(a[f - 2]);
                                l[Rt(c)] = ue();
                            }
                            else for(let f = 2; f < o; f++){
                                let c = a[f - 2];
                                l[Rt(c)] = ue();
                            }
                            return l;
                        } else if (e == i4) {
                            let o = ns(), i = ue();
                            for(let a = 2; a < o; a++)lc(i++, ue());
                            return ue();
                        } else if (e == jh) return m4();
                        if (ae.getShared && (zf(), s = Ee[e & 8191], s)) return s.read || (s.read = ic(s)), s.read();
                    }
                }
                let r = Me[e];
                if (r) return r.handlesRead ? r(ue) : r(ue());
                {
                    let s = ue();
                    for(let o = 0; o < oc.length; o++){
                        let i = oc[o](e, s);
                        if (i !== void 0) return i;
                    }
                    return new Ar(s, e);
                }
            case 7:
                switch(e){
                    case 20:
                        return !1;
                    case 21:
                        return !0;
                    case 22:
                        return null;
                    case 23:
                        return;
                    case 31:
                    default:
                        let s = (ft || ar())[e];
                        if (s !== void 0) return s;
                        throw new Error("Unknown token " + e);
                }
            default:
                if (isNaN(e)) {
                    let s = new Error("Unexpected end of CBOR data");
                    throw s.incomplete = !0, s;
                }
                throw new Error("Unknown CBOR token " + e);
        }
    }
    const Ph = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
    function ic(e) {
        function t() {
            let n = q[$++];
            if (n = n & 31, n > 23) switch(n){
                case 24:
                    n = q[$++];
                    break;
                case 25:
                    n = nt.getUint16($), $ += 2;
                    break;
                case 26:
                    n = nt.getUint32($), $ += 4;
                    break;
                default:
                    throw new Error("Expected array header, but got " + q[$ - 1]);
            }
            let r = this.compiledReader;
            for(; r;){
                if (r.propertyCount === n) return r(ue);
                r = r.next;
            }
            if (this.slowReads++ >= y_) {
                let o = this.length == n ? this : this.slice(0, n);
                return r = ae.keyMap ? new Function("r", "return {" + o.map((i)=>ae.decodeKey(i)).map((i)=>Ph.test(i) ? Rt(i) + ":r()" : "[" + JSON.stringify(i) + "]:r()").join(",") + "}") : new Function("r", "return {" + o.map((i)=>Ph.test(i) ? Rt(i) + ":r()" : "[" + JSON.stringify(i) + "]:r()").join(",") + "}"), this.compiledReader && (r.next = this.compiledReader), r.propertyCount = n, this.compiledReader = r, r(ue);
            }
            let s = {};
            if (ae.keyMap) for(let o = 0; o < n; o++)s[Rt(ae.decodeKey(this[o]))] = ue();
            else for(let o = 0; o < n; o++)s[Rt(this[o])] = ue();
            return s;
        }
        return e.slowReads = 0, t;
    }
    function Rt(e) {
        if (typeof e == "string") return e === "__proto__" ? "__proto_" : e;
        if (typeof e == "number" || typeof e == "boolean" || typeof e == "bigint") return e.toString();
        if (e == null) return e + "";
        throw new Error("Invalid property name type " + typeof e);
    }
    let l4 = ac;
    function ac(e) {
        let t;
        if (e < 16 && (t = m_(e))) return t;
        if (e > 64 && sc) return sc.decode(q.subarray($, $ += e));
        const n = $ + e, r = [];
        for(t = ""; $ < n;){
            const s = q[$++];
            if (!(s & 128)) r.push(s);
            else if ((s & 224) === 192) {
                const o = q[$++] & 63;
                r.push((s & 31) << 6 | o);
            } else if ((s & 240) === 224) {
                const o = q[$++] & 63, i = q[$++] & 63;
                r.push((s & 31) << 12 | o << 6 | i);
            } else if ((s & 248) === 240) {
                const o = q[$++] & 63, i = q[$++] & 63, a = q[$++] & 63;
                let l = (s & 7) << 18 | o << 12 | i << 6 | a;
                l > 65535 && (l -= 65536, r.push(l >>> 10 & 1023 | 55296), l = 56320 | l & 1023), r.push(l);
            } else r.push(s);
            r.length >= 4096 && (t += He.apply(String, r), r.length = 0);
        }
        return r.length > 0 && (t += He.apply(String, r)), t;
    }
    let He = String.fromCharCode;
    function u4(e) {
        let t = $, n = new Array(e);
        for(let r = 0; r < e; r++){
            const s = q[$++];
            if ((s & 128) > 0) {
                $ = t;
                return;
            }
            n[r] = s;
        }
        return He.apply(String, n);
    }
    function m_(e) {
        if (e < 4) if (e < 2) {
            if (e === 0) return "";
            {
                let t = q[$++];
                if ((t & 128) > 1) {
                    $ -= 1;
                    return;
                }
                return He(t);
            }
        } else {
            let t = q[$++], n = q[$++];
            if ((t & 128) > 0 || (n & 128) > 0) {
                $ -= 2;
                return;
            }
            if (e < 3) return He(t, n);
            let r = q[$++];
            if ((r & 128) > 0) {
                $ -= 3;
                return;
            }
            return He(t, n, r);
        }
        else {
            let t = q[$++], n = q[$++], r = q[$++], s = q[$++];
            if ((t & 128) > 0 || (n & 128) > 0 || (r & 128) > 0 || (s & 128) > 0) {
                $ -= 4;
                return;
            }
            if (e < 6) {
                if (e === 4) return He(t, n, r, s);
                {
                    let o = q[$++];
                    if ((o & 128) > 0) {
                        $ -= 5;
                        return;
                    }
                    return He(t, n, r, s, o);
                }
            } else if (e < 8) {
                let o = q[$++], i = q[$++];
                if ((o & 128) > 0 || (i & 128) > 0) {
                    $ -= 6;
                    return;
                }
                if (e < 7) return He(t, n, r, s, o, i);
                let a = q[$++];
                if ((a & 128) > 0) {
                    $ -= 7;
                    return;
                }
                return He(t, n, r, s, o, i, a);
            } else {
                let o = q[$++], i = q[$++], a = q[$++], l = q[$++];
                if ((o & 128) > 0 || (i & 128) > 0 || (a & 128) > 0 || (l & 128) > 0) {
                    $ -= 8;
                    return;
                }
                if (e < 10) {
                    if (e === 8) return He(t, n, r, s, o, i, a, l);
                    {
                        let f = q[$++];
                        if ((f & 128) > 0) {
                            $ -= 9;
                            return;
                        }
                        return He(t, n, r, s, o, i, a, l, f);
                    }
                } else if (e < 12) {
                    let f = q[$++], c = q[$++];
                    if ((f & 128) > 0 || (c & 128) > 0) {
                        $ -= 10;
                        return;
                    }
                    if (e < 11) return He(t, n, r, s, o, i, a, l, f, c);
                    let u = q[$++];
                    if ((u & 128) > 0) {
                        $ -= 11;
                        return;
                    }
                    return He(t, n, r, s, o, i, a, l, f, c, u);
                } else {
                    let f = q[$++], c = q[$++], u = q[$++], h = q[$++];
                    if ((f & 128) > 0 || (c & 128) > 0 || (u & 128) > 0 || (h & 128) > 0) {
                        $ -= 12;
                        return;
                    }
                    if (e < 14) {
                        if (e === 12) return He(t, n, r, s, o, i, a, l, f, c, u, h);
                        {
                            let d = q[$++];
                            if ((d & 128) > 0) {
                                $ -= 13;
                                return;
                            }
                            return He(t, n, r, s, o, i, a, l, f, c, u, h, d);
                        }
                    } else {
                        let d = q[$++], p = q[$++];
                        if ((d & 128) > 0 || (p & 128) > 0) {
                            $ -= 14;
                            return;
                        }
                        if (e < 15) return He(t, n, r, s, o, i, a, l, f, c, u, h, d, p);
                        let m = q[$++];
                        if ((m & 128) > 0) {
                            $ -= 15;
                            return;
                        }
                        return He(t, n, r, s, o, i, a, l, f, c, u, h, d, p, m);
                    }
                }
            }
        }
    }
    function c4(e) {
        return ae.copyBuffers ? Uint8Array.prototype.slice.call(q, $, $ += e) : q.subarray($, $ += e);
    }
    let __ = new Float32Array(1), hi = new Uint8Array(__.buffer, 0, 4);
    function f4() {
        let e = q[$++], t = q[$++], n = (e & 127) >> 2;
        if (n === 31) return t || e & 3 ? NaN : e & 128 ? -1 / 0 : 1 / 0;
        if (n === 0) {
            let r = ((e & 3) << 8 | t) / 16777216;
            return e & 128 ? -r : r;
        }
        return hi[3] = e & 128 | (n >> 1) + 56, hi[2] = (e & 7) << 5 | t >> 3, hi[1] = t << 5, hi[0] = 0, __[0];
    }
    new Array(4096);
    class Ar {
        constructor(t, n){
            this.value = t, this.tag = n;
        }
    }
    Me[0] = (e)=>new Date(e);
    Me[1] = (e)=>new Date(Math.round(e * 1e3));
    Me[2] = (e)=>{
        let t = BigInt(0);
        for(let n = 0, r = e.byteLength; n < r; n++)t = BigInt(e[n]) + t << BigInt(8);
        return t;
    };
    Me[3] = (e)=>BigInt(-1) - Me[2](e);
    Me[4] = (e)=>+(e[1] + "e" + e[0]);
    Me[5] = (e)=>e[1] * Math.exp(e[0] * Math.log(2));
    const lc = (e, t)=>{
        e = e - 57344;
        let n = Ee[e];
        n && n.isShared && ((Ee.restoreStructures || (Ee.restoreStructures = []))[e] = n), Ee[e] = t, t.read = ic(t);
    };
    Me[o4] = (e)=>{
        let t = e.length, n = e[1];
        lc(e[0], n);
        let r = {};
        for(let s = 2; s < t; s++){
            let o = n[s - 2];
            r[Rt(o)] = e[s];
        }
        return r;
    };
    Me[14] = (e)=>Fe ? Fe[0].slice(Fe.position0, Fe.position0 += e) : new Ar(e, 14);
    Me[15] = (e)=>Fe ? Fe[1].slice(Fe.position1, Fe.position1 += e) : new Ar(e, 15);
    let d4 = {
        Error,
        RegExp
    };
    Me[27] = (e)=>(d4[e[0]] || Error)(e[1], e[2]);
    const w_ = (e)=>{
        if (q[$++] != 132) {
            let n = new Error("Packed values structure must be followed by a 4 element array");
            throw q.length < $ && (n.incomplete = !0), n;
        }
        let t = e();
        if (!t || !t.length) {
            let n = new Error("Packed values structure must be followed by a 4 element array");
            throw n.incomplete = !0, n;
        }
        return ft = ft ? t.concat(ft.slice(t.length)) : t, ft.prefixes = e(), ft.suffixes = e(), e();
    };
    w_.handlesRead = !0;
    Me[51] = w_;
    Me[Mh] = (e)=>{
        if (!ft) if (ae.getShared) zf();
        else return new Ar(e, Mh);
        if (typeof e == "number") return ft[16 + (e >= 0 ? 2 * e : -2 * e - 1)];
        let t = new Error("No support for non-integer packed references yet");
        throw e === void 0 && (t.incomplete = !0), t;
    };
    Me[28] = (e)=>{
        Mt || (Mt = new Map, Mt.id = 0);
        let t = Mt.id++, n = $, r = q[$], s;
        r >> 5 == 4 ? s = [] : s = {};
        let o = {
            target: s
        };
        Mt.set(t, o);
        let i = e();
        return o.used ? (Object.getPrototypeOf(s) !== Object.getPrototypeOf(i) && ($ = n, s = i, Mt.set(t, {
            target: s
        }), i = e()), Object.assign(s, i)) : (o.target = i, i);
    };
    Me[28].handlesRead = !0;
    Me[29] = (e)=>{
        let t = Mt.get(e);
        return t.used = !0, t.target;
    };
    Me[258] = (e)=>new Set(e);
    (Me[259] = (e)=>(ae.mapsAsObjects && (ae.mapsAsObjects = !1, Ns = !0), e())).handlesRead = !0;
    function Hr(e, t) {
        return typeof e == "string" ? e + t : e instanceof Array ? e.concat(t) : Object.assign({}, e, t);
    }
    function ar() {
        if (!ft) if (ae.getShared) zf();
        else throw new Error("No packed values available");
        return ft;
    }
    const h4 = 1399353956;
    oc.push((e, t)=>{
        if (e >= 225 && e <= 255) return Hr(ar().prefixes[e - 224], t);
        if (e >= 28704 && e <= 32767) return Hr(ar().prefixes[e - 28672], t);
        if (e >= 1879052288 && e <= 2147483647) return Hr(ar().prefixes[e - 1879048192], t);
        if (e >= 216 && e <= 223) return Hr(t, ar().suffixes[e - 216]);
        if (e >= 27647 && e <= 28671) return Hr(t, ar().suffixes[e - 27639]);
        if (e >= 1811940352 && e <= 1879048191) return Hr(t, ar().suffixes[e - 1811939328]);
        if (e == h4) return {
            packedValues: ft,
            structures: Ee.slice(0),
            version: t
        };
        if (e == 55799) return t;
    });
    const p4 = new Uint8Array(new Uint16Array([
        1
    ]).buffer)[0] == 1, Dh = [
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        typeof BigUint64Array > "u" ? {
            name: "BigUint64Array"
        } : BigUint64Array,
        Int8Array,
        Int16Array,
        Int32Array,
        typeof BigInt64Array > "u" ? {
            name: "BigInt64Array"
        } : BigInt64Array,
        Float32Array,
        Float64Array
    ], g4 = [
        64,
        68,
        69,
        70,
        71,
        72,
        77,
        78,
        79,
        85,
        86
    ];
    for(let e = 0; e < Dh.length; e++)y4(Dh[e], g4[e]);
    function y4(e, t) {
        let n = "get" + e.name.slice(0, -5), r;
        typeof e == "function" ? r = e.BYTES_PER_ELEMENT : e = null;
        for(let s = 0; s < 2; s++){
            if (!s && r == 1) continue;
            let o = r == 2 ? 1 : r == 4 ? 2 : r == 8 ? 3 : 0;
            Me[s ? t : t - 4] = r == 1 || s == p4 ? (i)=>{
                if (!e) throw new Error("Could not find typed array for code " + t);
                return !ae.copyBuffers && (r === 1 || r === 2 && !(i.byteOffset & 1) || r === 4 && !(i.byteOffset & 3) || r === 8 && !(i.byteOffset & 7)) ? new e(i.buffer, i.byteOffset, i.byteLength >> o) : new e(Uint8Array.prototype.slice.call(i, 0).buffer);
            } : (i)=>{
                if (!e) throw new Error("Could not find typed array for code " + t);
                let a = new DataView(i.buffer, i.byteOffset, i.byteLength), l = i.length >> o, f = new e(l), c = a[n];
                for(let u = 0; u < l; u++)f[u] = c.call(a, u << o, s);
                return f;
            };
        }
    }
    function m4() {
        let e = ns(), t = $ + ue();
        for(let r = 2; r < e; r++){
            let s = ns();
            $ += s;
        }
        let n = $;
        return $ = t, Fe = [
            ac(ns()),
            ac(ns())
        ], Fe.position0 = 0, Fe.position1 = 0, Fe.postBundlePosition = $, $ = n, ue();
    }
    function ns() {
        let e = q[$++] & 31;
        if (e > 23) switch(e){
            case 24:
                e = q[$++];
                break;
            case 25:
                e = nt.getUint16($), $ += 2;
                break;
            case 26:
                e = nt.getUint32($), $ += 4;
                break;
        }
        return e;
    }
    function zf() {
        if (ae.getShared) {
            let e = v_(()=>(q = null, ae.getShared())) || {}, t = e.structures || [];
            ae.sharedVersion = e.version, ft = ae.sharedValues = e.packedValues, Ee === !0 ? ae.structures = Ee = t : Ee.splice.apply(Ee, [
                0,
                t.length
            ].concat(t));
        }
    }
    function v_(e) {
        let t = vr, n = $, r = pa, s = Ao, o = ha, i = Mt, a = Fe, l = new Uint8Array(q.slice(0, vr)), f = Ee, c = ae, u = Oo, h = e();
        return vr = t, $ = n, pa = r, Ao = s, ha = o, Mt = i, Fe = a, q = l, Oo = u, Ee = f, ae = c, nt = new DataView(q.buffer, q.byteOffset, q.byteLength), h;
    }
    function uc() {
        q = null, Mt = null, Ee = null;
    }
    const Hf = new Array(147);
    for(let e = 0; e < 256; e++)Hf[e] = +("1e" + Math.floor(45.15 - e * .30103));
    let Nf = new To({
        useRecords: !1
    });
    Nf.decode;
    Nf.decodeMultiple;
    let Ti;
    try {
        Ti = new TextEncoder;
    } catch  {}
    let cc, b_;
    const Qa = typeof globalThis == "object" && globalThis.Buffer, No = typeof Qa < "u", Ul = No ? Qa.allocUnsafeSlow : Uint8Array, Lh = No ? Qa : Uint8Array, Uh = 256, Fh = No ? 4294967296 : 2144337920;
    let Fl, D, _e, E = 0, Dn, Pe = null;
    const _4 = 61440, w4 = /[\u0080-\uFFFF]/, _t = Symbol("record-id");
    class v4 extends To {
        constructor(t){
            super(t), this.offset = 0;
            let n, r, s, o, i;
            t = t || {};
            let a = Lh.prototype.utf8Write ? function(y, L, S) {
                return D.utf8Write(y, L, S);
            } : Ti && Ti.encodeInto ? function(y, L) {
                return Ti.encodeInto(y, D.subarray(L)).written;
            } : !1, l = this, f = t.structures || t.saveStructures, c = t.maxSharedStructures;
            if (c == null && (c = f ? 128 : 0), c > 8190) throw new Error("Maximum maxSharedStructure is 8190");
            let u = t.sequential;
            u && (c = 0), this.structures || (this.structures = []), this.saveStructures && (this.saveShared = this.saveStructures);
            let h, d, p = t.sharedValues, m;
            if (p) {
                m = Object.create(null);
                for(let y = 0, L = p.length; y < L; y++)m[p[y]] = y;
            }
            let x = [], w = 0, _ = 0;
            this.mapEncode = function(y, L) {
                if (this._keyMap && !this._mapped) switch(y.constructor.name){
                    case "Array":
                        y = y.map((S)=>this.encodeKeys(S));
                        break;
                }
                return this.encode(y, L);
            }, this.encode = function(y, L) {
                if (D || (D = new Ul(8192), _e = new DataView(D.buffer, 0, 8192), E = 0), Dn = D.length - 10, Dn - E < 2048 ? (D = new Ul(D.length), _e = new DataView(D.buffer, 0, D.length), Dn = D.length - 10, E = 0) : L === Bh && (E = E + 7 & 2147483640), n = E, l.useSelfDescribedHeader && (_e.setUint32(E, 3654940416), E += 3), i = l.structuredClone ? new Map : null, l.bundleStrings && typeof y != "string" ? (Pe = [], Pe.size = 1 / 0) : Pe = null, r = l.structures, r) {
                    if (r.uninitialized) {
                        let I = l.getShared() || {};
                        l.structures = r = I.structures || [], l.sharedVersion = I.version;
                        let k = l.sharedValues = I.packedValues;
                        if (k) {
                            m = {};
                            for(let M = 0, v = k.length; M < v; M++)m[k[M]] = M;
                        }
                    }
                    let S = r.length;
                    if (S > c && !u && (S = c), !r.transitions) {
                        r.transitions = Object.create(null);
                        for(let I = 0; I < S; I++){
                            let k = r[I];
                            if (!k) continue;
                            let M, v = r.transitions;
                            for(let T = 0, z = k.length; T < z; T++){
                                v[_t] === void 0 && (v[_t] = I);
                                let V = k[T];
                                M = v[V], M || (M = v[V] = Object.create(null)), v = M;
                            }
                            v[_t] = I | 1048576;
                        }
                    }
                    u || (r.nextId = S);
                }
                if (s && (s = !1), o = r || [], d = m, t.pack) {
                    let S = new Map;
                    if (S.values = [], S.encoder = l, S.maxValues = t.maxPrivatePackedValues || (m ? 16 : 1 / 0), S.objectMap = m || !1, S.samplingPackedValues = h, ji(y, S), S.values.length > 0) {
                        D[E++] = 216, D[E++] = 51, sn(4);
                        let I = S.values;
                        g(I), sn(0), sn(0), d = Object.create(m || null);
                        for(let k = 0, M = I.length; k < M; k++)d[I[k]] = k;
                    }
                }
                Fl = L & Hl;
                try {
                    if (Fl) return;
                    if (g(y), Pe && Nh(n, g), l.offset = E, i && i.idsToInsert) {
                        E += i.idsToInsert.length * 2, E > Dn && P(E), l.offset = E;
                        let S = S4(D.subarray(n, E), i.idsToInsert);
                        return i = null, S;
                    }
                    return L & Bh ? (D.start = n, D.end = E, D) : D.subarray(n, E);
                } finally{
                    if (r) {
                        if (_ < 10 && _++, r.length > c && (r.length = c), w > 1e4) r.transitions = null, _ = 0, w = 0, x.length > 0 && (x = []);
                        else if (x.length > 0 && !u) {
                            for(let S = 0, I = x.length; S < I; S++)x[S][_t] = void 0;
                            x = [];
                        }
                    }
                    if (s && l.saveShared) {
                        l.structures.length > c && (l.structures = l.structures.slice(0, c));
                        let S = D.subarray(n, E);
                        return l.updateSharedData() === !1 ? l.encode(y) : S;
                    }
                    L & k4 && (E = n);
                }
            }, this.findCommonStringsToPack = ()=>(h = new Map, m || (m = Object.create(null)), (y)=>{
                    let L = y && y.threshold || 4, S = this.pack ? y.maxPrivatePackedValues || 16 : 0;
                    p || (p = this.sharedValues = []);
                    for (let [I, k] of h)k.count > L && (m[I] = S++, p.push(I), s = !0);
                    for(; this.saveShared && this.updateSharedData() === !1;);
                    h = null;
                });
            const g = (y)=>{
                E > Dn && (D = P(E));
                var L = typeof y, S;
                if (L === "string") {
                    if (d) {
                        let v = d[y];
                        if (v >= 0) {
                            v < 16 ? D[E++] = v + 224 : (D[E++] = 198, v & 1 ? g(15 - v >> 1) : g(v - 16 >> 1));
                            return;
                        } else if (h && !t.pack) {
                            let T = h.get(y);
                            T ? T.count++ : h.set(y, {
                                count: 1
                            });
                        }
                    }
                    let I = y.length;
                    if (Pe && I >= 4 && I < 1024) {
                        if ((Pe.size += I) > _4) {
                            let T, z = (Pe[0] ? Pe[0].length * 3 + Pe[1].length : 0) + 10;
                            E + z > Dn && (D = P(E + z)), D[E++] = 217, D[E++] = 223, D[E++] = 249, D[E++] = Pe.position ? 132 : 130, D[E++] = 26, T = E - n, E += 4, Pe.position && Nh(n, g), Pe = [
                                "",
                                ""
                            ], Pe.size = 0, Pe.position = T;
                        }
                        let v = w4.test(y);
                        Pe[v ? 0 : 1] += y, D[E++] = v ? 206 : 207, g(I);
                        return;
                    }
                    let k;
                    I < 32 ? k = 1 : I < 256 ? k = 2 : I < 65536 ? k = 3 : k = 5;
                    let M = I * 3;
                    if (E + M > Dn && (D = P(E + M)), I < 64 || !a) {
                        let v, T, z, V = E + k;
                        for(v = 0; v < I; v++)T = y.charCodeAt(v), T < 128 ? D[V++] = T : T < 2048 ? (D[V++] = T >> 6 | 192, D[V++] = T & 63 | 128) : (T & 64512) === 55296 && ((z = y.charCodeAt(v + 1)) & 64512) === 56320 ? (T = 65536 + ((T & 1023) << 10) + (z & 1023), v++, D[V++] = T >> 18 | 240, D[V++] = T >> 12 & 63 | 128, D[V++] = T >> 6 & 63 | 128, D[V++] = T & 63 | 128) : (D[V++] = T >> 12 | 224, D[V++] = T >> 6 & 63 | 128, D[V++] = T & 63 | 128);
                        S = V - E - k;
                    } else S = a(y, E + k, M);
                    S < 24 ? D[E++] = 96 | S : S < 256 ? (k < 2 && D.copyWithin(E + 2, E + 1, E + 1 + S), D[E++] = 120, D[E++] = S) : S < 65536 ? (k < 3 && D.copyWithin(E + 3, E + 2, E + 2 + S), D[E++] = 121, D[E++] = S >> 8, D[E++] = S & 255) : (k < 5 && D.copyWithin(E + 5, E + 3, E + 3 + S), D[E++] = 122, _e.setUint32(E, S), E += 4), E += S;
                } else if (L === "number") if (!this.alwaysUseFloat && y >>> 0 === y) y < 24 ? D[E++] = y : y < 256 ? (D[E++] = 24, D[E++] = y) : y < 65536 ? (D[E++] = 25, D[E++] = y >> 8, D[E++] = y & 255) : (D[E++] = 26, _e.setUint32(E, y), E += 4);
                else if (!this.alwaysUseFloat && y >> 0 === y) y >= -24 ? D[E++] = 31 - y : y >= -256 ? (D[E++] = 56, D[E++] = ~y) : y >= -65536 ? (D[E++] = 57, _e.setUint16(E, ~y), E += 2) : (D[E++] = 58, _e.setUint32(E, ~y), E += 4);
                else {
                    let I;
                    if ((I = this.useFloat32) > 0 && y < 4294967296 && y >= -2147483648) {
                        D[E++] = 250, _e.setFloat32(E, y);
                        let k;
                        if (I < 4 || (k = y * Hf[(D[E] & 127) << 1 | D[E + 1] >> 7]) >> 0 === k) {
                            E += 4;
                            return;
                        } else E--;
                    }
                    D[E++] = 251, _e.setFloat64(E, y), E += 8;
                }
                else if (L === "object") if (!y) D[E++] = 246;
                else {
                    if (i) {
                        let k = i.get(y);
                        if (k) {
                            if (D[E++] = 216, D[E++] = 29, D[E++] = 25, !k.references) {
                                let M = i.idsToInsert || (i.idsToInsert = []);
                                k.references = [], M.push(k);
                            }
                            k.references.push(E - n), E += 2;
                            return;
                        } else i.set(y, {
                            offset: E - n
                        });
                    }
                    let I = y.constructor;
                    if (I === Object) A(y);
                    else if (I === Array) {
                        S = y.length, S < 24 ? D[E++] = 128 | S : sn(S);
                        for(let k = 0; k < S; k++)g(y[k]);
                    } else if (I === Map) if ((this.mapsAsObjects ? this.useTag259ForMaps !== !1 : this.useTag259ForMaps) && (D[E++] = 217, D[E++] = 1, D[E++] = 3), S = y.size, S < 24 ? D[E++] = 160 | S : S < 256 ? (D[E++] = 184, D[E++] = S) : S < 65536 ? (D[E++] = 185, D[E++] = S >> 8, D[E++] = S & 255) : (D[E++] = 186, _e.setUint32(E, S), E += 4), l.keyMap) for (let [k, M] of y)g(l.encodeKey(k)), g(M);
                    else for (let [k, M] of y)g(k), g(M);
                    else {
                        for(let k = 0, M = cc.length; k < M; k++){
                            let v = b_[k];
                            if (y instanceof v) {
                                let T = cc[k], z = T.tag;
                                z == null && (z = T.getTag && T.getTag.call(this, y)), z < 24 ? D[E++] = 192 | z : z < 256 ? (D[E++] = 216, D[E++] = z) : z < 65536 ? (D[E++] = 217, D[E++] = z >> 8, D[E++] = z & 255) : z > -1 && (D[E++] = 218, _e.setUint32(E, z), E += 4), T.encode.call(this, y, g, P);
                                return;
                            }
                        }
                        if (y[Symbol.iterator]) {
                            if (Fl) {
                                let k = new Error("Iterable should be serialized as iterator");
                                throw k.iteratorNotHandled = !0, k;
                            }
                            D[E++] = 159;
                            for (let k of y)g(k);
                            D[E++] = 255;
                            return;
                        }
                        if (y[Symbol.asyncIterator] || zl(y)) {
                            let k = new Error("Iterable/blob should be serialized as iterator");
                            throw k.iteratorNotHandled = !0, k;
                        }
                        if (this.useToJSON && y.toJSON) {
                            const k = y.toJSON();
                            if (k !== y) return g(k);
                        }
                        A(y);
                    }
                }
                else if (L === "boolean") D[E++] = y ? 245 : 244;
                else if (L === "bigint") {
                    if (y < BigInt(1) << BigInt(64) && y >= 0) D[E++] = 27, _e.setBigUint64(E, y);
                    else if (y > -(BigInt(1) << BigInt(64)) && y < 0) D[E++] = 59, _e.setBigUint64(E, -y - BigInt(1));
                    else if (this.largeBigIntToFloat) D[E++] = 251, _e.setFloat64(E, Number(y));
                    else throw new RangeError(y + " was too large to fit in CBOR 64-bit integer format, set largeBigIntToFloat to convert to float-64");
                    E += 8;
                } else if (L === "undefined") D[E++] = 247;
                else throw new Error("Unknown type: " + L);
            }, A = this.useRecords === !1 ? this.variableMapSize ? (y)=>{
                let L = Object.keys(y), S = Object.values(y), I = L.length;
                if (I < 24 ? D[E++] = 160 | I : I < 256 ? (D[E++] = 184, D[E++] = I) : I < 65536 ? (D[E++] = 185, D[E++] = I >> 8, D[E++] = I & 255) : (D[E++] = 186, _e.setUint32(E, I), E += 4), l.keyMap) for(let k = 0; k < I; k++)g(l.encodeKey(L[k])), g(S[k]);
                else for(let k = 0; k < I; k++)g(L[k]), g(S[k]);
            } : (y)=>{
                D[E++] = 185;
                let L = E - n;
                E += 2;
                let S = 0;
                if (l.keyMap) for(let I in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(I)) && (g(l.encodeKey(I)), g(y[I]), S++);
                else for(let I in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(I)) && (g(I), g(y[I]), S++);
                D[L++ + n] = S >> 8, D[L + n] = S & 255;
            } : (y, L)=>{
                let S, I = o.transitions || (o.transitions = Object.create(null)), k = 0, M = 0, v, T;
                if (this.keyMap) {
                    T = Object.keys(y).map((V)=>this.encodeKey(V)), M = T.length;
                    for(let V = 0; V < M; V++){
                        let de = T[V];
                        S = I[de], S || (S = I[de] = Object.create(null), k++), I = S;
                    }
                } else for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && (S = I[V], S || (I[_t] & 1048576 && (v = I[_t] & 65535), S = I[V] = Object.create(null), k++), I = S, M++);
                let z = I[_t];
                if (z !== void 0) z &= 65535, D[E++] = 217, D[E++] = z >> 8 | 224, D[E++] = z & 255;
                else if (T || (T = I.__keys__ || (I.__keys__ = Object.keys(y))), v === void 0 ? (z = o.nextId++, z || (z = 0, o.nextId = 1), z >= Uh && (o.nextId = (z = c) + 1)) : z = v, o[z] = T, z < c) {
                    D[E++] = 217, D[E++] = z >> 8 | 224, D[E++] = z & 255, I = o.transitions;
                    for(let V = 0; V < M; V++)(I[_t] === void 0 || I[_t] & 1048576) && (I[_t] = z), I = I[T[V]];
                    I[_t] = z | 1048576, s = !0;
                } else {
                    if (I[_t] = z, _e.setUint32(E, 3655335680), E += 3, k && (w += _ * k), x.length >= Uh - c && (x.shift()[_t] = void 0), x.push(I), sn(M + 2), g(57344 + z), g(T), L) return;
                    for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && g(y[V]);
                    return;
                }
                if (M < 24 ? D[E++] = 128 | M : sn(M), !L) for(let V in y)(typeof y.hasOwnProperty != "function" || y.hasOwnProperty(V)) && g(y[V]);
            }, P = (y)=>{
                let L;
                if (y > 16777216) {
                    if (y - n > Fh) throw new Error("Encoded buffer would be larger than maximum buffer size");
                    L = Math.min(Fh, Math.round(Math.max((y - n) * (y > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096);
                } else L = (Math.max(y - n << 2, D.length - 1) >> 12) + 1 << 12;
                let S = new Ul(L);
                return _e = new DataView(S.buffer, 0, L), D.copy ? D.copy(S, 0, n, y) : S.set(D.slice(n, y)), E -= n, n = 0, Dn = S.length - 10, D = S;
            };
            let j = 100, N = 1e3;
            this.encodeAsIterable = function(y, L) {
                return se(y, L, F);
            }, this.encodeAsAsyncIterable = function(y, L) {
                return se(y, L, H);
            };
            function* F(y, L, S) {
                let I = y.constructor;
                if (I === Object) {
                    let k = l.useRecords !== !1;
                    k ? A(y, !0) : zh(Object.keys(y).length, 160);
                    for(let M in y){
                        let v = y[M];
                        k || g(M), v && typeof v == "object" ? L[M] ? yield* F(v, L[M]) : yield* J(v, L, M) : g(v);
                    }
                } else if (I === Array) {
                    let k = y.length;
                    sn(k);
                    for(let M = 0; M < k; M++){
                        let v = y[M];
                        v && (typeof v == "object" || E - n > j) ? L.element ? yield* F(v, L.element) : yield* J(v, L, "element") : g(v);
                    }
                } else if (y[Symbol.iterator]) {
                    D[E++] = 159;
                    for (let k of y)k && (typeof k == "object" || E - n > j) ? L.element ? yield* F(k, L.element) : yield* J(k, L, "element") : g(k);
                    D[E++] = 255;
                } else zl(y) ? (zh(y.size, 64), yield D.subarray(n, E), yield y, K()) : y[Symbol.asyncIterator] ? (D[E++] = 159, yield D.subarray(n, E), yield y, K(), D[E++] = 255) : g(y);
                S && E > n ? yield D.subarray(n, E) : E - n > j && (yield D.subarray(n, E), K());
            }
            function* J(y, L, S) {
                let I = E - n;
                try {
                    g(y), E - n > j && (yield D.subarray(n, E), K());
                } catch (k) {
                    if (k.iteratorNotHandled) L[S] = {}, E = n + I, yield* F.call(this, y, L[S]);
                    else throw k;
                }
            }
            function K() {
                j = N, l.encode(null, Hl);
            }
            function se(y, L, S) {
                return L && L.chunkThreshold ? j = N = L.chunkThreshold : j = 100, y && typeof y == "object" ? (l.encode(null, Hl), S(y, l.iterateProperties || (l.iterateProperties = {}), !0)) : [
                    l.encode(y)
                ];
            }
            async function* H(y, L) {
                for (let S of F(y, L, !0)){
                    let I = S.constructor;
                    if (I === Lh || I === Uint8Array) yield S;
                    else if (zl(S)) {
                        let k = S.stream().getReader(), M;
                        for(; !(M = await k.read()).done;)yield M.value;
                    } else if (S[Symbol.asyncIterator]) for await (let k of S)K(), k ? yield* H(k, L.async || (L.async = {})) : yield l.encode(k);
                    else yield S;
                }
            }
        }
        useBuffer(t) {
            D = t, _e = new DataView(D.buffer, D.byteOffset, D.byteLength), E = 0;
        }
        clearSharedData() {
            this.structures && (this.structures = []), this.sharedValues && (this.sharedValues = void 0);
        }
        updateSharedData() {
            let t = this.sharedVersion || 0;
            this.sharedVersion = t + 1;
            let n = this.structures.slice(0), r = new x_(n, this.sharedValues, this.sharedVersion), s = this.saveShared(r, (o)=>(o && o.version || 0) == t);
            return s === !1 ? (r = this.getShared() || {}, this.structures = r.structures || [], this.sharedValues = r.packedValues, this.sharedVersion = r.version, this.structures.nextId = this.structures.length) : n.forEach((o, i)=>this.structures[i] = o), s;
        }
    }
    function zh(e, t) {
        e < 24 ? D[E++] = t | e : e < 256 ? (D[E++] = t | 24, D[E++] = e) : e < 65536 ? (D[E++] = t | 25, D[E++] = e >> 8, D[E++] = e & 255) : (D[E++] = t | 26, _e.setUint32(E, e), E += 4);
    }
    class x_ {
        constructor(t, n, r){
            this.structures = t, this.packedValues = n, this.version = r;
        }
    }
    function sn(e) {
        e < 24 ? D[E++] = 128 | e : e < 256 ? (D[E++] = 152, D[E++] = e) : e < 65536 ? (D[E++] = 153, D[E++] = e >> 8, D[E++] = e & 255) : (D[E++] = 154, _e.setUint32(E, e), E += 4);
    }
    const b4 = typeof Blob > "u" ? function() {} : Blob;
    function zl(e) {
        if (e instanceof b4) return !0;
        let t = e[Symbol.toStringTag];
        return t === "Blob" || t === "File";
    }
    function ji(e, t) {
        switch(typeof e){
            case "string":
                if (e.length > 3) {
                    if (t.objectMap[e] > -1 || t.values.length >= t.maxValues) return;
                    let r = t.get(e);
                    if (r) ++r.count == 2 && t.values.push(e);
                    else if (t.set(e, {
                        count: 1
                    }), t.samplingPackedValues) {
                        let s = t.samplingPackedValues.get(e);
                        s ? s.count++ : t.samplingPackedValues.set(e, {
                            count: 1
                        });
                    }
                }
                break;
            case "object":
                if (e) if (e instanceof Array) for(let r = 0, s = e.length; r < s; r++)ji(e[r], t);
                else {
                    let r = !t.encoder.useRecords;
                    for(var n in e)e.hasOwnProperty(n) && (r && ji(n, t), ji(e[n], t));
                }
                break;
            case "function":
                console.log(e);
        }
    }
    const x4 = new Uint8Array(new Uint16Array([
        1
    ]).buffer)[0] == 1;
    b_ = [
        Date,
        Set,
        Error,
        RegExp,
        Ar,
        ArrayBuffer,
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        typeof BigUint64Array > "u" ? function() {} : BigUint64Array,
        Int8Array,
        Int16Array,
        Int32Array,
        typeof BigInt64Array > "u" ? function() {} : BigInt64Array,
        Float32Array,
        Float64Array,
        x_
    ];
    cc = [
        {
            tag: 1,
            encode (e, t) {
                let n = e.getTime() / 1e3;
                (this.useTimestamp32 || e.getMilliseconds() === 0) && n >= 0 && n < 4294967296 ? (D[E++] = 26, _e.setUint32(E, n), E += 4) : (D[E++] = 251, _e.setFloat64(E, n), E += 8);
            }
        },
        {
            tag: 258,
            encode (e, t) {
                let n = Array.from(e);
                t(n);
            }
        },
        {
            tag: 27,
            encode (e, t) {
                t([
                    e.name,
                    e.message
                ]);
            }
        },
        {
            tag: 27,
            encode (e, t) {
                t([
                    "RegExp",
                    e.source,
                    e.flags
                ]);
            }
        },
        {
            getTag (e) {
                return e.tag;
            },
            encode (e, t) {
                t(e.value);
            }
        },
        {
            encode (e, t, n) {
                Hh(e, n);
            }
        },
        {
            getTag (e) {
                if (e.constructor === Uint8Array && (this.tagUint8Array || No && this.tagUint8Array !== !1)) return 64;
            },
            encode (e, t, n) {
                Hh(e, n);
            }
        },
        tn(68, 1),
        tn(69, 2),
        tn(70, 4),
        tn(71, 8),
        tn(72, 1),
        tn(77, 2),
        tn(78, 4),
        tn(79, 8),
        tn(85, 4),
        tn(86, 8),
        {
            encode (e, t) {
                let n = e.packedValues || [], r = e.structures || [];
                if (n.values.length > 0) {
                    D[E++] = 216, D[E++] = 51, sn(4);
                    let s = n.values;
                    t(s), sn(0), sn(0), packedObjectMap = Object.create(sharedPackedObjectMap || null);
                    for(let o = 0, i = s.length; o < i; o++)packedObjectMap[s[o]] = o;
                }
                if (r) {
                    _e.setUint32(E, 3655335424), E += 3;
                    let s = r.slice(0);
                    s.unshift(57344), s.push(new Ar(e.version, 1399353956)), t(s);
                } else t(new Ar(e.version, 1399353956));
            }
        }
    ];
    function tn(e, t) {
        return !x4 && t > 1 && (e -= 4), {
            tag: e,
            encode: function(n, r) {
                let s = n.byteLength, o = n.byteOffset || 0, i = n.buffer || n;
                r(No ? Qa.from(i, o, s) : new Uint8Array(i, o, s));
            }
        };
    }
    function Hh(e, t) {
        let n = e.byteLength;
        n < 24 ? D[E++] = 64 + n : n < 256 ? (D[E++] = 88, D[E++] = n) : n < 65536 ? (D[E++] = 89, D[E++] = n >> 8, D[E++] = n & 255) : (D[E++] = 90, _e.setUint32(E, n), E += 4), E + n >= D.length && t(E + n), D.set(e.buffer ? e : new Uint8Array(e), E), E += n;
    }
    function S4(e, t) {
        let n, r = t.length * 2, s = e.length - r;
        t.sort((o, i)=>o.offset > i.offset ? 1 : -1);
        for(let o = 0; o < t.length; o++){
            let i = t[o];
            i.id = o;
            for (let a of i.references)e[a++] = o >> 8, e[a] = o & 255;
        }
        for(; n = t.pop();){
            let o = n.offset;
            e.copyWithin(o + r, o, s), r -= 2;
            let i = o + r;
            e[i++] = 216, e[i++] = 28, s = o;
        }
        return e;
    }
    function Nh(e, t) {
        _e.setUint32(Pe.position + e, E - Pe.position - e + 1);
        let n = Pe;
        Pe = null, t(n[0]), t(n[1]);
    }
    let Bf = new v4({
        useRecords: !1
    });
    Bf.encode;
    Bf.encodeAsIterable;
    Bf.encodeAsAsyncIterable;
    const Bh = 512, k4 = 1024, Hl = 2048;
    var C4 = {
        exports: {}
    };
    (function(e) {
        (function(t, n) {
            var r = {};
            n(r);
            var s = r.default;
            for(var o in r)s[o] = r[o];
            e.exports = s;
        })(HS, function(t) {
            t.__esModule = !0, t.digestLength = 32, t.blockSize = 64;
            var n = new Uint32Array([
                1116352408,
                1899447441,
                3049323471,
                3921009573,
                961987163,
                1508970993,
                2453635748,
                2870763221,
                3624381080,
                310598401,
                607225278,
                1426881987,
                1925078388,
                2162078206,
                2614888103,
                3248222580,
                3835390401,
                4022224774,
                264347078,
                604807628,
                770255983,
                1249150122,
                1555081692,
                1996064986,
                2554220882,
                2821834349,
                2952996808,
                3210313671,
                3336571891,
                3584528711,
                113926993,
                338241895,
                666307205,
                773529912,
                1294757372,
                1396182291,
                1695183700,
                1986661051,
                2177026350,
                2456956037,
                2730485921,
                2820302411,
                3259730800,
                3345764771,
                3516065817,
                3600352804,
                4094571909,
                275423344,
                430227734,
                506948616,
                659060556,
                883997877,
                958139571,
                1322822218,
                1537002063,
                1747873779,
                1955562222,
                2024104815,
                2227730452,
                2361852424,
                2428436474,
                2756734187,
                3204031479,
                3329325298
            ]);
            function r(h, d, p, m, x) {
                for(var w, _, g, A, P, j, N, F, J, K, se, H, y; x >= 64;){
                    for(w = d[0], _ = d[1], g = d[2], A = d[3], P = d[4], j = d[5], N = d[6], F = d[7], K = 0; K < 16; K++)se = m + K * 4, h[K] = (p[se] & 255) << 24 | (p[se + 1] & 255) << 16 | (p[se + 2] & 255) << 8 | p[se + 3] & 255;
                    for(K = 16; K < 64; K++)J = h[K - 2], H = (J >>> 17 | J << 15) ^ (J >>> 19 | J << 13) ^ J >>> 10, J = h[K - 15], y = (J >>> 7 | J << 25) ^ (J >>> 18 | J << 14) ^ J >>> 3, h[K] = (H + h[K - 7] | 0) + (y + h[K - 16] | 0);
                    for(K = 0; K < 64; K++)H = (((P >>> 6 | P << 26) ^ (P >>> 11 | P << 21) ^ (P >>> 25 | P << 7)) + (P & j ^ ~P & N) | 0) + (F + (n[K] + h[K] | 0) | 0) | 0, y = ((w >>> 2 | w << 30) ^ (w >>> 13 | w << 19) ^ (w >>> 22 | w << 10)) + (w & _ ^ w & g ^ _ & g) | 0, F = N, N = j, j = P, P = A + H | 0, A = g, g = _, _ = w, w = H + y | 0;
                    d[0] += w, d[1] += _, d[2] += g, d[3] += A, d[4] += P, d[5] += j, d[6] += N, d[7] += F, m += 64, x -= 64;
                }
                return m;
            }
            var s = function() {
                function h() {
                    this.digestLength = t.digestLength, this.blockSize = t.blockSize, this.state = new Int32Array(8), this.temp = new Int32Array(64), this.buffer = new Uint8Array(128), this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this.reset();
                }
                return h.prototype.reset = function() {
                    return this.state[0] = 1779033703, this.state[1] = 3144134277, this.state[2] = 1013904242, this.state[3] = 2773480762, this.state[4] = 1359893119, this.state[5] = 2600822924, this.state[6] = 528734635, this.state[7] = 1541459225, this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this;
                }, h.prototype.clean = function() {
                    for(var d = 0; d < this.buffer.length; d++)this.buffer[d] = 0;
                    for(var d = 0; d < this.temp.length; d++)this.temp[d] = 0;
                    this.reset();
                }, h.prototype.update = function(d, p) {
                    if (p === void 0 && (p = d.length), this.finished) throw new Error("SHA256: can't update because hash was finished.");
                    var m = 0;
                    if (this.bytesHashed += p, this.bufferLength > 0) {
                        for(; this.bufferLength < 64 && p > 0;)this.buffer[this.bufferLength++] = d[m++], p--;
                        this.bufferLength === 64 && (r(this.temp, this.state, this.buffer, 0, 64), this.bufferLength = 0);
                    }
                    for(p >= 64 && (m = r(this.temp, this.state, d, m, p), p %= 64); p > 0;)this.buffer[this.bufferLength++] = d[m++], p--;
                    return this;
                }, h.prototype.finish = function(d) {
                    if (!this.finished) {
                        var p = this.bytesHashed, m = this.bufferLength, x = p / 536870912 | 0, w = p << 3, _ = p % 64 < 56 ? 64 : 128;
                        this.buffer[m] = 128;
                        for(var g = m + 1; g < _ - 8; g++)this.buffer[g] = 0;
                        this.buffer[_ - 8] = x >>> 24 & 255, this.buffer[_ - 7] = x >>> 16 & 255, this.buffer[_ - 6] = x >>> 8 & 255, this.buffer[_ - 5] = x >>> 0 & 255, this.buffer[_ - 4] = w >>> 24 & 255, this.buffer[_ - 3] = w >>> 16 & 255, this.buffer[_ - 2] = w >>> 8 & 255, this.buffer[_ - 1] = w >>> 0 & 255, r(this.temp, this.state, this.buffer, 0, _), this.finished = !0;
                    }
                    for(var g = 0; g < 8; g++)d[g * 4 + 0] = this.state[g] >>> 24 & 255, d[g * 4 + 1] = this.state[g] >>> 16 & 255, d[g * 4 + 2] = this.state[g] >>> 8 & 255, d[g * 4 + 3] = this.state[g] >>> 0 & 255;
                    return this;
                }, h.prototype.digest = function() {
                    var d = new Uint8Array(this.digestLength);
                    return this.finish(d), d;
                }, h.prototype._saveState = function(d) {
                    for(var p = 0; p < this.state.length; p++)d[p] = this.state[p];
                }, h.prototype._restoreState = function(d, p) {
                    for(var m = 0; m < this.state.length; m++)this.state[m] = d[m];
                    this.bytesHashed = p, this.finished = !1, this.bufferLength = 0;
                }, h;
            }();
            t.Hash = s;
            var o = function() {
                function h(d) {
                    this.inner = new s, this.outer = new s, this.blockSize = this.inner.blockSize, this.digestLength = this.inner.digestLength;
                    var p = new Uint8Array(this.blockSize);
                    if (d.length > this.blockSize) new s().update(d).finish(p).clean();
                    else for(var m = 0; m < d.length; m++)p[m] = d[m];
                    for(var m = 0; m < p.length; m++)p[m] ^= 54;
                    this.inner.update(p);
                    for(var m = 0; m < p.length; m++)p[m] ^= 106;
                    this.outer.update(p), this.istate = new Uint32Array(8), this.ostate = new Uint32Array(8), this.inner._saveState(this.istate), this.outer._saveState(this.ostate);
                    for(var m = 0; m < p.length; m++)p[m] = 0;
                }
                return h.prototype.reset = function() {
                    return this.inner._restoreState(this.istate, this.inner.blockSize), this.outer._restoreState(this.ostate, this.outer.blockSize), this;
                }, h.prototype.clean = function() {
                    for(var d = 0; d < this.istate.length; d++)this.ostate[d] = this.istate[d] = 0;
                    this.inner.clean(), this.outer.clean();
                }, h.prototype.update = function(d) {
                    return this.inner.update(d), this;
                }, h.prototype.finish = function(d) {
                    return this.outer.finished ? this.outer.finish(d) : (this.inner.finish(d), this.outer.update(d, this.digestLength).finish(d)), this;
                }, h.prototype.digest = function() {
                    var d = new Uint8Array(this.digestLength);
                    return this.finish(d), d;
                }, h;
            }();
            t.HMAC = o;
            function i(h) {
                var d = new s().update(h), p = d.digest();
                return d.clean(), p;
            }
            t.hash = i, t.default = i;
            function a(h, d) {
                var p = new o(h).update(d), m = p.digest();
                return p.clean(), m;
            }
            t.hmac = a;
            function l(h, d, p, m) {
                var x = m[0];
                if (x === 0) throw new Error("hkdf: cannot expand more");
                d.reset(), x > 1 && d.update(h), p && d.update(p), d.update(m), d.finish(h), m[0]++;
            }
            var f = new Uint8Array(t.digestLength);
            function c(h, d, p, m) {
                d === void 0 && (d = f), m === void 0 && (m = 32);
                for(var x = new Uint8Array([
                    1
                ]), w = a(d, h), _ = new o(w), g = new Uint8Array(_.digestLength), A = g.length, P = new Uint8Array(m), j = 0; j < m; j++)A === g.length && (l(g, _, p, x), A = 0), P[j] = g[A++];
                return _.clean(), g.fill(0), x.fill(0), P;
            }
            t.hkdf = c;
            function u(h, d, p, m) {
                for(var x = new o(h), w = x.digestLength, _ = new Uint8Array(4), g = new Uint8Array(w), A = new Uint8Array(w), P = new Uint8Array(m), j = 0; j * w < m; j++){
                    var N = j + 1;
                    _[0] = N >>> 24 & 255, _[1] = N >>> 16 & 255, _[2] = N >>> 8 & 255, _[3] = N >>> 0 & 255, x.reset(), x.update(d), x.update(_), x.finish(A);
                    for(var F = 0; F < w; F++)g[F] = A[F];
                    for(var F = 2; F <= p; F++){
                        x.reset(), x.update(A).finish(A);
                        for(var J = 0; J < w; J++)g[J] ^= A[J];
                    }
                    for(var F = 0; F < w && j * w + F < m; F++)P[j * w + F] = g[F];
                }
                for(var j = 0; j < w; j++)g[j] = A[j] = 0;
                for(var j = 0; j < 4; j++)_[j] = 0;
                return x.clean(), P;
            }
            t.pbkdf2 = u;
        });
    })(C4);
    WS("automerge-repo:collectionsync");
    function E4(e) {
        const t = n_();
        return e ? t.find(e) : void 0;
    }
    new GS;
    class I4 extends m3 {
        #t;
        #e;
        constructor(t){
            super(), this.#e = {
                channelName: "broadcast",
                ...t ?? {}
            }, this.#t = new BroadcastChannel(this.#e.channelName);
        }
        connect(t, n) {
            this.peerId = t, this.peerMetadata = n, this.#t.addEventListener("message", (r)=>{
                const s = r.data;
                if ("targetId" in s && s.targetId !== this.peerId) return;
                const { senderId: o, type: i } = s;
                switch(i){
                    case "arrive":
                        {
                            const { peerMetadata: a } = s;
                            this.#t.postMessage({
                                senderId: this.peerId,
                                targetId: o,
                                type: "welcome",
                                peerMetadata: this.peerMetadata
                            }), this.#r(o, a);
                        }
                        break;
                    case "welcome":
                        {
                            const { peerMetadata: a } = s;
                            this.#r(o, a);
                        }
                        break;
                    default:
                        if (!("data" in s)) this.emit("message", s);
                        else {
                            const a = s.data;
                            this.emit("message", {
                                ...s,
                                data: new Uint8Array(a)
                            });
                        }
                        break;
                }
            }), this.#t.postMessage({
                senderId: this.peerId,
                type: "arrive",
                peerMetadata: n
            }), this.emit("ready", {
                network: this
            });
        }
        #r(t, n) {
            this.emit("peer-candidate", {
                peerId: t,
                peerMetadata: n
            });
        }
        send(t) {
            "data" in t ? this.#t.postMessage({
                ...t,
                data: t.data ? t.data.buffer.slice(t.data.byteOffset, t.data.byteOffset + t.data.byteLength) : void 0
            }) : this.#t.postMessage(t);
        }
        disconnect() {
            throw new Error("Unimplemented: leave on BroadcastChannelNetworkAdapter");
        }
    }
    class A4 {
        database;
        store;
        dbPromise;
        constructor(t = "automerge", n = "documents"){
            this.database = t, this.store = n, this.dbPromise = this.createDatabasePromise();
        }
        createDatabasePromise() {
            return new Promise((t, n)=>{
                const r = indexedDB.open(this.database, 1);
                r.onerror = ()=>{
                    n(r.error);
                }, r.onupgradeneeded = (s)=>{
                    s.target.result.createObjectStore(this.store);
                }, r.onsuccess = (s)=>{
                    const o = s.target.result;
                    t(o);
                };
            });
        }
        async load(t) {
            const r = (await this.dbPromise).transaction(this.store), o = r.objectStore(this.store).get(t);
            return new Promise((i, a)=>{
                r.onerror = ()=>{
                    a(o.error);
                }, o.onsuccess = (l)=>{
                    const f = l.target.result;
                    f && typeof f == "object" && "binary" in f ? i(f.binary) : i(void 0);
                };
            });
        }
        async save(t, n) {
            const s = (await this.dbPromise).transaction(this.store, "readwrite");
            return s.objectStore(this.store).put({
                key: t,
                binary: n
            }, t), new Promise((i, a)=>{
                s.onerror = ()=>{
                    a(s.error);
                }, s.oncomplete = ()=>{
                    i();
                };
            });
        }
        async remove(t) {
            const r = (await this.dbPromise).transaction(this.store, "readwrite");
            return r.objectStore(this.store).delete(t), new Promise((o, i)=>{
                r.onerror = ()=>{
                    i(r.error);
                }, r.oncomplete = ()=>{
                    o();
                };
            });
        }
        async loadRange(t) {
            const n = await this.dbPromise, r = t, s = [
                ...t,
                "￿"
            ], o = IDBKeyRange.bound(r, s), i = n.transaction(this.store), l = i.objectStore(this.store).openCursor(o), f = [];
            return new Promise((c, u)=>{
                i.onerror = ()=>{
                    u(l.error);
                }, l.onsuccess = (h)=>{
                    const d = h.target.result;
                    d ? (f.push({
                        data: d.value.binary,
                        key: d.key
                    }), d.continue()) : c(f);
                };
            });
        }
        async removeRange(t) {
            const n = await this.dbPromise, r = t, s = [
                ...t,
                "￿"
            ], o = IDBKeyRange.bound(r, s), i = n.transaction(this.store, "readwrite");
            return i.objectStore(this.store).delete(o), new Promise((l, f)=>{
                i.onerror = ()=>{
                    f(i.error);
                }, i.oncomplete = ()=>{
                    l();
                };
            });
        }
    }
    function O4({ docUrl: e }) {
        const t = CS(e), n = E4(e), [r] = Lt.useState("friday"), [s, o] = Lt.useState([]), [i, a] = Lt.useState(!0);
        Lt.useEffect(()=>{
            (async ()=>{
                try {
                    console.log("Fetching tasks from backend API...");
                    const h = await fetch("http://localhost:8003/beans");
                    if (h.ok) {
                        const d = await h.json();
                        console.log("Backend tasks fetched:", d.length), o(d), n && t && l(n, d);
                    } else console.error("Failed to fetch backend tasks:", h.status);
                } catch (h) {
                    console.error("Error fetching backend tasks:", h);
                } finally{
                    a(!1);
                }
            })();
        }, []);
        const l = (u, h)=>{
            u.change((d)=>{
                d.name = "Mission Control - Production (Live Data)", d.agents = {
                    gary: {
                        name: "gary",
                        role: "Lead",
                        status: "active",
                        color: "#ff6b6b"
                    },
                    friday: {
                        name: "friday",
                        role: "Developer",
                        status: "active",
                        color: "#4ecdc4"
                    },
                    writer: {
                        name: "writer",
                        role: "Writer",
                        status: "active",
                        color: "#45b7d1"
                    }
                }, d.tasks = {}, h.forEach((p, m)=>{
                    const w = {
                        todo: 0,
                        "in-progress": 1,
                        completed: 2
                    }[p.status] || 0, g = h.filter((j)=>j.status === p.status).findIndex((j)=>j.id === p.id), A = 50 + w * 350, P = 100 + g * 160;
                    d.tasks[p.id] = {
                        id: p.id,
                        title: p.title,
                        status: p.status,
                        assignee: null,
                        type: p.type || "task",
                        description: p.slug || "",
                        x: A,
                        y: P,
                        width: 280,
                        height: 140,
                        priority: p.priority || "normal",
                        created_at: p.created_at,
                        updated_at: p.updated_at
                    };
                }), d.activity = [], d.comments = {}, d.backend_sync = new Date().toISOString();
            });
        };
        if (i) return ee.jsx("div", {
            style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#1a1a1a",
                color: "white"
            },
            children: ee.jsxs("div", {
                style: {
                    textAlign: "center"
                },
                children: [
                    ee.jsx("h2", {
                        children: "🚀 Loading Mission Control..."
                    }),
                    ee.jsx("p", {
                        children: "Connecting to backend API (localhost:8003/beans)"
                    }),
                    ee.jsxs("div", {
                        style: {
                            marginTop: 20,
                            fontSize: 14,
                            color: "#4ecdc4"
                        },
                        children: [
                            "Fetching ",
                            s.length > 0 ? `${s.length} tasks...` : "task data..."
                        ]
                    })
                ]
            })
        });
        if (!t) return ee.jsx("div", {
            style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#1a1a1a",
                color: "white"
            },
            children: ee.jsxs("div", {
                children: [
                    ee.jsx("h2", {
                        children: "⚡ Initializing Automerge..."
                    }),
                    ee.jsx("p", {
                        children: "Setting up real-time collaboration"
                    })
                ]
            })
        });
        const f = Object.values(t.tasks || {}), c = Object.values(t.agents || {});
        return console.log("Rendering with doc tasks:", f.length), console.log("Backend tasks available:", s.length), ee.jsxs("div", {
            style: {
                width: "100vw",
                height: "100vh",
                background: "#1a1a1a"
            },
            children: [
                ee.jsxs("div", {
                    className: "mission-control-header",
                    children: [
                        ee.jsx("div", {
                            className: "mission-control-logo",
                            children: "🎯 Mission Control"
                        }),
                        ee.jsxs("div", {
                            style: {
                                marginLeft: 20,
                                fontSize: 12,
                                color: "#888"
                            },
                            children: [
                                "Backend: ",
                                s.length,
                                " tasks • Document: ",
                                e.slice(-8),
                                "... • Agent: ",
                                r
                            ]
                        }),
                        ee.jsxs("div", {
                            className: "mission-control-stats",
                            children: [
                                ee.jsxs("div", {
                                    className: "stat",
                                    children: [
                                        "📋 ",
                                        f.length,
                                        " total"
                                    ]
                                }),
                                ee.jsxs("div", {
                                    className: "stat",
                                    children: [
                                        "👥 ",
                                        c.length,
                                        " agents"
                                    ]
                                }),
                                ee.jsxs("div", {
                                    className: "stat",
                                    children: [
                                        "⏳ ",
                                        f.filter((u)=>u.status === "todo").length,
                                        " todo"
                                    ]
                                }),
                                ee.jsxs("div", {
                                    className: "stat",
                                    children: [
                                        "🔄 ",
                                        f.filter((u)=>u.status === "in-progress").length,
                                        " active"
                                    ]
                                }),
                                ee.jsxs("div", {
                                    className: "stat",
                                    children: [
                                        "✅ ",
                                        f.filter((u)=>u.status === "completed").length,
                                        " done"
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                ee.jsxs("div", {
                    style: {
                        position: "absolute",
                        top: 60,
                        right: 20,
                        background: "rgba(0, 255, 136, 0.1)",
                        border: "1px solid #00ff88",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        color: "#00ff88"
                    },
                    children: [
                        "🔗 Backend API Connected (",
                        s.length,
                        " tasks)"
                    ]
                }),
                ee.jsx("div", {
                    className: "agent-presence",
                    children: c.map((u)=>ee.jsxs("div", {
                            className: `agent-badge agent-${u.name}`,
                            style: {
                                borderColor: u.color
                            },
                            children: [
                                u.name,
                                " (",
                                u.role,
                                ")"
                            ]
                        }, u.name))
                }),
                ee.jsx("div", {
                    className: "canvas-container",
                    children: ee.jsx(T4, {
                        doc: t,
                        handle: n,
                        currentAgent: r
                    })
                })
            ]
        });
    }
    function T4({ doc: e, handle: t, currentAgent: n }) {
        const r = Object.values(e.tasks || {});
        console.log("TaskCanvas rendering tasks:", r.length);
        const s = ({ task: i, onUpdate: a })=>{
            const l = {
                todo: "#ffd93d",
                "in-progress": "#4ecdc4",
                completed: "#00ff88"
            }[i.status] || "#666", f = e.agents?.[i.assignee]?.color || "#666";
            return ee.jsxs("div", {
                style: {
                    position: "absolute",
                    left: i.x,
                    top: i.y,
                    width: i.width,
                    height: i.height,
                    background: "rgba(0, 0, 0, 0.9)",
                    border: `2px solid ${l}`,
                    borderRadius: 8,
                    padding: 12,
                    cursor: "move",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontSize: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                },
                onMouseDown: (c)=>{
                    const u = c.clientX - i.x, h = c.clientY - i.y, d = (m)=>{
                        const x = m.clientX - u, w = m.clientY - h;
                        a(i.id, {
                            x,
                            y: w
                        });
                    }, p = ()=>{
                        document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", p);
                    };
                    document.addEventListener("mousemove", d), document.addEventListener("mouseup", p);
                },
                children: [
                    ee.jsx("div", {
                        style: {
                            fontWeight: 600,
                            marginBottom: 6,
                            fontSize: 13,
                            lineHeight: 1.2,
                            color: l
                        },
                        children: i.title
                    }),
                    ee.jsxs("div", {
                        style: {
                            fontSize: 10,
                            color: "#aaa",
                            marginBottom: 4
                        },
                        children: [
                            i.type,
                            " • ",
                            i.id
                        ]
                    }),
                    ee.jsx("div", {
                        style: {
                            fontSize: 10,
                            color: "#bbb",
                            marginBottom: 6,
                            lineHeight: 1.3,
                            maxHeight: 40,
                            overflow: "hidden"
                        },
                        children: i.description
                    }),
                    ee.jsx("div", {
                        style: {
                            fontSize: 10,
                            color: l,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            marginBottom: 4
                        },
                        children: i.status
                    }),
                    i.assignee && ee.jsxs("div", {
                        style: {
                            fontSize: 10,
                            color: f,
                            fontWeight: 500
                        },
                        children: [
                            "@",
                            i.assignee
                        ]
                    }),
                    ee.jsx("div", {
                        style: {
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: l,
                            boxShadow: `0 0 6px ${l}`
                        }
                    }),
                    i.priority && i.priority !== "normal" && ee.jsx("div", {
                        style: {
                            position: "absolute",
                            top: 6,
                            left: 6,
                            fontSize: 8,
                            color: i.priority === "high" ? "#ff4757" : "#ffa502",
                            fontWeight: 600
                        },
                        children: i.priority.toUpperCase()
                    })
                ]
            });
        }, o = (i, a)=>{
            t.change((l)=>{
                l.tasks[i] && (Object.assign(l.tasks[i], a), l.activity || (l.activity = []), l.activity.push({
                    id: Math.random().toString(16).slice(2),
                    type: "task_moved",
                    agent: n,
                    taskId: i,
                    changes: a,
                    timestamp: new Date().toISOString()
                }));
            });
        };
        return ee.jsxs("div", {
            style: {
                position: "relative",
                width: "100%",
                height: "100%",
                background: "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
            },
            children: [
                ee.jsxs("div", {
                    style: {
                        position: "absolute",
                        top: 20,
                        left: 0,
                        right: 0,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 20,
                        padding: "0 50px",
                        pointerEvents: "none",
                        zIndex: 1
                    },
                    children: [
                        ee.jsxs("div", {
                            style: {
                                textAlign: "center"
                            },
                            children: [
                                ee.jsx("div", {
                                    style: {
                                        color: "#ffd93d",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        marginBottom: 4
                                    },
                                    children: "📋 TODO"
                                }),
                                ee.jsxs("div", {
                                    style: {
                                        color: "#666",
                                        fontSize: 12
                                    },
                                    children: [
                                        r.filter((i)=>i.status === "todo").length,
                                        " tasks"
                                    ]
                                })
                            ]
                        }),
                        ee.jsxs("div", {
                            style: {
                                textAlign: "center"
                            },
                            children: [
                                ee.jsx("div", {
                                    style: {
                                        color: "#4ecdc4",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        marginBottom: 4
                                    },
                                    children: "🔄 IN PROGRESS"
                                }),
                                ee.jsxs("div", {
                                    style: {
                                        color: "#666",
                                        fontSize: 12
                                    },
                                    children: [
                                        r.filter((i)=>i.status === "in-progress").length,
                                        " tasks"
                                    ]
                                })
                            ]
                        }),
                        ee.jsxs("div", {
                            style: {
                                textAlign: "center"
                            },
                            children: [
                                ee.jsx("div", {
                                    style: {
                                        color: "#00ff88",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        marginBottom: 4
                                    },
                                    children: "✅ COMPLETED"
                                }),
                                ee.jsxs("div", {
                                    style: {
                                        color: "#666",
                                        fontSize: 12
                                    },
                                    children: [
                                        r.filter((i)=>i.status === "completed").length,
                                        " tasks"
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                ee.jsx("div", {
                    style: {
                        position: "absolute",
                        top: 60,
                        left: 50,
                        width: "calc(33% - 20px)",
                        height: "calc(100vh - 120px)",
                        background: "rgba(255, 217, 61, 0.03)",
                        border: "1px dashed rgba(255, 217, 61, 0.2)",
                        borderRadius: 8,
                        pointerEvents: "none"
                    }
                }),
                ee.jsx("div", {
                    style: {
                        position: "absolute",
                        top: 60,
                        left: "calc(33% + 30px)",
                        width: "calc(33% - 20px)",
                        height: "calc(100vh - 120px)",
                        background: "rgba(78, 205, 196, 0.03)",
                        border: "1px dashed rgba(78, 205, 196, 0.2)",
                        borderRadius: 8,
                        pointerEvents: "none"
                    }
                }),
                ee.jsx("div", {
                    style: {
                        position: "absolute",
                        top: 60,
                        right: 50,
                        width: "calc(33% - 20px)",
                        height: "calc(100vh - 120px)",
                        background: "rgba(0, 255, 136, 0.03)",
                        border: "1px dashed rgba(0, 255, 136, 0.2)",
                        borderRadius: 8,
                        pointerEvents: "none"
                    }
                }),
                r.map((i)=>ee.jsx(s, {
                        task: i,
                        onUpdate: o
                    }, i.id)),
                ee.jsxs("div", {
                    style: {
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        background: "rgba(0, 0, 0, 0.8)",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #00ff88",
                        color: "#00ff88",
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    },
                    children: [
                        ee.jsx("div", {
                            style: {
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#00ff88",
                                animation: "pulse 1s infinite"
                            }
                        }),
                        "Backend + Real-time Sync"
                    ]
                }),
                ee.jsx("style", {
                    children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `
                })
            ]
        });
    }
    const S_ = new y3({
        network: [
            new I4
        ],
        storage: new A4
    });
    console.log("🚀 Mission Control: Creating document for backend sync...");
    let k_ = S_.create();
    console.log("📋 Document URL:", k_.url);
    console.log("🔗 Will fetch tasks from localhost:8003/beans");
    Nl.createRoot(document.getElementById("root")).render(ee.jsx(t_.Provider, {
        value: S_,
        children: ee.jsx(O4, {
            docUrl: k_.url
        })
    }));
})();

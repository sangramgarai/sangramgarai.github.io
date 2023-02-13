function F(e,t){for(var o=0;o<t.length;o++){const r=t[o];if(typeof r!="string"&&!Array.isArray(r)){for(const n in r)if(n!=="default"&&!(n in e)){const i=Object.getOwnPropertyDescriptor(r,n);i&&Object.defineProperty(e,n,i.get?i:{enumerable:!0,get:()=>r[n]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var ce=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function N(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function se(e){if(e.__esModule)return e;var t=e.default;if(typeof t=="function"){var o=function r(){if(this instanceof r){var n=[null];n.push.apply(n,arguments);var i=Function.bind.apply(t,n);return new i}return t.apply(this,arguments)};o.prototype=t.prototype}else o={};return Object.defineProperty(o,"__esModule",{value:!0}),Object.keys(e).forEach(function(r){var n=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(o,r,n.get?n:{enumerable:!0,get:function(){return e[r]}})}),o}var O={},L={get exports(){return O},set exports(e){O=e}},h={},y={},M={get exports(){return y},set exports(e){y=e}},u={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d=Symbol.for("react.element"),U=Symbol.for("react.portal"),V=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),z=Symbol.for("react.profiler"),B=Symbol.for("react.provider"),H=Symbol.for("react.context"),W=Symbol.for("react.forward_ref"),G=Symbol.for("react.suspense"),J=Symbol.for("react.memo"),Y=Symbol.for("react.lazy"),R=Symbol.iterator;function K(e){return e===null||typeof e!="object"?null:(e=R&&e[R]||e["@@iterator"],typeof e=="function"?e:null)}var k={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},P=Object.assign,x={};function p(e,t,o){this.props=e,this.context=t,this.refs=x,this.updater=o||k}p.prototype.isReactComponent={};p.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};p.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function C(){}C.prototype=p.prototype;function S(e,t,o){this.props=e,this.context=t,this.refs=x,this.updater=o||k}var g=S.prototype=new C;g.constructor=S;P(g,p.prototype);g.isPureReactComponent=!0;var j=Array.isArray,I=Object.prototype.hasOwnProperty,w={current:null},T={key:!0,ref:!0,__self:!0,__source:!0};function D(e,t,o){var r,n={},i=null,f=null;if(t!=null)for(r in t.ref!==void 0&&(f=t.ref),t.key!==void 0&&(i=""+t.key),t)I.call(t,r)&&!T.hasOwnProperty(r)&&(n[r]=t[r]);var s=arguments.length-2;if(s===1)n.children=o;else if(1<s){for(var c=Array(s),a=0;a<s;a++)c[a]=arguments[a+2];n.children=c}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)n[r]===void 0&&(n[r]=s[r]);return{$$typeof:d,type:e,key:i,ref:f,props:n,_owner:w.current}}function Q(e,t){return{$$typeof:d,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function E(e){return typeof e=="object"&&e!==null&&e.$$typeof===d}function X(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(o){return t[o]})}var $=/\/+/g;function b(e,t){return typeof e=="object"&&e!==null&&e.key!=null?X(""+e.key):t.toString(36)}function v(e,t,o,r,n){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var f=!1;if(e===null)f=!0;else switch(i){case"string":case"number":f=!0;break;case"object":switch(e.$$typeof){case d:case U:f=!0}}if(f)return f=e,n=n(f),e=r===""?"."+b(f,0):r,j(n)?(o="",e!=null&&(o=e.replace($,"$&/")+"/"),v(n,t,o,"",function(a){return a})):n!=null&&(E(n)&&(n=Q(n,o+(!n.key||f&&f.key===n.key?"":(""+n.key).replace($,"$&/")+"/")+e)),t.push(n)),1;if(f=0,r=r===""?".":r+":",j(e))for(var s=0;s<e.length;s++){i=e[s];var c=r+b(i,s);f+=v(i,t,o,c,n)}else if(c=K(e),typeof c=="function")for(e=c.call(e),s=0;!(i=e.next()).done;)i=i.value,c=r+b(i,s++),f+=v(i,t,o,c,n);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return f}function _(e,t,o){if(e==null)return e;var r=[],n=0;return v(e,r,"","",function(i){return t.call(o,i,n++)}),r}function Z(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(o){(e._status===0||e._status===-1)&&(e._status=1,e._result=o)},function(o){(e._status===0||e._status===-1)&&(e._status=2,e._result=o)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var l={current:null},m={transition:null},ee={ReactCurrentDispatcher:l,ReactCurrentBatchConfig:m,ReactCurrentOwner:w};u.Children={map:_,forEach:function(e,t,o){_(e,function(){t.apply(this,arguments)},o)},count:function(e){var t=0;return _(e,function(){t++}),t},toArray:function(e){return _(e,function(t){return t})||[]},only:function(e){if(!E(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};u.Component=p;u.Fragment=V;u.Profiler=z;u.PureComponent=S;u.StrictMode=q;u.Suspense=G;u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ee;u.cloneElement=function(e,t,o){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=P({},e.props),n=e.key,i=e.ref,f=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,f=w.current),t.key!==void 0&&(n=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(c in t)I.call(t,c)&&!T.hasOwnProperty(c)&&(r[c]=t[c]===void 0&&s!==void 0?s[c]:t[c])}var c=arguments.length-2;if(c===1)r.children=o;else if(1<c){s=Array(c);for(var a=0;a<c;a++)s[a]=arguments[a+2];r.children=s}return{$$typeof:d,type:e.type,key:n,ref:i,props:r,_owner:f}};u.createContext=function(e){return e={$$typeof:H,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:B,_context:e},e.Consumer=e};u.createElement=D;u.createFactory=function(e){var t=D.bind(null,e);return t.type=e,t};u.createRef=function(){return{current:null}};u.forwardRef=function(e){return{$$typeof:W,render:e}};u.isValidElement=E;u.lazy=function(e){return{$$typeof:Y,_payload:{_status:-1,_result:e},_init:Z}};u.memo=function(e,t){return{$$typeof:J,type:e,compare:t===void 0?null:t}};u.startTransition=function(e){var t=m.transition;m.transition={};try{e()}finally{m.transition=t}};u.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.")};u.useCallback=function(e,t){return l.current.useCallback(e,t)};u.useContext=function(e){return l.current.useContext(e)};u.useDebugValue=function(){};u.useDeferredValue=function(e){return l.current.useDeferredValue(e)};u.useEffect=function(e,t){return l.current.useEffect(e,t)};u.useId=function(){return l.current.useId()};u.useImperativeHandle=function(e,t,o){return l.current.useImperativeHandle(e,t,o)};u.useInsertionEffect=function(e,t){return l.current.useInsertionEffect(e,t)};u.useLayoutEffect=function(e,t){return l.current.useLayoutEffect(e,t)};u.useMemo=function(e,t){return l.current.useMemo(e,t)};u.useReducer=function(e,t,o){return l.current.useReducer(e,t,o)};u.useRef=function(e){return l.current.useRef(e)};u.useState=function(e){return l.current.useState(e)};u.useSyncExternalStore=function(e,t,o){return l.current.useSyncExternalStore(e,t,o)};u.useTransition=function(){return l.current.useTransition()};u.version="18.2.0";(function(e){e.exports=u})(M);const te=N(y),le=F({__proto__:null,default:te},[y]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var re=y,ne=Symbol.for("react.element"),oe=Symbol.for("react.fragment"),ue=Object.prototype.hasOwnProperty,ie=re.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,fe={key:!0,ref:!0,__self:!0,__source:!0};function A(e,t,o){var r,n={},i=null,f=null;o!==void 0&&(i=""+o),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(f=t.ref);for(r in t)ue.call(t,r)&&!fe.hasOwnProperty(r)&&(n[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)n[r]===void 0&&(n[r]=t[r]);return{$$typeof:ne,type:e,key:i,ref:f,props:n,_owner:ie.current}}h.Fragment=oe;h.jsx=A;h.jsxs=A;(function(e){e.exports=h})(L);export{te as R,le as a,se as b,ce as c,N as g,O as j,y as r};
!function(e,t,n,r,i){var o="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},u="function"==typeof o.parcelRequireb5bc&&o.parcelRequireb5bc,a=u.cache||{},d="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function f(t,n){if(!a[t]){if(!e[t]){var r="function"==typeof o.parcelRequireb5bc&&o.parcelRequireb5bc;if(!n&&r)return r(t,!0);if(u)return u(t,!0);if(d&&"string"==typeof t)return d(t);var i=new Error("Cannot find module '"+t+"'");throw i.code="MODULE_NOT_FOUND",i}l.resolve=function(n){return e[t][1][n]||n},l.cache={};var c=a[t]=new f.Module(t);e[t][0].call(c.exports,l,c,c.exports,this)}return a[t].exports;function l(e){return f(l.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=a,f.parent=u,f.register=function(t,n){e[t]=[function(e,t){t.exports=n},{}]},Object.defineProperty(f,"root",{get:function(){return o.parcelRequireb5bc}}),o.parcelRequireb5bc=f;for(var c=0;c<t.length;c++)f(t[c]);var l=f(n);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd&&define((function(){return l}))}({"5H6aj":[function(e,t,n){var r,i;r=window,i=function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.WebLinksAddon=void 0;var r=n(1),i=new RegExp("(?:^|[^\\da-z\\.-]+)((https?:\\/\\/)((([\\da-z\\.-]+)\\.([a-z\\.]{2,6}))|((\\d{1,3}\\.){3}\\d{1,3})|(localhost))(:\\d{1,5})?((\\/[\\/\\w\\.\\-%~:+@]*)*([^:\"'\\s]))?(\\?[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*)?(#[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&'*+,:;~\\=\\.\\-]*)?)($|[^\\/\\w\\.\\-%]+)");function o(e,t){var n=window.open();n?(n.opener=null,n.location.href=t):console.warn("Opening link blocked as opener could not be cleared")}var u=function(){function e(e,t,n){void 0===e&&(e=o),void 0===t&&(t={}),void 0===n&&(n=!1),this._handler=e,this._options=t,this._useLinkProvider=n,this._options.matchIndex=1}return e.prototype.activate=function(e){this._terminal=e,this._useLinkProvider&&"registerLinkProvider"in this._terminal?this._linkProvider=this._terminal.registerLinkProvider(new r.WebLinkProvider(this._terminal,i,this._handler)):this._linkMatcherId=this._terminal.registerLinkMatcher(i,this._handler,this._options)},e.prototype.dispose=function(){var e;void 0!==this._linkMatcherId&&void 0!==this._terminal&&this._terminal.deregisterLinkMatcher(this._linkMatcherId),null===(e=this._linkProvider)||void 0===e||e.dispose()},e}();t.WebLinksAddon=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.LinkComputer=t.WebLinkProvider=void 0;var r=function(){function e(e,t,n){this._terminal=e,this._regex=t,this._handler=n}return e.prototype.provideLinks=function(e,t){t(i.computeLink(e,this._regex,this._terminal,this._handler))},e}();t.WebLinkProvider=r;var i=function(){function e(){}return e.computeLink=function(t,n,r,i){for(var o,u=new RegExp(n.source,(n.flags||"")+"g"),a=e._translateBufferLineToStringWithWrap(t-1,!1,r),d=a[0],f=a[1],c=-1,l=[];null!==(o=u.exec(d));){var s=o[1];if(!s){console.log("match found without corresponding matchIndex");break}if(c=d.indexOf(s,c+1),u.lastIndex=c+s.length,c<0)break;for(var p=c+s.length,h=f+1;p>r.cols;)p-=r.cols,h++;var b={start:{x:c+1,y:f+1},end:{x:p,y:h}};l.push({range:b,text:s,activate:i})}return l},e._translateBufferLineToStringWithWrap=function(e,t,n){var r,i,o="";do{if(!(a=n.buffer.active.getLine(e)))break;a.isWrapped&&e--,i=a.isWrapped}while(i);var u=e;do{var a,d=n.buffer.active.getLine(e+1);if(r=!!d&&d.isWrapped,!(a=n.buffer.active.getLine(e)))break;o+=a.translateToString(!r&&t).substring(0,n.cols),e++}while(r);return[o,u]},e}();t.LinkComputer=i}])},"object"==typeof n&&"object"==typeof t?t.exports=i():"function"==typeof define&&define.amd?define([],i):"object"==typeof n?n.WebLinksAddon=i():r.WebLinksAddon=i()},{}]},["5H6aj"],"5H6aj");
//# sourceMappingURL=xterm-addon-web-links.a90bb254.js.map

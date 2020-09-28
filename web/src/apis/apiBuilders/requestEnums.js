"use strict";
exports.__esModule = true;
exports.validServicesToCall = exports.commonHeaderNames = exports.headerDataTypes = exports.METHODS = void 0;
var METHODS;
(function (METHODS) {
    METHODS["GET"] = "GET";
    METHODS["POST"] = "POST";
    METHODS["PUT"] = "PUT";
    METHODS["DELETE"] = "DELETE";
})(METHODS = exports.METHODS || (exports.METHODS = {}));
var headerDataTypes;
(function (headerDataTypes) {
    headerDataTypes["JSON"] = "application/json";
    headerDataTypes["TEXT"] = "text/plain";
})(headerDataTypes = exports.headerDataTypes || (exports.headerDataTypes = {}));
var commonHeaderNames;
(function (commonHeaderNames) {
    commonHeaderNames["CONTENT_TYPE"] = "Content-Type";
    commonHeaderNames["ACCEPT"] = "Accept";
    commonHeaderNames["PRIV_TOKEN"] = "PRIVATE-TOKEN";
    commonHeaderNames["OAUTH_TOKEN"] = "Authorization";
})(commonHeaderNames = exports.commonHeaderNames || (exports.commonHeaderNames = {}));
var validServicesToCall;
(function (validServicesToCall) {
    validServicesToCall["BACKEND"] = "backend";
    validServicesToCall["GITLAB"] = "gitlab";
})(validServicesToCall = exports.validServicesToCall || (exports.validServicesToCall = {}));

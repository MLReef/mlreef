"use strict";
exports.__esModule = true;
// import store from '../store';
var requestEnums_1 = require("./apiBuilders/requestEnums");
var store = { getState: function () { return ({ user: { access_token: "", auth: true } }); } };
var ApiDirector = /** @class */ (function () {
    function ApiDirector() {
        var _this = this;
        this.resolveTokenName = function (serviceToCall) {
            switch (serviceToCall) {
                case requestEnums_1.validServicesToCall.BACKEND:
                    return requestEnums_1.commonHeaderNames.PRIV_TOKEN;
                case requestEnums_1.validServicesToCall.GITLAB:
                    return requestEnums_1.commonHeaderNames.OAUTH_TOKEN;
                default:
                    throw new Error("No valid service requested");
            }
        };
        this.buildBasicHeaders = function (serviceToCall) {
            var headers = _this.buildAnonHeaders();
            if (_this.getAuth()) {
                return headers.set(_this.resolveTokenName(serviceToCall), _this.getCurrentToken());
            }
            return headers;
        };
    }
    ApiDirector.prototype.getCurrentToken = function () {
        var user = store.getState().user;
        return user && "Bearer " + user.access_token;
    };
    ApiDirector.prototype.getAuth = function () {
        var user = store.getState().user;
        return !!(user === null || user === void 0 ? void 0 : user.auth);
    };
    ApiDirector.prototype.buildAnonHeaders = function () {
        var contentHeaders = new Map();
        contentHeaders.set(requestEnums_1.commonHeaderNames.CONTENT_TYPE, requestEnums_1.headerDataTypes.JSON);
        contentHeaders.set(requestEnums_1.commonHeaderNames.ACCEPT, requestEnums_1.headerDataTypes.JSON);
        return contentHeaders;
    };
    ;
    return ApiDirector;
}());
exports["default"] = ApiDirector;

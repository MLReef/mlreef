"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var BasicImplFunctions_1 = require("./BasicImplFunctions");
var BodyLessApiRequestCallBuilder = /** @class */ (function (_super) {
    __extends(BodyLessApiRequestCallBuilder, _super);
    function BodyLessApiRequestCallBuilder(method, headers, url) {
        var _this = _super.call(this) || this;
        _this.urlParams = new Map();
        _this.buildUrlWithParams = function () { return Array.from(_this.urlParams.keys())
            .forEach(function (key, indexKey) {
            var value = _this.urlParams.get(key);
            var urlKey = indexKey === 0 ? '?' : '&';
            _this.url = "" + _this.url + urlKey + key + "=" + value;
        }); };
        _this.method = method;
        _this.headers = headers;
        _this.url = url;
        return _this;
    }
    BodyLessApiRequestCallBuilder.prototype.setUrlParams = function (urlParams) {
        this.urlParams = urlParams;
    };
    BodyLessApiRequestCallBuilder.prototype.build = function () {
        return new Request(this.url, {
            method: this.method,
            headers: new Headers(this.parseMapsToJson(this.headers))
        });
    };
    return BodyLessApiRequestCallBuilder;
}(BasicImplFunctions_1["default"]));
exports["default"] = BodyLessApiRequestCallBuilder;

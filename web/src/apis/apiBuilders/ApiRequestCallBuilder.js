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
var ApiRequestCallBuilder = /** @class */ (function (_super) {
    __extends(ApiRequestCallBuilder, _super);
    function ApiRequestCallBuilder(method, headers, url, body) {
        var _this = _super.call(this) || this;
        _this.build = function () { return new Request(_this.url, {
            method: _this.method,
            headers: new Headers(_this.parseMapsToJson(_this.headers)),
            body: _this.body
        }); };
        _this.method = method;
        _this.headers = headers;
        _this.url = url;
        _this.body = body;
        return _this;
    }
    ;
    return ApiRequestCallBuilder;
}(BasicImplFunctions_1["default"]));
exports["default"] = ApiRequestCallBuilder;

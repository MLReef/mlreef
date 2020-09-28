"use strict";
exports.__esModule = true;
var BasicImplFunctions = /** @class */ (function () {
    function BasicImplFunctions() {
        this.parseMapsToJson = function (map) { return JSON.parse(JSON.stringify(map)); };
    }
    return BasicImplFunctions;
}());
exports["default"] = BasicImplFunctions;

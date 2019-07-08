(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define(['exports', 'kotlin'], factory);
  else if (typeof exports === 'object')
    factory(module.exports, require('kotlin'));
  else {
    if (typeof kotlin === 'undefined') {
      throw new Error("Error loading module 'ktor-ktor-client-js'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'ktor-ktor-client-js'.");
    }
    root['ktor-ktor-client-js'] = factory(typeof this['ktor-ktor-client-js'] === 'undefined' ? {} : this['ktor-ktor-client-js'], kotlin);
  }
}(this, function (_, Kotlin) {
  'use strict';
  Kotlin.defineModule('ktor-ktor-client-js', _);
  return _;
}));

//# sourceMappingURL=ktor-ktor-client-js.js.map

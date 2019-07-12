(function (_, Kotlin) {
    'use strict';

    function notMain() {
        alert('kotlin rulez');
    }

    var package$com = _.com || (_.com = {});
    var package$mlreef = package$com.mlreef || (package$com.mlreef = {});
    package$mlreef.notMain = notMain;
    Kotlin.defineModule('output', _);
    return _;
}(module.exports, require('kotlin')));

//# sourceMappingURL=output.js.map

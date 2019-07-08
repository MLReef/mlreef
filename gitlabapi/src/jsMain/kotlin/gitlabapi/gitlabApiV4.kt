package com.mlreef.gitlabapi

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.promise
import kotlin.js.Promise


/*
 * These wrapper functions are necessary so that asynchronous calling works in javascript
 * wrap the function calls in Javascript like this:
    output.com.mlreef.getGroup(token, "mlreef").then(function(result) {
        alert (res.description);
    });
 */

@JsName("getGroup")
fun jsGetGroup(token: String, groupName: String): Promise<Group> =
    GlobalScope.promise { getGroup(token, groupName) }

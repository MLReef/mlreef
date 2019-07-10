import com.mlreef.gitlabapi.v4.Group
import com.mlreef.gitlabapi.v4.TreeItem
import com.mlreef.gitlabapi.v4.getGroup
import com.mlreef.gitlabapi.v4.listRepoDirectory
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.promise
import kotlin.js.Promise


/*
 * These wrapper functions are necessary so that asynchronous calling works in javascript
 * wrap the function calls in Javascript like this:
 *  _moduleName_._fullyQualifiedFunctionName(…)
    gitlab.getGroup(token, "mlreef").then(function(result) {
        alert (res.description);
    });
 *
 * the function name must be fully qualified (including the package).
 * For this reason this file does not have a package declaration. This way
 * all the wrapper functions are in the root packe and can be accessed directly.
 */
@JsName("getGroup")
fun getGroupWrapper(token: String, groupName: String): Promise<Group> =
    GlobalScope.promise { getGroup(token = token, groupName = groupName) }


@JsName("listRepoDirectory")
fun getGroupWrapper(
    token: String? = null,
    projectId: Long,
    path: String = "/",
    recursive: Boolean = false,
    domainName: String = "gitlab.com"
): Promise<List<TreeItem>> =
    GlobalScope.promise {
        listRepoDirectory(
            token = token,
            projectId = projectId,
            path = path,
            recursive = recursive,
            domainName = domainName
        )
    }

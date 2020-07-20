
## projectInfoActions

### getProjectsList
+ Fetch a paginated list.
+ Fetch a gitlab project's users for every one. See *mergeGitlabResource*.
+ Split user projects from the rest.

### getProjectDetailsBySlug
+ It accepts an *visitor* option to choose the correct API call.
+ Fetch the gitlab project details. See *mergeWithGitlabProject*.
+ Pipe through the adapter *adaptProjectModel*.

### mergeWithGitlabProject
+ Use the project *gitlab_id* field to request the *gitlab project* and append it in the **gitlab** field.
+ If fails will return the project without the *gitlab* field.

### mergeGitlabResource
+ This fetches additional information, such as *members*.

## TODO
+ The gitlab API calls are repetitive, but can be optimized using *GraphQL* for making a single request.

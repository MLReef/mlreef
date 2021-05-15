# ProjectView

## Routes
+ `/:namespace/:slug`
+ `/:namespace/:slug/-/tree/:branch`
+ `/:namespace/:slug/-/tree/:branch/:path(.+)`
+ `/my-projects/:projectId/:branch/path/:path` (deprecated)

## Development notes

+ We request to the API in *componentDidMount* depending on whether the user is authenticated with *fetchIfAuthenticated* or not with *fetchVisitor*.

+ Currently in *fetchVisitor* is not fetching *data-processors* due the endpoint is still pritected.

+ Be aware file paths displayed in urls are not encoded anymore, they get encoded in the API request.

+ The new **gid** stands for *gitlab_id* and was previously known as **projectId**. We changed it to avoid confusion with the mlreef id just called **id**.

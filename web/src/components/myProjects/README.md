# MyProjects

## Routes
+ `/`
+ `/perms/owner` testing route to be removed
+ `/perms/role` testing route to be removed
+ `/perms/account` testing route to be removed
+ `/my-projects` (deprecated)

## Development notes
+ We try request all the information to the API in *componentDidMount*, but there is still cohabiting with the *callback methodology*.
+ The polling system with *suscribeRT* was removed but should be set again for the beta release.
+ We are doing a single action for projects, instead of one per tab as before. This action is in charge of sorting projects.

## TODO
+ We lack of toasts for the *fetch* function.
+ The *callback* in *MTabs.Section* couldn't be necessary if we are able to fetch all projects with *fetch*.

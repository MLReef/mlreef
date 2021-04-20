# FileView

## Routes
+ `/:namespace/:slug/-/blob/:branch/:file(.+)`
+ `/my-projects/:projectId/:branch/blob/:file` (deprecated) (broken)

## Development notes
+ The API requesting action was changed to *getProjectDetailsBySlug*.
+ We need to encode path before to pass it to the *files API* request.
+ References to **projectId** (gitlab id) were partially changed to *gid*.

## TODO
+ Continue chaging **projectId** references to **gid**.

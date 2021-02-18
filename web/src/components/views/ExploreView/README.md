# Explore

see https://gitlab.com/mlreef/mlreef/-/merge_requests/967

## Suspect bugs
Since the API has quite changed, this view seems to have problems to show projects correctly.

## URL controlled tabs
This view uses **TabsRouted** which is a powerful component for making URL controlled tabs that can be nested. This allows to navigate back and forward through the following routes/tabs:
```
/explore/data-projects or /explore/data-projects/all
/explore/data-projects/popular
/explore/models or /explore/models/all
/explore/models/popular
/explore/processors or /explore/processors/all
/explore/processors/popular
/explore/visualizations or /explore/visualizations/all
/explore/visualizations/popular
```

It's strongly recommended to implement this system in **myProjects** view.

## API communication
The approach used was fetching mlprojects, models, processors and visualizations all at once, and since there are pagination we just need to fetch a small amount of them. The immediate benefit is the speed in the navigation through the tabs, because it doesn't need to fetch project every time.

## Redux


## Routes
+ `/explore`

## Development notes
+ This view is functional simplified version of *MyProjects* suited for visitors.

## TODO
+ Add the loading gif.
+ Check if *dataTypes* suits with the backend requirements.
+ Complete filtering logic.
+ Adapt the colored bar (currently not changing color).

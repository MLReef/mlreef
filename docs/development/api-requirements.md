# MLReef API requirements

## Current state

For now, the frontend is implement to rely only on gitlab. Calls are either HTTP restful calls or git interactions.
Many of those calls are used in conjunction to form a call-like "business use case", but for now we need a list of "currently used actions" to understand the needs of the frontend

### usage in frontend/web

- Files
  - GET list of files of project, scoped per branch [:project, :branch]
  - GET content of a file, scoped per branch[:project, :branch, :path]
  - GET list of branches per project [:project]
- Pipelines
  - CREATE a pipeline for a branch in a project [:project] (:ref)
  - GET list of pipelines per project [:project]
- Commits
  - CREATE a commit on a branch with given file path and content [:project, :branch] (:filePath, :fileContent,:commitMsg, :action)
  - GET list of commits (of project, not per branch!) [:project]
  - GET details of a commit  [:project, :commit]
- Users (but implemented in CommitsApi)
  - GET list of users of project [:project]
- Branch
  - CREATE a new branch on a ref (commit or branch, HEAD)  [:project] (:branch_name, :ref)
- Snippets
  - GET list of snippets filtered by "file_name" property [:project, :file_name_filter]
  - GET content of a snippet [:snippet]
  - GET a snippet with a certain Id, used for experiments [:project, :experiment]
  
### Use Cases in frontend/web 

This list is shortened, as just Use Cases which expand Gitlab's Use Cases are included.
Basics like "get branches" or "view project details" are omitted.

The short description uses hints where GET or CREATE calls are use in uppercase.

#### Display all experiments

As a user I want to view all my experiments to understand their outcomes. 
I need to check if they have failed or succeeded, how long they took and what are the implications.
To understand the implications, I have to see the details and check what Data, what Operation and Algorithm were used and how the Outcome is.
The outcome may depend on the Training model, I want to 

*Current implementation:* 

- GET all :branches of :project
- find experiment branches: 
  - filter branch name for "experiment" string 
- GET :pipelines of :project
- find pipelines for experiment branches
  - filter pipelines: status != SKIPPED
- map filtered branches with filtered pipelines and reduce to matched list
  - build experiment entity with :branch (name, commit, author) and :pipeline (status)
-  display experiments in view

#### Display statistics of an experiment

As a user I want to see how the experiment performs and what is the current state of the experiment.
I want to see the KPIs and metrics of the running experiment, as soon as they can be shown

*Current implementation:* 
- GET snippet with certain slug of :project and :branch_name
- refresh chart and visualisation

#### Start a new experiment

As a user I want to start a new experiment to create a new Training model. I want to be able to make on the fly configuration, 
like which Data is used, if it is provided in the repo or via a external Url to load some datasets. I might choose a Operation to run on the Data and configure it.
Would be good to chain operations as well.

Finally I want to start this experiment configration and be informed about the progress.

*Current implementation:* 
- prepare a new mlreef.yml by replacing placeholders on the template
- CREATE a new branch for this experiment
- CREATE a commit and commit the prepare mlreef.yml
- pipeline execution will be handled in background by gitlab

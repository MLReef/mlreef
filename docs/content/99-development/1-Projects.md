Projects
====================

### Projects Forking
Forking of all projects in MLReef follows the same principles, no matter if a Code Project or a Data Project is forked.

```mermaid
sequenceDiagram
  Frontend->>+Backend:    "send forking request"
  Backend->>-Gitlab:      "send forking request"
  Note over Backend,Gitlab: "creates a new Gitlab project"
  Gitlab ->>+Backend: "respond with GitlabProject entity"
  Backend ->>+Backend: "create MLReef project entity"
  Backend-->>-Frontend:   "send forking response"
```

Code Projects
--------------------

### Code Project Publishing
Publishing is the process which packages the code in a project in a way it can later be used by MLReef's Data, Visualisation or Experiment Pipelines. In order to do this the sources are compiled if needed, and the executables are packaged into Docker image and pushed to MLReef's internal Docker registry.

```mermaid
sequenceDiagram
  Frontend->>+Backend:    "send publishing request"
  Backend->>-Gitlab:      "create pipeline conf & Data Processor, trigger Publishing Pipeline"
  Note over Backend,Gitlab: "persist Docker coordinates"
  Gitlab->>DockerRepo:   "push Docker image"
  par Frontend Gathers Info
  Frontend->>+Gitlab:     "request pipeline information"
  Gitlab-->>-Frontend:    "send pipeline information"
  Frontend->>+Backend:    "request Data Processor information"
  Backend-->>-Frontend:   "send Data Processor information"
  end
```

1. The developer initiates publishing of a Data Processor through the Frontend
2. The Backend persists a database object which represents the new version of the Data Processor (DataProcessorVersion)
3. The Backend prepares the `Dockerfile` and pipeline configuration and sends it to Gitlab

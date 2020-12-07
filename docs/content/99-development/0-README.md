Developing MLReef
====================
This document provides an architectural overview of the MLReef Software as a Service system.
The overview is provided, using a number of different architectural views to depict
different aspects of the system. It is intended to capture and convey the significant
architectural decisions which have been made on the MLReef system.

Architecture and Planning documents for the whole platform.
These diagrams follow the [C4](https://c4model.com/) Style of Software Architecture.

The diagrams are created with the free tool Gliffy. Gliffy is available as Chrome Extension
[here](https://chrome.google.com/webstore/detail/gliffy-diagrams/bhmicilclplefnflapjmnngmkkkkpfad/related?hl=en).


Architecture Goals and Constraints
----------------------------------
There are some key requirements and system constraints that have a significant bearing on the architecture. They are:

- Gitlab was chosen as a Git backend and pipeline workflow engine
- Scaling has to be done in an elastic and cost efficient way 
- Billing of resource usage has to be done on a per client basis.
- Community members have the ability to publish pipeline operations and ML-algorithms
- The MLReef System will be built as a SaaS Web Application.
  The Frontend will be browser based while the backend (Gitlab, additional micro-services and lambda functions)
  will be hosted publicly on the internet.
- The MLReef System must ensure complete protection of data from unauthorized access.
  All remote accesses are subject to user authentication and authorization.
- The pipelines workers must support at least the most common machine learning technologies.
  Currently those include Python and Tensorflow
- A on-premise installation shall be possible

To better understand some of the choices made please read the  [designd decisions documentation](docs/development/design-decisions.md).


Simplified Component Overview
----------------------------------
This is a simplified architecture diagram that can be used to understand MLReef’s architecture.

```mermaid
graph TD
  BE[Management Service]
  DR[Docker Registry]
  EPF[Executable Pipeline Framework]
  GL[Gitlab Instance]
  R[Runner]

  S(Data Scientist) -->|interacts with| FE[MLReef Frontend]
  FE  -->|rest api| GL
  FE  -->|authenticate user| GL
  FE  -->|rest api| BE
  FE  -->|rest api| DR

  GL  -->|manage 1:*| R[Runner]
  
  R   -->|execute| EPF
  R   -->|download images| DR
  
  BE  -->|verify authentication| GL

  subgraph "Gitlab Sub Stack"
    GL
    DR
  end

  
  EPF -->|download repository| GL
	EPF -->|submit runtime and model indormation|BE 
```

_Fig 1: container level diagram of the MLReef system architecture_

MLReef is built as a (micro)services infrastructure with the web app unifying all core services in one frontend. Each service can be scaled and developed separately.
We strive to separate concerns between those systems as cleanly as possbile.

| Component          | Area of concern                                            |
|--------------------|------------------------------------------------------------|
| Gitlab             | * Authentication and authorization of users <br/> * Hosting and maintenance of Git repositories and branches <br/> * General Project infromation, stars, fork relationships <br/> * Management of Runners <br/>  * Management of individual pipeline jobs                           |
| Docker Registry    | * Provision of individual Data Processor images            |
| Management Service | * Management of model experiments <br/> * Management and displaying of data vizualisations <br/> * Management of data operations <br/> * Publishing and management of Data Processors <br/> * Calculation of pipeline and data usage                                            |

_Table 1: MLReef's component's areas of concern_






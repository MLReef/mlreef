![Build Status](https://gitlab.com/mlreef/backend/badges/master/build.svg)

MLReef
===========================
MLReef is being developed by the MLReef GmbH based in Austria, Europe
with the purpose to support collaborative and versioned data set and model 
management for the best Machine Learning projects.

## Canonical source

The canonical source of MLReef is [hosted on GitLab.com](https://gitlab.com/mlreef/backend/).

To see how MLReef looks please see the [features page on our website](https://www.mlreef.com/).


## Contribution
Information about development and contribution can be found in the [development documentation](docs/development/README.md)

## Hiring

We're hiring developers, support people, and production engineers all the time,
please see our [homepage](https://www.mlreef.com/).


## Software Stack

MLReef is SaaS application that runs on the following software
- Ubuntu/Debian/CentOS/RHEL/OpenSUSE
- Gitlab 12.1
- Git 2.8.4+
- Docker
- Custom developed micro-services will be implemented in Kotlin and run on the JVM unless there are legitimate or
  pressing reasons to use a different Technology.
- Lambda functions will also be developed in Kotlin and run either on the JVM or as Javascript unless there are legitimate
  or pressing reasons to use a different Technology.
- The Git backend will be provided by the platform Gitlab-ce platform.
  Gitlab already offers a lot of necessary functionality and is extendible via a well-documented REST API.
  Gitlab is developed in Ruby on Rails and completely open source - which gives us the flexibility in the future to
  modify it for our needs. Direct programmatical access to the repositories can be gained through Gitlab's _Gitaly_ service



For more information please see the [architecture documentation](docs/development/architecture.md).

The Web Frontend is implemented with the following technologies and frameworks
- Javascript/Typescript
- ReactJS 


## Gitlab Runners 
Gitlab runners are spawned dynamically by the AiOps Dispatcher.
The AiOps dispatcher was set up following this (article)[https://about.gitlab.com/2017/11/23/autoscale-ci-runners/] 


## Is it any good?
[Yes](https://news.ycombinator.com/item?id=3067434)


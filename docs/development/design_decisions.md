Design Decisions
==================================

Kotlin (JVM) in the Custom Backend
----------------------------------
When deciding which language to use for the non-Gitlab backend, we evaluated up with several different possibilities.
Each of which has different advantages and drawbacks over compared to the other solutions. We evaluated our technology
choices according to the following criteria:

* technology maturity and cost
* ecosystem maturity and stability
* code sharing between modules
* available talent and maintainability

The candidates listed in alphabetical order:

### Kotlin (JVM) & Java 
The JVM ecosystem has seen over two decades of heavy use in enterprise server applications. The open-source ecosystem
is thriving and provides many implementation options for standard use cases like API development, authentication, 
persistence, messaging, and monitoring. Kotlin combines the benefits of this mature ecosystem with the benefits of modern
features like functional programming, type inference, extension functions, null safety and more.  

Since neither Gitlab nor our frontend is implemented in Java nor Kotlin, leveraging code sharing is not possible.


### Node JS
While we would like to use only a single language for development and there exists the possibility to use Javascript in
the backend as well via NodeJS, we have decided against this approach for two reasons.

1. Currently, the NodeJS API is not entirely stable and introduces breaking changes in new versions.
2. The library support of NodeJS is far inferior to other options like C# and the Java (JVM) ecosystem


### Python
Using Python would allow us to share model and data-related functionality with the EPF and the backend which can be
useful for doing on demand trial runs of data operations.


### Ruby
Since Gitlab is implemented mostly in Ruby, this would have the advantage of our developers being able to understand,
both the Gitlab and our custom codebases well.     


### Conclusion
Kotlin and Java have been chosen in great parts because of the maturity of the ecosystem and availability of talent
in the early MLReef team.

- Custom developed micro-services will be implemented in Kotlin and run on the JVM unless there are legitimate or
  pressing reasons to use a different technology.
- Lambda functions will also be developed in Kotlin and run either on the JVM or as Javascript unless there are legitimate
  or pressing reasons to use a different technology.
- The Git backend will be provided by the platform Gitlab-ce platform.
  Gitlab already offers a lot of necessary functionality and is extendible via a well-documented REST API.
  Gitlab is developed in Ruby on Rails and completely open source - which gives us the flexibility in the future to
  modify it for our needs. Direct programmatical access to the repositories can be gained through Gitlab's _Gitaly_ service

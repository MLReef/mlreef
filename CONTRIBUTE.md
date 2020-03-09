Contribution Guidelines
=================================

First of all, thank you for taking the time to contribute! Pull requests are always welcome.
The Guidelines aim to make collaboration on the project easier and cutting down on time
spent on bikeshedding. They represent agreed upon rules which shall be followed by every
contributor.

This document is NOT an arbitrary set of rules to be follewed blindly, but rather a written down
of the agreed upon standard. Of course this is a living document and subject to change,
so feel free to submit pull requests to this document as well.

These rules only purpose is to improve code readabilty and quality and thus maintainabilty
and overall project success. Whenever a rule is in conflict with this goal it should be challenged.


Code Style
==========
> “Programs are meant to be read by humans and only incidentally for computers to execute.” : Donald Ervin Knuth

The aim of this code style is to reduce the mental load while reading the code 

### Programming Languages
Always try to keep the number of languages to a minimum. If there is no explicit functional reason
to use an additional language (eg. Java in a Kotlin module). It shall be avoided. 

### General Code Style
Please follow the code style of the Project. This Project uses the IntelliJ default settings except:
```
code-style.kotlin.tabs-and-indents.continuation-indent = 4
code-style.kotlin.wrapping-and-braces.method-annotations = wrap if long
code-style.kotlin.wrapping-and-braces.property-annotations = wrap if long
code-style.kotlin.top-level-symbols.use-single-name-import = true
code-style.kotlin.java-statics-and-enum-members.use-single-name-import = true
```

You can find general settings in the `.editorconfig` file as well as IntelliJ specific settings in the file
`.editorconfig-idea.xml`. Example screenshots can be found at the [bottom](#screenshots) of this document.

#### Static Imports
Static imports are used to be used as a default, erspecially if the Type is defined in the same line.
They can only be ommited to improve readability or prevent compile errors. 

### Test Code
**Naming:** When writing tests in koltin we like to make use of the fact, that Kotlin allows Unicode function names. This means
please name your tests in the following pattern.
* ```@Test fun `Can do Stuff when Condition is given`() {…}```
* ```@Test fun `Cannot do Stuff when condition is missing`() {…}```
* ```@Test fun `Throw Exception when something unexpected happens`() {…}```

**Annotations:** The `@Test` annotation should be placed right in front if the `fun` keyword.
Any other annotations should be placed in the line(s) above of the function declaration 


Testing & Documentation
======================
Ideally you follow the 3 Laws of TDD as laid out by Robert Martin which are:
> 1. You are not allowed to write any production code unless it is to make a failing unit test pass.
> 2. You are not allowed to write any more of a unit test than is sufficient to fail;
> and compile failures are failures.
> 3. You are not allowed to write a ny more production code than is sufficient to pass the one failing unit test.
See Robert Martin's talk on (youtube)[https://www.youtube.com/watch?v=qkblc5WRn-U]

Add or change the documentation where necessary.
* Add or change the API documentation
* Add or change the project's readme


Version Control
===============
When committing code please make sure that you:
* Make commits of logical units.
* Be sure to use the issue key in the commit message.
* Ensure you have added and run the necessary tests for your changes.
* Run all the tests to assure nothing else was accidentally broken.

Prior to committing, please want to pull in the latest upstream changes.
* Push your changes to the topic branch in your fork of the repository.
* Initiate a pull request (aka. merge request)

### Commit Messages / Pull Request Messages
1. Start the subject line with the ticket number followed by an uppercase
2. Limit the length of the subject line to 50 characters
3. Use the imperative in the subject line
4. No period at the end of the subject
5. Leave a blank line after the subject for separation
6. Limit the leght of the body to 72 characters
7. Explain the why and the context of the change, not what was changed

Example:

````````````
#1 Summarize changes with a max length of 50

Leave a blank line before the more detailed explanation. This block shall
be wrapped around a length of 72 characters. In git commands and other
contexts the first line will be treated as a header and everything else
will be considered as the content. The content is optional if the
subject line alone already offers enough explanation.

Resolves: #1
See also: #456, #789
````````````



Screenshots
===========

![](./docs/img/editor-settings-1.jpeg)
IntelliJ Kotlin Indentation

![](./docs/img/editor-settings-2.jpeg)
IntelliJ Kotlin Annotations

![](./docs/img/editor-settings-3.jpeg)
IntelliJ Kotlin Star Imports

Api builders
=====

Theory
====

For building this we took as guidance the builder pattern, which propose a clean way for building different kind of objects: 
https://www.tutorialspoint.com/design_pattern/builder_pattern.htm

Components
====

* Interface Builder, forces the implementations to inherit build method in which the final object is returned.

* builders, these classes provide methods to assemble 
the objects(requests), they inherit and implement build method from the Builder.

* Director, provides some useful methods and common attributes. Those that inherit this class are the directors.
They are in charge of receiving/passing the right params to the builders, and calling the builder's methods in the right order to create API requests correctly.


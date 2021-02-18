# MLReef Styles

Consists in a class controlled styles, created using *scss* tree structure (e.g. .card, .card-header, .card-header-title). This theme has been inspired by Twitter Bootstrap, hence an hypothetical migration to Bootstrap must be easy.

## Compilation and issues

MLReef Styles is compiled with sass engine version for node called **node-sass** which is highly dependent on the node version. If any build stage issue the first suspect is the node version. Additionally it's recommended to install in the machine a node version manager like `n`.

## Files

`theme.scss` this is the entrypoint where all modules are imported and it's the temporary place for orphan chunk of code.

`_initials.scss` the large part of the variables are located in this file as *default* this means that can be overwritten. It's a good practice to put here any new variable use throughout the modules.

`_variables.scss` these are the values that override the `_initials.scss`. Keeping this values separated from the initials allows to identify at first glance which values has been customized, also it's easier to import them in component *scss* files.

## Root variables
Some variables like colors are set as root variables and called as `var(--color)` instead of importing the variables file. However, this doesn't work for media queries breakpoints.

## MLReef icon font
The aim is create a *fa-like* set of MLReef's icons, by creating a *ttf* file. More information in the related README.

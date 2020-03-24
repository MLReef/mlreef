Style development guidelines
===

* Develop using a css pre-processor (sass is preferred), React files can import .scss files
* Choose a well known styles toolkit, if not, to build global components.
* Prefer class selectors for styles.
* Prefix with component's name.
* Design desktop first (mobile second).
* Prefer to control dispaying with classes over render conditionals.
* Prefer styles in css / scss files over jsx files.
* Use flexbox when layouting.

Develop using a css pre-processor
---

### SCSS pre-processors
Pre-processor allows us to carry out programming tasks:
* Set variables to parameterize values e.g. colors, measures, borders.
* Write a tree form styles selector.

```scss
.my-class {
  width: 100%;
  
  &-header {
    padding: 1rem;
    
    &-title {
      color: #000;
    }
  }
}

// compile to:
.my-class {
  width: 100%;
}

.my-class-header {
  padding: 1rem;
}

.my-class-header-title {
  color: #000;
}

```

this helps a lot when writing css.

* Reuse code vie mixins. Mixins are like function that receive parameters and returns a bunch of styles.
We might write a mixin for button style and when need to change the buttons' style 
just change the mixin.
* Easy way to import and modularize files, because scss have some optimizations.
* Better comment support. We can add comments that will throw out in the final css.
  
#### Sass
* One of the most widely used pre-processors.
* Vuetify is migrating from stylus to sass.
* Semantic-ui is migrating from less to sass.

> Semantic-ui and Vuetify are two well known styles toolkits.
>
> stylus and less are other css pre-processor.


Choose a well known styles toolkit, if not, to build global components
---
### A well known styles toolkit
The most used toolkit is twitter Bootstrap but not the only one. To choose one we have to consider:
* Adaptability: We need access to its scss files, so we can customize it and adapt it
to our design. Also if we can destructure its components is a plus.
* Mandatory dependencies: most toolkits require JQuery.
* Developer experience: sometimes the learning curve is something that doesn't fit
our schedule.

For all of this Bootstrap4 is recommended, just with the handicap of JQuery dependency, 
we can just ignore it and build our own javascript.


Prefer class selectors for styles
---
* Class selectors allow to reuse the styles, whilst id selectors are unique and unpredictable for
very common ids e.g. #name, #form, #title.
* Class names can be chained in scss, so every class will be independent from the level,
this `.header-title-icon` is strongly recommended over level selectors 
`.header .title .icon` or `.header > .title > .icon`
* Actions can be represented with classes e.g. show trigger open menu with `.menu.show`

Prefix with component's name
---
* Very useful when debug, we can quickly identify which component we are when exploring
the DOM.
* It also works as namespace for scoping the styles, as long as two components should not
have the same name. Many problems are caused by overwriting styles. 

Design desktop first (mobile second).
---
* When layouting we should think "this how should behave in a smaller screen?" even though
there isn't yet, because many times a little more work in this point will save from a large
refactoring when the time for the new layout comes.  

Prefer to control dispaying with classes over render conditionals
---
* Conditioned rendering is awesome, but makes the animations a very hard path, and
sometimes is better to keep the component alive rather than create one each time.
* When a component (or just html code) exists but is hidden with a `display: none` is
easier to animate it in many ways.

> React warns about the cost of creating class components.


Prefer styles in css / scss files over jsx files.
---
* This is consequent with **Separation of Concerns** principle.
* We are already sharing variables in css scope.
* Of course there is exceptions, specially if styles are very dynamic.

> This is arguable, but we must decide to write styles in javascript throughout the project or not.  

Use flexbox when layouting
---
* Every eager project must consider to use Flexbox.
* Flexbox is the tool for write responsiveness behavior.
* Most of div considered containers have to be flex.


Recommendations
===

### Global styles
* Set global css variables for colors.
* Sadly we can set breakpoints as css variables, because media queries don't recognize them.

### Avoid to use fixed dimension parameters for objects
When we set a height for a button we usually get padding issues. Height should be 
determined by font-size, padding-top and padding-bottom, as well width vary with the
text's length.

> Objects: buttons,

### Use relative units for containers
* Use width in percentage, plus a max-width in px.
* Sometimes we can combine min-width, max-width and widh with px, vw, vh, %, rem combinations,
depending on the case.

### Examples

1. [Dropdown component](examples/Dropdown.md)

2. [Customizing Bootstrap](examples/customizing-bootstrap.md)

3. [General components](examples/general-components.md)

### XD file links
These links show the initial design of each view in MLReef. 

**General**

[Marketplace](https://xd.adobe.com/view/5d9dcfd2-3bfb-4ee0-5069-8c9e2f0a5b7b-2bac/)

[New Group](https://xd.adobe.com/view/ee07af82-4f62-499d-45af-eb3db4871e5c-9836/)

[New Project](https://xd.adobe.com/view/c1bef4a8-42a9-40b0-6669-00305c4adbd7-b78f/)

[Registration](https://xd.adobe.com/view/c4069ef1-b6d4-44f5-528c-4e0da5800e5a-b237/)

[Sign-in](https://xd.adobe.com/spec/73ca4d40-8b2c-4daf-6e21-de66179316b1-05fb/)

[User Profile](https://xd.adobe.com/view/7a312cce-4d5e-4c9c-5bdf-620569bb679c-0c00/)

**Data**

[Commits_View](https://xd.adobe.com/spec/75077ae6-de00-45d0-6fd3-759602edd0d1-0336/)

[Commits_Detail](https://xd.adobe.com/view/489d424c-6bd9-41c5-43cd-0ad0f220adf4-3eac/)

[Data Instances Overview](https://xd.adobe.com/view/209888ea-007c-4cd4-6cff-e246d446ebd9-56a9/)

[Data Instances Details](https://xd.adobe.com/view/fec3ad9b-7452-42d8-4152-acf03b7c8bf6-88f2/)

[Data Instances Abort_delete](https://xd.adobe.com/view/e153a9e3-1cad-432b-7a05-7c98fc856d72-9762/)

[Data Visualization Pipeline Empty](https://xd.adobe.com/view/b589da30-873c-464d-4638-1472579d21a4-c3b8/)

[Data Visualization Pipeline](https://xd.adobe.com/view/13689233-69cb-4985-5a96-03023e492d68-6559/)

[Data Visualization Pipeline Modal](https://xd.adobe.com/view/528d7eb2-3422-4fc3-6a33-8c4ba4aaa4cb-24bc/)

[Data Visualization Pipeline Select_data](https://xd.adobe.com/view/d1614d97-daf6-4a2b-600a-5c9e173ac739-a750/)

[Data Visualization Delete / Abort](https://xd.adobe.com/view/20cff280-7a9c-416e-5f08-10da7f0d87ff-56fe/)






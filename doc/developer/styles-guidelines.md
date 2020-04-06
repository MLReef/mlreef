Style development guidelines
===

Please check out:
* [design guide proposal](doc/developer/design-guidelines.md)
* [XD designs section](#xd-files)
* [explore advantages of implementing improved css tools and techniques](https://gitlab.com/mlreef/frontend/-/issues/231)

## Fundamentals

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
* Of course there are exceptions, specially if styles are very dynamic.

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

## <a name="xd-files"></a> XD file links
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

[Data Visualization Details](https://xd.adobe.com/view/a2e65c2d-7210-44d9-405b-e4b05d39f367-d4d7/)

[Data Visualization Overview](https://xd.adobe.com/view/6c673bab-6cad-46ec-4995-0e01fec6f3f1-1a56/)


**Data Repository (ML Project)**

[Data Repo Overview](https://xd.adobe.com/view/c6c402fa-d7f8-4b46-4c6f-dd6257402fb4-b0f5/)

[Data Repo Overview Empty](https://xd.adobe.com/view/7359345f-498c-4827-5cb8-eb7d5ad329b5-0568/)

[Data Repo File View](https://xd.adobe.com/view/487ab346-ffb9-4a30-52b9-57d37fbb43c1-3e4b/)


**Data Repository (ML Project) Side functions**

[Branches](https://xd.adobe.com/view/23417c6e-c683-4dd3-6f32-ad5bbef0753d-5570/)

[Delete File](https://xd.adobe.com/view/b093afeb-118a-48f2-5b24-8684dbf5014c-c6a2/)

[Forking](https://xd.adobe.com/view/b4d538d5-666e-40d6-614c-6a995806ee4d-c2e4/)

[Forking Namespace](https://xd.adobe.com/view/06b4dc63-345c-4dde-7c54-3391ecf37440-7085/)

[History](https://xd.adobe.com/view/f1ebb054-cf1d-4692-637e-a8504f10d1ec-87da/)

[New Branch](https://xd.adobe.com/view/43dd2017-0402-4643-42a8-f16e0731d7a7-35ec/)

[Upload New File](https://xd.adobe.com/view/cdd59855-ac05-48c4-5888-7a0a453e79e7-bbe4/)

**Merge Request**

[MR Overview](https://xd.adobe.com/view/91c19db9-c67c-4ead-42a3-ac3c8cc8dc07-e7f0/)

[Review MR Changes](https://xd.adobe.com/view/59e6fed8-a6a1-44e2-6cbb-c0020831dae0-2fd7/)

[Review MR Overview](https://xd.adobe.com/view/7fe07979-d332-483b-4680-3111e9174096-09d1/)

[Review MR Commits](https://xd.adobe.com/view/20e327f7-f8e1-4d4e-6be6-035b686aa22e-56d2/)

[New MR](https://xd.adobe.com/view/d299271c-6e84-4a9f-4918-b83014f539ab-a4a8/)

**Data Processing Pipeline**

[Data Processing Empty](https://xd.adobe.com/view/6da25d40-2a4d-4743-5776-767e53100df5-1b93/)

[Data Processing Modal](https://xd.adobe.com/view/670866c8-87ad-4002-64c0-0894d3d7e9cd-1139/)

[Data Processing Overview](https://xd.adobe.com/view/566ad5dc-edcf-49e3-7230-c4d0e1fa4078-205b/)

[Data Processing Select Data](https://xd.adobe.com/view/cd08a4b8-ecab-4508-4e6a-a00bb3967697-bb39/)

**Experiments**

[Experiments Overview](https://xd.adobe.com/view/26f1e720-73a0-43a3-7eeb-08bb38abd986-50c0/)

[Experiments Overview Empty](https://xd.adobe.com/view/e233e6ca-7ec7-4842-58ff-f724872b4612-9402/)

[Experiments Delete](https://xd.adobe.com/view/7ba128d3-8ff7-4290-437c-d6706c120c3e-0d90/)

[Experiments Abort](https://xd.adobe.com/view/036b80f1-9769-4112-7315-a6ed5c55f165-755a/)

[Experiments Details General](https://xd.adobe.com/view/4c36303b-dc02-4fa6-6714-a51bcc19bab6-3a07/)

[Experiments Details Files](https://xd.adobe.com/view/acf7fd8b-01b4-4903-65a6-c348a4417cb6-dac6/)

[Experiments Details Training Log](https://xd.adobe.com/view/dd562d39-9d8b-4d1b-4a26-e29fefe3314e-ab67/)

[Experiments Pipeline Overview](https://xd.adobe.com/view/5e5706b9-f556-4c88-7106-5edc92fef339-2866/)

[Experiments Pipeline Overview Empty](https://xd.adobe.com/view/8d73060c-174a-43e6-6a96-78861d008514-fb42/)

[Experiments Pipeline Modal](https://xd.adobe.com/view/b44d7673-34c1-461e-483f-604ca3647c2e-c27c/)

[Experiments Pipeline Select Data](https://xd.adobe.com/view/f059d209-7ad7-4789-7f96-20b99b464f11-8668/)

**Insights**

[Insights Jobs (ML Project)](https://xd.adobe.com/view/07843c33-3b31-43b5-6d0f-10684160726c-71b5/)

**Models Repository**

[Model Repository Overview](https://xd.adobe.com/view/0743573d-9d17-4819-6dd4-fb5bc8fd63cc-7172/)

[Model Repository Publishing](https://xd.adobe.com/view/85704017-c0c9-41b9-5646-28a6f23a1ce4-f341/)

**Settings**

[Settings General (ML Project)](https://xd.adobe.com/view/65e88d76-2c29-4503-47d1-3148049ed484-13d9/)

[Settings Members (ML Project)](https://xd.adobe.com/view/06099f51-b2c6-4532-4020-800b4f7e5efa-7038/)

[Settings Resources (ML Project)](https://xd.adobe.com/view/9721b063-fb36-4cd7-5f2a-1649a9aafeee-e110/)

[Settings Storage (ML Project)](https://xd.adobe.com/view/ef7862a5-1181-4543-59e0-d5d9d5d33742-9949/)

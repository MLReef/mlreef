Theme
===

* These styles are applied with classes.
* Uses **font awesome** icons.

Components:
---

* [buttons](buttons.md)
* [modals](modal.md)

Helpers:
---

Sometimes we just want make a little adjustment like add some padding, or hide something
on mobile. This can be achieved with some helpers.

### Spacing
Notation is equivalent to [Bootstrap4 spacing](https://getbootstrap.com/docs/4.4/utilities/spacing/)



Helpers can be translated to the following examples:

```css
  .mx-auto {
    margin-left: auto !important;
    margin-right: auto !important;
  }

  .pt-2 {
    padding-top: 0.5rem !important;
  }

  .p-3 {
    padding: 1rem;
  }

  .ml-5 {
    margin-left: 4rem !important;
  }

  .p-sm-y-0 {
    @media screen and (max-width: 600px) {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  }
```

### Display

```css
  .d-none {
    display: none !important;
  }

  .d-flex {
    display: flex !important;
  }
```

### Flexbox

```css
  .flex-0 {
    flex: 0 !important;
  }

  .flex-1 {
    flex: 1 !important;
  }
```

### Colors

```css
  .bg-dark {
    background-color: var(--dark) !important;
  }

  .t-danger {
    color: var(--danger);
  }
```

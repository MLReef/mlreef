General components
=== 

* This is an example of how to create styles for general purpose.
* Useful when we don't have a toolkit like Boostrap

`theme.scss` 

```scss
@mixin btn-base {
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  font-size: 1rem;

  &[disabled] {
    background-color: var(--mid-gray) !important;
    cursor: auto;
  }
}

.l-btn {
  &-gold {
    @include btn-base;
    background-color: var(--gold);
  }

  &-blue {
    @include btn-base;
    background-color: var(--blue);
  }

  &-mid-gray {
    @include btn-base;
    background-color: var(--mid-gray);
  }

  &-danger {
    @include btn-base;
    background-color: var(--red);
  }
}
```

Compiles to:

```css
.l-btn-gold {
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  /* only changes the background color */
  background-color: var(--gold);
}

.l-btn-gold[disabled] {
  background-color: var(--mid-gray) !important;
  cursor: auto;
}

/* same for everyone else */
``` 

### Usage:

```html
<button className="l-btn-danger">Delete</button>
```
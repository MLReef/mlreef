# MButton

### Source
`web/src/components/ui/MButton/index.js`

### Props
- **type** [String] type of button.
- **className** [String] optional classes to append to the button.
- **label** [String] button label.
- **waiting** [Boolean] if true displays a spinner.
- **onClick** [Function] the button onClick listener.

web/src/components/login/login.jsx#145
```html
<div id="sign-in-btn" className="input-container">
  <MButton
    type="submit"
    waiting={isFetching}
    label="Sign in"
    className="btn btn-primary"
  />
</div>

<!-- other option -->

<div id="sign-in-btn" className="input-container">
  <MButton
  className="btn btn-primary"
    waiting={isFetching}
    onClick={submit}
  >
    Sign in
  </MButton>
</div>
```

doc/developer/ui/MDropdown.md

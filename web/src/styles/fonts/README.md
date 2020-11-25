# MLReef icons

## Mapping
```
o -> dataops
v -> visualizations
```

## Using in button responsive
Button responsive means that below a certain breakpoint the button will hide its text and
show the icon.

To add this functionality to a button it's only needed to add `data-icon="[char]"`, e.g.

```html
  <button type="button" className="btn ..." data-icon="v">
    Visualizations
  </button>
```

## Notes
For due to Gatsby uses a different css loader it's strongly recommended to put the font file
in the static directory.

## Sources

https://inkscape-manuals.readthedocs.io/en/latest/creating-custom-fonts.html

https://fontforge.org/en-US/downloads/gnulinux-dl/

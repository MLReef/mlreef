Global design guidelines
===

### Set a font type and font-size for the whole project
This is an important design parameter, most of spacing features work better when are 
related to the font-size, e.g. padding inside a card should be 1rem, a button should
have padding: 0.5rem 1rem; titles h1, h2... h6 are related to font size as well.

> rem: stands for Root em
>
> em: stands for height of letter M, a standard in font sizing.

### Set brand colors
This is already done, but we need to be clear with everyone's role.

#### Primary color
For highlight something important, e.g. execute button.

#### Secondary button
For anything less relevant, e.g. see stats button, options inside a menu.

#### Dark and light
They complement themselves to create layouts.

#### Status pack
Red, yellow, cyan work well with error, warning and info.

### Borders and shadows
They must be constant in whole project, usually are related to design principles
(material design for google, apple has its own principles).

#### Border radius
Should be rem, although fixed px units works well too. Relative units like percentage
tend to be very unpredictable when user change the window's width.

### Elements fluency
When making a layout we used to do it for a fixed width (e.g. 1040px) but elements should
flow and sort in a determined way, this is easily achieved with flexbox.

#### Avoid horizontal scrolls
This is a tricky part of css, sometimes an element can create an overflow and force
an horizontal scroll, other times we accidentaly set min-width for large divs. 
It's important to be watchful of these issues.

### Animation behavior
Animations should be planed from the design, or in very early development stage.

### Icon package
There are 2 kind of icons:
* Brand icons: important to show MLReef presence.
* Common icons: like the arrows, close icon, check sign. They should be chosen from
a public set like font awesome or glyph.

### layout responsive
Depending on the number of b breakpoints we'll have a (b +1) layouts, and for every
we have to customize the html and css. Since our potential customers will use a desktop
machine we should prioritize desktop layout, and set a breakpoint for the second
most used width, probably a tablet (around 800px), then we have to keep in mind that we have to 
complete the second tablet layout (in a further milestone) and this must fit a mobile screen as good as we 
can.

> breakpoints: is a width measure where we want to take an action.


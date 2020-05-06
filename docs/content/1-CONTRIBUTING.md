# How to contribute

Documents are located in `/docs/content`.

## Main menu
This encompasses all documents in the MLReef Documentation and is auto-generated
following the next guidelines:

### Document name
This is the name shown in the menu.
The main title or `h1` if exists will be indexed as the *document name*, otherwise
the *file name* will be used instead.

### Folder root document
If a document called `README.md` is found in the directory, then it will be displayed
when the *folder name* is clicked, otherwise *folder name* won't be clickable.

### Folder name
Documents can be grouped in a file *system directory* and shown in the menu as a *dropdown*. If a `README.md` is found then its `h1` title will become the folder name, otherwise it will take *directory name*.

### Document order
Documents can be shown in a particular order by adding a numeral at the beginning of
*file name* e.g. `1-CONTRIBUTING.md`.

## Content menu
This is related to the current document and is auto-generated from the headings
following the corresponding hierarchy `h1 h2 h3 h4 h5 h6`.

### Internal links
It is possible to include internal links that will make the menu item clickable.
For adding an internal link to a title a link tag with a name attribute must be added.
This tag will be invisible, e.g.:
```html
### <a name="processing_data"></a> Processing data
```
Also is possible to navigate to this internal link from anywhere using the hash tag url route, e.g.:

```html
<a href="#processing_data">Check the Processing Data Page</a>
```
or
```md
[Check the Processing Data Page](#processing_data)
```

# Git Attributes

MLReef supports defining custom [Git attributes](https://git-scm.com/docs/gitattributes) such as what
files to treat as binary, and what language to use for syntax highlighting
diffs.

To define these attributes, create a file called `.gitattributes` in the root
directory of your repository and push it to the default branch of your project.

## Encoding Requirements

The `.gitattributes` file _must_ be encoded in UTF-8 and _must not_ contain a
Byte Order Mark. If a different encoding is used, the file's contents will be
ignored.

## Syntax Highlighting

The `.gitattributes` file can be used to define which language to use when
syntax highlighting files and diffs. 
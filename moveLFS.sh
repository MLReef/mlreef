#!/bin/bash
git lfs track "epf/utils/**"
git lfs track "epf/src/data/**"
git add .gitattributes
git add --all
git commit -m "move data"

git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch epf/utils/*' HEAD --prune-empty \
git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch epf/src/data/*' HEAD --prune-empty  

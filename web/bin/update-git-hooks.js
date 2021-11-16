/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// ---------------------------
const script = `#!/bin/sh

node web/bin/bump-version.js
`;
// ---------------------------

const gitDir = `${__dirname}${path.sep}..${path.sep}..${path.sep}.git`;

if (fs.existsSync(gitDir)) {
  const hooksDir = `${gitDir}${path.sep}hooks`;

  if (fs.existsSync(hooksDir)) {
    const preCommitPath = `${hooksDir}${path.sep}pre-commit`;

    if (fs.existsSync(preCommitPath)) {
      const backPath = `${hooksDir}${path.sep}pre-commit.back`;

      console.log(`Renaming ${preCommitPath} -> ${backPath}`);

      fs.renameSync(preCommitPath, backPath);
    }
    fs.writeFileSync(preCommitPath, script, { mode: '775' });
    console.log('pre-commit updated.');
  } else {
    console.log(`Directory ${hooksDir} not found.`);
  }
} else {
  console.log(`Directory ${gitDir} not found.`);
}

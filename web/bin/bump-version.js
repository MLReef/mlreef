/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const dotenv = require('dotenv');

const config = dotenv.config({ path: `${__dirname}${path.sep}..${path.sep}.env` });

if (config.error) {
  console.log(config.error);
  return;
}

const ENABLE_BUMP_VERSION = !!config.parsed.ENABLE_BUMP_VERSION;

if (!ENABLE_BUMP_VERSION) return; // early exit

console.log('bump', ENABLE_BUMP_VERSION);

const packageJsonPath = `${__dirname}${path.sep}..${path.sep}package.json`;

console.log('Bumping version!');

const packageJson = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });

const fixed = packageJson.replace(/("version":\s?")(\d\.\d\.\d-)(.+)(",)/, (_, g1, g2, g3, g4) => {
  const hash = Date.now();
  return `${g1}${g2}${hash}${g4}`;
});

fs.writeFileSync(packageJsonPath, fixed);

// eslint-disable-next-line no-new
new Promise((resolve, reject) => {
  exec(`git add ${packageJsonPath}`, (error, stdout, stderr) => {
    if (error) {
      reject(stderr);
    } else {
      resolve(stdout);
    }
  });
});

MLReef - Frontend Application
=============

This module contains the MLReef frontend web app which is implemented as a [REACT Web App](https://reactjs.org/).

For more information about ***MLReef***
- https://about.mlreef.com/
- https://gitlab.com/mlreef/mlreef
- https://github.com/MLReef/mlreef


## Getting Started for Frontend Development

### Setup your developer environment
* Install Node (for version [see](/web/Dockerfile))
  * Windows [link](https://nodejs.org/en/download/)
  * **OSX:**
  ```shell script
  # install homebrew
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  # use homebrew to install node
  brew install node`
  ```
* Install react scripts `npm install --global react-scripts`

### Download Dependencies
Install all frontend dependencies with npm: `npm install`

### Quick start
After install *npm* dependencies, the quickest way to start a functional development environment is connecting to an existing *MLReef API* instance, setting the `REACT_APP_BACKEND_REROUTE_URL` env variable [see](/web/.env)

You can start the *frontend* application locally with *npm*, using the `npm start` command.


## Main technology stack
* [Create React App](https://create-react-app.dev/)
* [React Redux](https://react-redux.js.org/)
* [React Router DOM](https://reactrouter.com/web/guides/quick-start)
* [Sass](https://sass-lang.com/)
* [Formik](https://formik.org/)
* [Dayjs](https://day.js.org/)
* [Monaco Editor](https://microsoft.github.io/monaco-editor/)
* [Toastr](https://www.npmjs.com/package/react-redux-toastr)
* [Plotly](https://plotly.com/javascript/)
* [Jest](https://jestjs.io/)
* [Enzyme](https://enzymejs.github.io/enzyme/)


## Project structure

* `web/src/` bootstrapping and configuration files.
* `web/src/__test__/` cotains *Unit Tests*.
* `web/src/apis/` folder contains calls to resources provided by Gitlab and MLReef APIs.
* `web/src/components/` is the main folder, it contains all the project pieces of code and their styles abstracted in modules, which can be reused by copying and pasting.
If a component has its *CSS* or *SCSS* file to customize it, the *JS* and style files must be grouped at the same folder.
  - `web/src/components/ui/` contains *UI components* ideally not conected to *store* [see](/web/src/components/ui/README.md).
  - `web/src/components/layout/` groups some *layout* components.
  - `web/src/components/commons/` contains components that are used by many other parts and are connected to store as well.
  - `web/src/components/views/` groups view components that should be imported in `web/src/routes.js`.


* `web/src/customHooks/` contains *React hooks* used throughout the application.
* `web/src/customImports/` contains module and libraries' adaptations needed specially for *React.lazy()* loading.
* `web/src/domain/`
* `web/src/functions/` folder contains abstract operations like conversions, math calculations, validations and other logic which is used in modules but separated for readability purposes.
* `web/src/images/` contains contains images that are parsed by *webpack* (prefer `public/images`).
* `web/src/router/` this is the MLReef router based on *React Router DOM* [see](/web/src/router/README.md).
* `web/src/store/` contains *actions*, *reducers*, *actionTypes* and configuration files for the **react-redux** state.
* `web/src/styles/` contains the core of *SCSS* styles, its variables, modules and configuration [see](/web/src/styles/README.md).


## File naming

* Tests must always finish with *.test.js*
* *PascalCase* should be used for naming components, style files and classes.
* *camelCase*  should be used for helper functions, actions, reducers, configuration, hooks and any other supporting file.

## Env vars

* The .env file contains vars that can be read for multiple purposes. eg. url of the corresponding backend instance.


## Scripts available
- `npm start` start *webpack* developing server in `localhost:3000`
- `npm test` run *Unit Tests* and save coverage in `web/coverage`
- `npm run build` build the production bundles in `web/build`
- `npm run testLocally` similar to `npm test`
- `npm run cypress` start *Cypress Testing Suite* (WIP)
- `npm run sitemap` create *sitemap* in `web/public/sitemap.xml`
- `npm run eject` Eject *CRA* (please don't)
- `npm run storybook` start storybook server in `localhost:6006`
- `npm run build-storybook` create storybook static files in `web/storybook-static`
- `npm run analize-bundle` run the analysis of production bundle size in `localhost:8888`
- `bin/ci-build-frontend` create *Docker image*

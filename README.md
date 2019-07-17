# MLReef Frontend


## Module Structure
* **gitlab-api**: currently deprecated because of incompatibilities between kotlin-js and react.
* **web**: the npm based react frontend



## Build (and CI/CD)
To install all npm dependencies execute the command `npm install` from inside the _web_ module folder
To build the frontend project, execute the command `npm run build` from inside the _web_ module folder 
```bash
cd web
npm install
npm run build

```

## Run
To run the frontend server execute `npm start` from within the web module folder
```bash
cd web
npm start
```

# Literature
* https://medium.com/@chris.barbour03/kotlin-js-building-deploying-and-depending-on-it-with-npm-and-webpack-2f7aab544c9f
* https://youtrack.jetbrains.com/issue/KT-27611
* https://reactjs.org/
* https://www.youtube.com/watch?v=FDOECr-sT6U

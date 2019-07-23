# MLReef Frontend


## Module Structure
* **gitlab-api**: currently deprecated because of incompatibilities between kotlin-js and react.
* **web**: the npm based react frontend


## Setup
For setting up the frontend dependencies you have to run: `./gradlew npm_install`

On windows you need to run: `gradlew.bat npm_install`


## Run Locally
For running locally plesae refer to the web module's [README.md](web/README.md) 


## Production build
To build the frontend project use: `./gradlew npm_run_build`


# Literature
* https://medium.com/@chris.barbour03/kotlin-js-building-deploying-and-depending-on-it-with-npm-and-webpack-2f7aab544c9f
* https://www.youtube.com/watch?v=FDOECr-sT6U


# Element styles and transitions
Here is the XD file for the definitions of all elements: https://xd.adobe.com/spec/e23711b1-f385-4729-5034-632fbe73bb6b-9406/
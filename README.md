![Build Status](https://gitlab.com/mlreef/frontend/badges/master/build.svg)

MLReef Frontend
====================
Please read the [Contribution Guidelines](CONTRIBUTE.md) carefully


Module Structure
--------------------
* **gitlab-api**: currently deprecated because of incompatibilities between kotlin-js and react.
* **web**: the npm based react frontend


Element styles and transitions
--------------------
Here is the XD file for the definitions of all elements: https://xd.adobe.com/spec/e23711b1-f385-4729-5034-632fbe73bb6b-9406/

**Color Pallette:**

<p>Deep dark (primary blue): #1D2B40</p>
<p>Almost white (base color, very light grey): #e5e5e5</p>
<p>Signal fire (red): #f5544d</p>
<p>Algae (green): #15B785</p>
<p>Sponge (yellow): #EABA44</p>
<p>Lagoon (light blue): #16ADCE</p>
<p>Less white (grey): #b2b2b2</p>

**Border Radius**
All border radius is: 0,3vw

Please also see "MLreef CD Guide" for detailed view of the corporate design features in MLreef.

Setup Developer Environment
--------------------
* Install Node (10.16.0 LTS)
  * Windows [link](https://nodejs.org/en/download/)
  * **OSX:**
  ```shell script
  # install homebrew
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  # use homebrew to install node
  brew install node`
  ```
* Install react scripts `npm install --global react-scripts`

For setting up the frontend dependencies you have to run: `./gradlew npm_install` on Linux and MacOSX, or `gradlew.bat npm_install` on Windows


Run Locally
--------------------
For running locally please refer to the web module's [README.md](web/README.md) 


Production build
--------------------
To build the frontend project use: `./gradlew npm_run_build`

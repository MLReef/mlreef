#!/usr/bin/env bash

echo "------------------------------------------------------------------------"
echo "                       MLREEF EPS: Setting Up"
echo "------------------------------------------------------------------------"
python --version
pip3 --version
python -m pip install --upgrade --force pip
pip install virtualenv
pip install --upgrade tensorflow


cd /bin/vergeml
pip install vergeml


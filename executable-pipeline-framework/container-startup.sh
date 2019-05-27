#!/usr/bin/env bash

echo "------------------------------------"
echo "       MLREEF EPS Starting"
echo "------------------------------------"
python --version
pip3 --version

# Switch Python to virtualenv "venv"
virtualenv venv --distribute
source venv/bin/activate

ml help
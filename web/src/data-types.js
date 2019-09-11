export const INT = "INT";
export const FLOAT = "FLOAT";
export const BOOL = "Boolean";
export const regExps = {"INT": /^[0-9]+$/, "FLOAT": /^-?\d*\.?\d*$/};
export const errorMessages = {
    INT: "Integer, value must be between 1 - 9999",
    FLOAT: "Required field or float type",
    BOOL: "Required filed or bool type"
};
export const mlreefFileContent = 
`# https://gitlab.com/gitlab-org/gitlab-ce/tree/master/lib/gitlab/ci/templates/Python.gitlab-ci.yml
image: python:3.7
#image: tensorflow/tensorflow:latest-py3

variables:
  # Change pip's cache directory to be inside the roject directory since we can only cache local items.
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

cache:
  key: one-key-to-rule-them-all-2
  paths:
    - .cache/pip
    - venv/
    
before_script:
  - git remote set-url origin https://\${CI_PUSH_USER}:\${CI_PUSH_TOKEN}@gitlab.com/mlreef/mlreef-demo.git
  - git config --global user.email "noreply@mlreef.com"
  - git config --global user.name "MLReef Data Pipeline"
  - python3 --version
  - pip3 --version
  - python -m pip install --upgrade --force pip
  - echo $PIP_CACHE_DIR
  # Switch Python to virtualenv "venv"
  - pip install virtualenv
  - virtualenv venv --distribute
  - source venv/bin/activate
  # Python libraries
  - pip install opencv-python
  - pip install tensorflow
  - pip install Keras
  - pip install Pillow
  
test:
  script:
    - pwd
    - ls -l
    - cd pipeline
#replace-here-new-lines
    - git checkout \${CI_COMMIT_REF_NAME}
    - echo \${CI_JOB_ID} >> ci_job_id
    - git add .
    - git commit -m "Add pipeline results [skip ci]"
    - git push`;
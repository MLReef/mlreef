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
`################################################################################
# This is the MLReef configuration file.                                       #
# It contains the current configuration of your model-experiment (training)    #
# as well as the temporary configurations executed data pipelines              #
################################################################################

# This is the docker image your model training will be executed in
image: registry.gitlab.com/mlreef/epf:latest

stages:
  - experiment

variables:
  # Change pip's cache directory to be inside the project directory since we can only cache local items.
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

cache:
  key: global-pip-cache
  paths:
    - .cache/pip
    - venv/

data-pipeline:
  stage: experiment
  before_script:
    - git remote set-url origin https://\${CI_PUSH_USER}:\${CI_PUSH_TOKEN}@gitlab.com/mlreef/sar-esa.git
    - git config --global user.email "noreply@mlreef.com"
    - git config --global user.name "MLReef Data Pipeline"
  script:
    - pwd
    - ls -al
#    - git checkout -b pipeline/\${CI_JOB_ID}
    - git checkout master
    - echo \${CI_JOB_ID} >> data_pipeline.info
    - python src/pipelines/lee_filter.py data/images_SAR/ 4
    - python src/pipelines/rotate.py data/images_SAR/ 90
    - python src/pipelines/augment.py data/images_SAR/ 2
#replace-here-the-lines
    - git add .
    - git status
    - git commit -m"Add pipeline results [skip ci]"
#    - git push --set-upstream origin pipeline/\${CI_JOB_ID}
    - git push
`;
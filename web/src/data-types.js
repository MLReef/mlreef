export const INT = "INT";
export const FLOAT = "FLOAT";
export const BOOL = "Boolean";
export const regExps = {"INT": /^[0-9]+$/, "FLOAT": /^-?\d*\.?\d*$/};
export const errorMessages = {
    INT: "Integer, value must be between 1 - 9.999",
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

variables:
  # Change pip's cache directory to be inside the project directory since we can only cache local items.
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"


# The before_script handles everything git related and sets up the automatic committing
before_script:
  - background-push &
  - export BG_PID=$!
  - echo "Background Commit PID $BG_PID"
  - git remote set-url origin https://\${GIT_PUSH_USER}:\${GIT_PUSH_TOKEN}@#repo-url


data-pipeline:
  script:
   #- git checkout -b #new-datainstance
   - echo \${CI_JOB_ID} >> data_pipeline.info
#replace-here-the-lines
   - git add .
   - git status
   - git commit -m "Add pipeline results [skip ci]"
   - git push
`;

export const domain = "gitlab.com"
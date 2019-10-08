export const INT = "INT";
export const FLOAT = "FLOAT";
export const BOOL = "Boolean";
export const regExps = {"INT": /^[0-9]+$/, "FLOAT": /^-?\d*\.?\d*$/};
export const STRING = "String";
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
  - git remote set-url origin https://\${GIT_PUSH_USER}:\${GIT_PUSH_TOKEN}@#repo-url
  - git config --global user.email "rainer+mlreefdemo@systemkern.com"
  - git config --global user.name "mlreefdemo"
  - export GITLAB_API_TOKEN="\${GIT_PUSH_TOKEN}"
  - export CI_COMMIT_REF_SLUG="\${CI_COMMIT_REF_SLUG}"
  - export CI_PROJECT_ID="\${CI_PROJECT_ID}"
  - export TARGET_BRANCH="#target-branch"
  - background-push &

#pipeline-operation-script-name:
  script:
   - git checkout -b #target-branch
   - echo \${CI_JOB_ID} >> data_pipeline.info
#replace-here-the-lines
   - git add .
   - git status
   - git commit -m "Add pipeline results [skip ci]"
   - git push --set-upstream origin #target-branch 
   - git push
`;

export const domain = "gitlab.com";

export const colorsForCharts = [
  "#f5544d",
  "#2db391",
  "#ffa000",
  "#311b92",
  "#00796b"
];

export const RUNNING = "running";
export const PENDING = "pending";
export const SUCCESS = "success";
export const FAILED = "failed";
export const CANCELED = "canceled";
export const SKIPPED = "skipped";

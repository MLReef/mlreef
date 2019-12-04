import 'babel-polyfill';
import { mlreefLinesToExtractConfiguration } from '../functions/dataParserHelpers';

const testDataDocument = `
################################################################################
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
  - git remote set-url origin https://\${GIT_PUSH_USER}:\${GIT_PUSH_TOKEN}@gitlab.com/mlreef/mlreef-demo.git
  - git config --global user.email "rainer+mlreefdemo@systemkern.com"
  - git config --global user.name "mlreefdemo"
  - git checkout master
  - export GITLAB_API_TOKEN="\${GIT_PUSH_TOKEN}"
  - export CI_COMMIT_REF_SLUG="\${CI_COMMIT_REF_SLUG}"
  - export CI_PROJECT_ID="\${CI_PROJECT_ID}"
  - export TARGET_BRANCH="data-instance/664e1c60"
  - background-push &

data-pipeline:
  script:
   - git checkout -b data-instance/664e1c60
   - echo \${CI_JOB_ID} >> data_pipeline.info
   - python /epf/pipelines/augment.py --images-path directory_1/ --iterations 2
   - git add .
   - git status
   - git commit -m "Add pipeline results [skip ci]"
   - git push --set-upstream origin data-instance/664e1c60 
   - git push
`;

const operationsArray = [{
  name: 'augment',
  params: [
    { name: 'iterations', value: '2' },
    { name: 'images-path', value: 'directory_1' },
  ],
}];

describe('operations and params', () => {
  test('assert that parsers reads operations and params from file', () => {
    const operationsAndParameters = mlreefLinesToExtractConfiguration(testDataDocument.split('\n'));
    expect(
      JSON.stringify(operationsAndParameters)
        === JSON.stringify(operationsArray),
    ).toBe(true);
  });
});

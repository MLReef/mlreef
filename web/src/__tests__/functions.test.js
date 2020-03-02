import 'babel-polyfill';
import { mlreefFileContent } from '../dataTypes';
import {
  parseMlreefConfigurationLines,
  parseDecimal,
} from '../functions/dataParserHelpers';
import {
  buildCommandLinesFromSelectedPipelines,
  generateRealContentFromTemplate,
} from '../functions/pipeLinesHelpers';

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

const dataOperationsSelected = [{
  title: 'Augment',
  username: 'Vaibhav_M',
  starCount: '243',
  index: 1,
  command: 'augment',
  description: 'Data augmentation multiplies and tweakes the data by changing angle of rotation, flipping the images, zooming in, etc.',
  showDescription: false,
  showAdvancedOptsDivDataPipeline: false,
  dataType: 'Images',
  params: {
    standard: [
      {
        name: 'Number of augmented images',
        dataType: 'INT',
        required: true,
        commandName: 'iterations',
      },
    ],
    advanced: [
      {
        name: 'Rotation range',
        dataType: 'FLOAT',
        required: false,
        commandName: 'rotation-range',
        standardValue: '0',
      },
      {
        name: 'Width shift range',
        dataType: 'FLOAT',
        required: false,
        commandName: 'width-shift-range',
        standardValue: '0',
      },
      {
        name: 'Height shift range',
        dataType: 'FLOAT',
        required: false,
        commandName: 'height-shift-range',
        standardValue: '0',
      },
      {
        name: 'Shear range',
        dataType: 'FLOAT',
        required: false,
        commandName: 'shear-range',
        standardValue: '0',
      },
      {
        name: 'Zoom range',
        dataType: 'FLOAT',
        required: false,
        commandName: 'zoom-range',
        standardValue: '0',
      },
      {
        name: 'Horizontal flip',
        dataType: 'Boolean',
        required: false,
        commandName: 'horizontal-flip',
        standardValue: 'false',
      },
      {
        name: 'Vertical flip',
        dataType: 'Boolean',
        required: false,
        commandName: 'vertical-flip',
        standardValue: 'false',
      },
    ],
  },
  inputValuesAndDataModels: [
    {
      id: 'param-0-item-data-operation-selected-form-1',
      value: '2',
      inputDataModel: {
        name: 'Number of augmented images',
        dataType: 'INT',
        required: true,
        commandName: 'iterations',
      },
    },
  ],
}];

const mockFilesArr = [{
  id: '7405cad8db781b166de002da8f996fe84049e100',
  name: 'directory_1',
  type: 'tree',
  path: 'directory_1',
  mode: '040000',
}];

describe('Read mlreef file', () => {
  test('assert that parsers read operations and params from file', () => {
    const operationsAndParameters = parseMlreefConfigurationLines(testDataDocument.split('\n'));
    expect(
      JSON.stringify(operationsAndParameters)
        === JSON.stringify(operationsArray),
    ).toBe(true);
  });
});


describe('Pipelines mlreef file generation', () => {
  test('assert that commands format is correct', () => {
    const expectedCommandsArr = [
      '   - python /epf/pipelines/augment.py --images-path directory_1/ --iterations 2',
    ];
    const generatedArrOfOperationCommands = buildCommandLinesFromSelectedPipelines(
      dataOperationsSelected,
      mockFilesArr,
      '/epf/pipelines',
    );
    generatedArrOfOperationCommands.forEach((opCommand, opCommandInd) => {
      const isEqual = expectedCommandsArr[opCommandInd] === opCommand;
      expect(isEqual).toBe(true);
    });
  });

  test('assert that content generated is replaced properly in the base mlreef file', () => {
    const expectedCommandsArr = [
      '   - python /epf/pipelines/augment.py --images-path directory_1/ --iterations 2',
    ];
    const httpUrlToRepo = 'https://gitlab.com/mlreef/mlreef-demo.git';
    const dataInstanceName = 'data-instance/019ead10';
    const branchSelected = 'master';
    const pipelineOpScriptName = 'data-pipeline';

    const finalMockContent = generateRealContentFromTemplate(
      mlreefFileContent,
      branchSelected,
      expectedCommandsArr,
      dataInstanceName,
      httpUrlToRepo,
      pipelineOpScriptName,
    );
    expect(finalMockContent.includes(expectedCommandsArr[0])).toBe(true);
    expect(finalMockContent.includes(pipelineOpScriptName)).toBe(true);
  });
});

describe('Parse decimal numbers', () => {
  test('not number should return the input', () => {
    const values = ['hello', null, undefined, true];

    const res = values
      .map((n) => n === parseDecimal(n))
      .every((r) => r === true);

    expect(res).toBe(true);
  });

  test('parse correctly common values', () => {
    const values = [
      { original: 123456789, expected: 123456789 },
      { original: 123456.789234578, expected: 123456 },
      { original: 34.5678976, expected: 34.568 },
      { original: 0.0034567, expected: 0.0035 },
      { original: 0.000000434, expected: 0.0001 },
      { original: '456.78923', expected: 456.79 },
    ];

    const res = values
      .map(({ original, expected }) => expected === parseDecimal(original))
      .every((r) => r === true);

    expect(res).toBe(true);
  });
});

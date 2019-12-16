export const INT = 'INT';
export const FLOAT = 'FLOAT';
export const BOOL = 'Boolean';
export const regExps = { INT: /^[0-9]+$/, FLOAT: /^-?\d*\.?\d*$/ };
export const STRING = 'String';
export const errorMessages = {
  INT: 'Integer, value must be between 1 - 9.999',
  FLOAT: 'Required field or float type',
  BOOL: 'Required filed or bool type',
};
export const mlreefFileContent = `################################################################################
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
  - git checkout #initialBranch
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

export const domain = 'gitlab.com';

export const colorsForCharts = [
  '#f5544d',
  '#2db391',
  '#ffa000',
  '#311b92',
  '#00796b',
];

export const RUNNING = 'running';
export const PENDING = 'pending';
export const SUCCESS = 'success';
export const FAILED = 'failed';
export const CANCELED = 'canceled';
export const SKIPPED = 'skipped';

export const dataPipeLines = [{
  title: 'Augment',
  username: 'Vaibhav_M',
  starCount: '243',
  index: 1,
  command: 'augment',
  description:
      'Data augmentation multiplies and tweakes the data by changing angle of rotation, flipping the images, zooming in, etc.',
  showDescription: false,
  showAdvancedOptsDivDataPipeline: false,
  dataType: 'Images',
  params: {
    standard: [{
      name: 'Number of augmented images', dataType: INT, required: true, commandName: 'iterations',
    }],
    advanced: [
      {
        name: 'Rotation range', dataType: FLOAT, required: false, commandName: 'rotation-range', standardValue: '0',
      },
      {
        name: 'Width shift range', dataType: FLOAT, required: false, commandName: 'width-shift-range', standardValue: '0',
      },
      {
        name: 'Height shift range', dataType: FLOAT, required: false, commandName: 'height-shift-range', standardValue: '0',
      },
      {
        name: 'Shear range', dataType: FLOAT, required: false, commandName: 'shear-range', standardValue: '0',
      },
      {
        name: 'Zoom range', dataType: FLOAT, required: false, commandName: 'zoom-range', standardValue: '0',
      },
      {
        name: 'Horizontal flip', dataType: BOOL, required: false, commandName: 'horizontal-flip', standardValue: 'false',
      },
      {
        name: 'Vertical flip', dataType: BOOL, required: false, commandName: 'vertical-flip', standardValue: 'false',
      },
    ],
  },
},
{
  title: 'Random crop',
  username: 'Vaibhav_M',
  starCount: '201',
  index: 2,
  command: 'random_crop',
  description:
      `This pipeline operation randomly crops a NxM (height x width) portion of the given dataset. 
      This is used to randomly extract parts of the image incase we need to remove bias present in image data.`,
  showDescription: false,
  showAdvancedOptsDivDataPipeline: false,
  dataType: 'Text',
  params: {
    standard: [
      {
        name: 'Height', dataType: INT, required: true, commandName: 'height',
      },
      {
        name: 'Width', dataType: INT, required: true, commandName: 'width',
      },
      {
        name: 'Channels', dataType: INT, required: true, commandName: 'channels', standardValue: '3',
      },
    ],
    advanced: [
      {
        name: 'Random Seed', dataType: INT, required: false, commandName: 'seed', standardValue: 'None',
      },
    ],
  },
},
{
  title: 'Lee filter',
  username: 'RK_ESA',
  starCount: '126',
  index: 4,
  command: 'lee_filter',
  description:
      `The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, 
      thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to 
      smoothen the static-like noise present in these images`,
  showDescription: false,
  showAdvancedOptsDivDataPipeline: false,
  dataType: 'Something Else',
  params: {
    standard: [
      {
        name: 'Intensity', dataType: INT, required: true, commandName: 'intensity',
      },
    ],
  },
}];

export const experiments = [
  {
    title: 'Resnet 50',
    username: 'Keras',
    starCount: '243',
    index: 1,
    command: 'resnet50',
    description: 'ResNet50 is a 50 layer Residual Network.',
    showDescription: false,
    showAdvancedOptsDivDataPipeline: false,
    dataType: 'Images',
    params: {
      standard: [
        {
          name: 'output_path', dataType: STRING, required: true, commandName: 'output-path',
        },
        {
          name: 'input_height', dataType: INT, required: true, commandName: 'height',
        },
        {
          name: 'input_width', dataType: INT, required: true, commandName: 'width',
        },
        {
          name: 'epochs', dataType: FLOAT, required: true, commandName: 'epochs', standardValue: '35',
        },
      ],
      advanced: [
        {
          name: 'channels', dataType: INT, required: false, commandName: 'channels', standardValue: 3,
        },
        {
          name: 'Use pre-trained', dataType: BOOL, required: false, commandName: 'use-pretrained', standardValue: 'true',
        },
        {
          name: 'batch-size', dataType: FLOAT, required: false, commandName: 'batch_size', standardValue: '32',
        },
        {
          name: 'validation-split', dataType: FLOAT, required: false, commandName: 'validation_split', standardValue: '0.25',
        },
        {
          name: 'class_mode', dataType: FLOAT, required: false, commandName: 'class_mode', standardValue: 'categorical',
        },
        {
          name: 'learning-rate', dataType: FLOAT, required: false, commandName: 'learning_rate', standardValue: '0.0001',
        },
        {
          name: 'loss', dataType: FLOAT, required: false, commandName: 'loss', standardValue: 'categorical_crossentropy',
        },
      ],
    },
  },
];


export const dataVisualizations = [
  {
    title: 't-SNE',
    username: 'Vaibhav_M',
    starCount: '301',
    index: 1,
    command: 'tsne',
    description:
            'No description yet',
    showDescription: false,
    showAdvancedOptsDivDataPipeline: false,
    dataType: 'Images',
    params: {
      standard: [{
        name: 'Output path', dataType: INT, required: true, commandName: 'output_path',
      }],
      advanced: [
        {
          name: 'num_dimensions', dataType: INT, required: false, commandName: 'num_dimensions',
        },
        {
          name: 'perplexity', dataType: FLOAT, required: false, commandName: 'perplexity',
        },
        {
          name: 'learning_rate', dataType: FLOAT, required: false, commandName: 'learning_rate',
        },
        {
          name: 'max_iter', dataType: FLOAT, required: false, commandName: 'max_iter',
        },
      ],
    },
  },
];


export const filesForExperimentsDetails = [
  {
    param: 'param1',
    value: 'value1',
    description: 'description',
  },
  {
    param: 'param2',
    value: 'value2',
    description: 'description',
  },
  {
    param: 'param3',
    value: 'value3',
    description: 'description',
  },
];

/**
 * Gitlab actions
 */
export const CREATE = 'create';
export const DELETE = 'delete';
export const MOVE = 'move';
export const UPDATE = 'update';
export const CHMOD = 'chmod';

/*-----------------------------------------*/

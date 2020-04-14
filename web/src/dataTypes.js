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

# source-branch-name:#source-branch

# This is the docker image your model training will be executed in
image: registry.gitlab.com/mlreef/epf:latest

variables:
  # Change pip's cache directory to be inside the project directory since we can only cache local items.
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"


# The before_script handles everything git related and sets up the automatic committing
before_script:
  - git remote set-url origin http://$GIT_PUSH_USER:$GIT_PUSH_TOKEN@#repo-url
  - git config --global user.email "$GIT_USER_EMAIL"
  - git config --global user.name "$GIT_PUSH_USER"
  - export GITLAB_API_TOKEN="$GIT_PUSH_TOKEN"
  - export CI_COMMIT_REF_SLUG="\${CI_COMMIT_REF_SLUG}"
  - export CI_PROJECT_ID="\${CI_PROJECT_ID}"
  - export TARGET_BRANCH=$CI_COMMIT_REF_NAME
  - git checkout $CI_COMMIT_REF_NAME
  - background-push &
  - echo \${CI_JOB_ID} >> data_pipeline.info

after_script:
   - git add .
   - git status
   - git commit -m "Add pipeline results [skip ci]"
   - git push --set-upstream origin $CI_COMMIT_REF_NAME
   - git push


#pipeline-operation-script-name:
  artifacts:
    paths:
      - amigo.txt
  script:
    - echo "Uploading Artifacts Works" >> amigo.txt
#pipeline-script
`;

export const colorsForCharts = [
  '#f5544d',
  '#2db391',
  '#ffa000',
  '#311b92',
  '#00796b',
];

/* ------------------------- Statuses for pipelines ------------------------- */

export const RUNNING = 'running';
export const PENDING = 'pending';
export const SUCCESS = 'success';
export const FAILED = 'failed';
export const CANCELED = 'canceled';
export const SKIPPED = 'skipped';
export const EXPIRED = 'expired';

/* ------------------------- ---------------------- ------------------------- */

/*
  Adjectives and Nouns for Random Name Generation
*/

export const Adjectives = ['clever', 'active', 'alive', 'alert', 'amused', 'awake', 'balanced', 'beloved', 'better', 'big', 'bold', 'casual',
  'busy', 'certain', 'calm', 'charming', 'childish', 'civil', 'clean', 'clear', 'clumsy', 'comic', 'cute', 'dear', 'deep', 'desired', 'devoted',
  'elegant', 'epic', 'eternal', 'evolved', 'exact', 'excited', 'exotic', 'expert', 'firm', 'fair', 'flexible', 'fit', 'flashy', 'frank', 'full',
  'flying', 'fresh', 'funny', 'famous', 'gentle', 'generous', 'glowing', 'handy', 'happy', 'harmless', 'healthy', 'heroic', 'hip', 'holy', 'honest',
  'hot', 'huge', 'humble', 'immortal', 'improved', 'infinite', 'inspired', 'intense', 'just', 'keen', 'kind', 'knowing', 'large', 'lasting', 'legal',
  'liberal', 'light', 'literate', 'magical', 'major', 'mint', 'modern', 'modest', 'moved', 'musical', 'native', 'natural', 'neat', 'new', 'nice',
  'noble', 'normal', 'optimum', 'outgoing', 'patient', 'peaceful', 'perfect', 'pleasent', 'pleased', 'poetic', 'polite', 'positive', 'popular',
  'powerful', 'precise', 'premium', 'pretty', 'pro', 'profound', 'proper', 'proud', 'pure', 'quick', 'quiet', 'rapid', 'rare', 'ready', 'real',
  'regular', 'related', 'relaxed', 'renweing', 'resolved', 'rich', 'romantic', 'sacred', 'sensible', 'shaky', 'sharp', 'simple', 'skilled', 'smart',
  'smiling', 'smooth', 'social', 'solid', 'sound', 'special', 'splendid', 'stable', 'steady', 'still', 'sunny', 'super', 'sweet', 'tender',
  'thankful', 'tidy', 'tight', 'top', 'touched', 'well', 'vast', 'wanted', 'warm', 'willing', 'wired', 'corona-virus-infected'];

export const Nouns = ['dolphin', 'barracuda', 'starfish', 'scubadiver', 'plancton', 'ariel', 'nemo', 'anchovy', 'whale', 'shark', 'clownfish',
  'cod', 'coral', 'eel', 'seal', 'shrimp', 'flounder', 'squid', 'herring', 'jellyfish', 'dory', 'krill', 'lobster', 'ray', 'megalodon', 'manatee',
  'warwhal', 'nautilus', 'octopus', 'oyster', 'plankton', 'prawn', 'pufferfish', 'sponge', 'swordfish', 'walrus', 'tuna', 'crab', 'algae', 'kraken',
  'nessie', 'siren', 'moby-dick'];

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
    standard:
    [
      {
        name: 'Number of augmented images',
        dataType: INT,
        required: true,
        commandName: 'iterations',
        comment: 'The comment for Number of augmented images',
      },
    ],
    advanced:
    [
      {
        name: 'Rotation range',
        dataType: FLOAT,
        required: false,
        commandName: 'rotation-range',
        standardValue: '0',
        comment: 'The comment for Rotation range',
      },
      {
        name: 'Width shift range',
        dataType: FLOAT,
        required: false,
        commandName: 'width-shift-range',
        standardValue: '0',
      },
      {
        name: 'Height shift range',
        dataType: FLOAT,
        required: false,
        commandName: 'height-shift-range',
        standardValue: '0',
        comment: 'The comment for Height shift range',
      },
      {
        name: 'Shear range',
        dataType: FLOAT,
        required: false,
        commandName: 'shear-range',
        standardValue: '0',
        comment: 'The comment for Shear range',
      },
      {
        name: 'Zoom range',
        dataType: FLOAT,
        required: false,
        commandName: 'zoom-range',
        standardValue: '0',
        comment: 'The comment for Zoom range',
      },
      {
        name: 'Horizontal flip',
        dataType: BOOL,
        required: false,
        commandName: 'horizontal-flip',
        standardValue: 'false',
        comment: 'The comment for Horizontal flip',
      },
      {
        name: 'Vertical flip',
        dataType: BOOL,
        required: false,
        commandName: 'vertical-flip',
        standardValue: 'false',
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
        name: 'Width',
        dataType: INT,
        required: true,
        commandName: 'width',
        comment: 'The comment for Width.',
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
    title: 'Dummy Pipeline',
    username: 'Keras',
    starCount: '243',
    index: 1,
    command: 'debug_dataprocessor',
    description: 'debug_dataprocessor uses epochs=8 and batch_size=5 for debugging',
    showDescription: false,
    showAdvancedOptsDivDataPipeline: false,
    dataType: 'Images',
    params: {
      standard: [
        {
          name: 'epochs', dataType: INT, required: true, commandName: 'epochs',
        },
        {
          name: 'batch_size', dataType: INT, required: true, commandName: 'batch_size',
        },
      ],
      advanced: [],
    },
  },
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
        name: 'Output path', dataType: STRING, required: true, commandName: 'output_path',
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


/**
 * Merge req states
*/

export const mrStates = [
  'opened',
  'closed',
  'merged',
];


/* -------------------------- Project classifications -------------------------- */

export const ML_PROJECT = 'ml-project';
export const MODEL = 'model';
export const DATA_OPERATION = 'data-operation';
export const DATA_VISUALIZATION = 'data-visualization';

export const projectClassificationsProps = [
  { classification: ML_PROJECT, label: 'ML Project', color: '#91BD44' },
  { classification: MODEL, label: 'Model', color: '#E99444' },
  { classification: DATA_OPERATION, label: 'Data Operation', color: '#D2519D' },
  { classification: DATA_VISUALIZATION, label: 'Data visualization', color: '#735DA8' },
];

/* -------------------------- ------------- -------------------------- */

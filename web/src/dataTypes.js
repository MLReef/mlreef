import lock from 'images/lock-01.png';
import global from 'images/global-01.png';

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

export const colorsForCharts = [
  '#f5544d',
  '#2db391',
  '#ffa000',
  '#311b92',
  '#00796b',
];

/* ------------------------- Statuses for pipelines ------------------------- */

export const RUNNING = 'RUNNING';
export const PENDING = 'PENDING';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const CANCELED = 'CANCELED';
export const SKIPPED = 'SKIPPED';
export const EXPIRED = 'EXPIRED';

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


/* the next array is to contain global characters banned for urls */

export const bannedCharsArray = ['..', '~', '^', ':', '\\', '{', '}', '[', ']', '$', '#', '&', '%', '*', '+', '¨', '"', '!'];

/* -------------------------- Project classifications -------------------------- */

export const ML_PROJECT = 'ml-project';
export const MODEL = 'model';
export const DATA_OPERATION = 'data-operation';
export const DATA_VISUALIZATION = 'data-visualization';

export const projectClassificationsProps = [{
    classification: ML_PROJECT,
    label: 'ML Project',
    color: '#91BD44',
    description: `A Machine Learning (ML) project is where you house your data set (repository),
    where you perform data processing (data pipeline), visualize your data set (data visualization)
    and where you create your experiments`
  },
  { classification: MODEL, label: 'Model', color: '#E99444',
    description: `
    A machine learning(ML) model is an algorithm that can be trained
    with data to be a mathematical representation of a real-world process. 

    Create a model repository to use it in your experiment pipelines and publishing it. 
    You can find detailed instructions how to create models in MLReef in the documentation
    `
   },
  { 
    classification: DATA_OPERATION, 
    label: 'Data Operation', 
    color: '#D2519D',
    description: `A data operation transforms your data in a data pre-processing pipeline. 
    It is a script that need input data to create output data. 

    You can find detailed instructions how to create data operations in the documentation
    `
  },
  { 
    classification: DATA_VISUALIZATION, 
    label: 'Data visualization', 
    color: '#735DA8',
    description: `A data visualization create undestandable representations of the structure in your data. 
    The output are plots and graphs. 

    You can find detailed instructions how to create data visualizations in the documentation.
    `
  },
];

/* -------------------------- ------------- -------------------------- */


/* -------------------------- The next are access levels implemented by Gitlab -------------------------- */

export const privacyLevelsArr = [
  {
    name: 'Private',
    value: 'private',
    message: 'The #protected-element access must be granted explicitly to every user.',
    icon: lock,
  },
  {
    name: 'Public',
    value: 'public',
    message: 'The #protected-element can be accessed without any authentication.',
    icon: global,
  },
];

/* -------------------------- Types of Processors -------------------------- */
export const OPERATION = 'OPERATION';
export const ALGORITHM = 'ALGORITHM';
export const VISUALISATION = 'VISUALISATION';

/* --------------------------  ----------------------------------------------- -------------------------- */

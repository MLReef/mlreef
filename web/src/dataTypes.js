import lock from "images/lock-01.png";
import global from "images/global-01.png";
import { PROJECT_DATA_TYPES } from "domain/project/ProjectDataTypes";
import { PROJECT_TYPES } from "domain/project/projectTypes";

export const INTEGER = "INTEGER";
export const FLOAT = "FLOAT";
export const BOOLEAN = "BOOLEAN";
export const regExps = { INT: /^[0-9]+$/, FLOAT: /^-?\d*\.\d*$/ };
export const STRING = "STRING";
export const errorMessages = {
  INTEGER: "The value should be an integer number",
  FLOAT: "The value should be a floating number",
  BOOLEAN: "This parameter can be true or false only.",
  STRING: "This is not a valid entry for this parameter",
};

export const colorsForCharts = [
  "#f5544d",
  "#2db391",
  "#ffa000",
  "#311b92",
  "#00796b",
];

/* ------------------------- Visibility scopes ------------------------- */

export const PUBLIC = "PUBLIC";
export const PRIVATE = "PRIVATE";

/* ------------------------- Statuses for pipelines ------------------------- */

export const RUNNING = "running";
export const PENDING = "pending";
export const SUCCESS = "success";
export const FAILED = "failed";
export const CANCELED = "canceled";
export const SKIPPED = "skipped";
export const EXPIRED = "expired";

/* ------------------------- ---------------------- ------------------------- */

/*
  Adjectives and Nouns for Random Name Generation
*/

export const Adjectives = [
  "clever",
  "active",
  "alive",
  "alert",
  "amused",
  "awake",
  "balanced",
  "beloved",
  "better",
  "big",
  "bold",
  "casual",
  "busy",
  "certain",
  "calm",
  "charming",
  "childish",
  "civil",
  "clean",
  "clear",
  "clumsy",
  "comic",
  "cute",
  "dear",
  "deep",
  "desired",
  "devoted",
  "elegant",
  "epic",
  "eternal",
  "evolved",
  "exact",
  "excited",
  "exotic",
  "expert",
  "firm",
  "fair",
  "flexible",
  "fit",
  "flashy",
  "frank",
  "full",
  "flying",
  "fresh",
  "funny",
  "famous",
  "gentle",
  "generous",
  "glowing",
  "handy",
  "happy",
  "harmless",
  "healthy",
  "heroic",
  "hip",
  "holy",
  "honest",
  "hot",
  "huge",
  "humble",
  "immortal",
  "improved",
  "infinite",
  "inspired",
  "intense",
  "just",
  "keen",
  "kind",
  "knowing",
  "large",
  "lasting",
  "legal",
  "liberal",
  "light",
  "literate",
  "magical",
  "major",
  "mint",
  "modern",
  "modest",
  "moved",
  "musical",
  "native",
  "natural",
  "neat",
  "new",
  "nice",
  "noble",
  "normal",
  "optimum",
  "outgoing",
  "patient",
  "peaceful",
  "perfect",
  "pleasent",
  "pleased",
  "poetic",
  "polite",
  "positive",
  "popular",
  "powerful",
  "precise",
  "premium",
  "pretty",
  "pro",
  "profound",
  "proper",
  "proud",
  "pure",
  "quick",
  "quiet",
  "rapid",
  "rare",
  "ready",
  "real",
  "regular",
  "related",
  "relaxed",
  "renweing",
  "resolved",
  "rich",
  "romantic",
  "sacred",
  "sensible",
  "shaky",
  "sharp",
  "simple",
  "skilled",
  "smart",
  "smiling",
  "smooth",
  "social",
  "solid",
  "sound",
  "special",
  "splendid",
  "stable",
  "steady",
  "still",
  "sunny",
  "super",
  "sweet",
  "tender",
  "thankful",
  "tidy",
  "tight",
  "top",
  "touched",
  "well",
  "vast",
  "wanted",
  "warm",
  "willing",
  "wired",
  "corona-virus-infected",
];

export const Nouns = [
  "dolphin",
  "barracuda",
  "starfish",
  "scubadiver",
  "plancton",
  "ariel",
  "nemo",
  "anchovy",
  "whale",
  "shark",
  "clownfish",
  "cod",
  "coral",
  "eel",
  "seal",
  "shrimp",
  "flounder",
  "squid",
  "herring",
  "jellyfish",
  "dory",
  "krill",
  "lobster",
  "ray",
  "megalodon",
  "manatee",
  "warwhal",
  "nautilus",
  "octopus",
  "oyster",
  "plankton",
  "prawn",
  "pufferfish",
  "sponge",
  "swordfish",
  "walrus",
  "tuna",
  "crab",
  "algae",
  "kraken",
  "nessie",
  "siren",
  "moby-dick",
];

/**
 * Gitlab actions
 */
export const CREATE = "create";
export const DELETE = "delete";
export const MOVE = "move";
export const UPDATE = "update";
export const CHMOD = "chmod";

/*-----------------------------------------*/

/**
 * Merge req states
 */

export const mrStates = ["opened", "closed", "merged"];

/* the next array is to contain global characters banned for urls */

export const bannedCharsArray = [
  "..",
  "~",
  "^",
  ":",
  "\\",
  "{",
  "}",
  "[",
  "]",
  ")",
  "(",
  "$",
  "#",
  "&",
  "%",
  "*",
  "+",
  ",",
  "¨",
  '"',
  "!",
];

/* -------------------------- Types of Processors -------------------------- */
export const OPERATION = "OPERATION";
export const ALGORITHM = "ALGORITHM";
export const VISUALIZATION = "VISUALIZATION";

/* -------------------------- Project classifications -------------------------- */

export const ML_PROJECT = "ml-project";
export const MODEL = "model";
export const DATA_OPERATION = "data-operation";
export const DATA_VISUALIZATION = "data-visualization";

export const projectClassificationsProps = [
  {
    classification: ML_PROJECT,
    searchableType: PROJECT_TYPES.DATA,
    label: 'ML Project',
    color: '#91BD44',
    description: `A Machine Learning (ML) project is where all real magic happens. Store and manage
      your data, run data and experiment pipelines and manage your models.`,
  },
  {
    classification: MODEL,
    typeOfProcessor: ALGORITHM,
    searchableType: PROJECT_TYPES.ALGORITHM,
    label: "Model",
    color: "#E99444",
    description: `A Model is an AI Module that hosts and stores your algorithms. Published models can be used
    in the experiment pipeline in "ML Projects".`,
  },
  {
    classification: DATA_OPERATION,
    typeOfProcessor: OPERATION,
    searchableType: PROJECT_TYPES.OPERATION,
    label: "Data Operation",
    color: "#D2519D",
    description: `A Data Operation transforms your data in a data pre-processing pipeline.
    It is a script that needs input data to create new output data.

    Use published Data Operations in Data Ops pipelines contained in the data tab within
    "ML Projects".`,
  },
  {
    classification: DATA_VISUALIZATION,
    typeOfProcessor: VISUALIZATION,
    searchableType: PROJECT_TYPES.VISUALIZATION,
    label: 'Data Visualization',
    color: "#735DA8",
    description: `A Data Visualization creates understandable representations of the structure in your data.
    The output can be plots, charts or any other form of visual output.

    To use Data Visualizations, publish your AI Module and use it in the data visualization pipeline
    in the data tab within "ML Projects".`,
  },
];

/* -------------------------- ------------- -------------------------- */

/* -------------------------- The next are access levels implemented by Gitlab -------------------------- */

export const privacyLevelsArr = [
  {
    label: 'Public',
    subLabel: 'The project can be accessed without any authentification.',
    color: 'var(--info)',
    value: 'public',
    icon: '/images/public-01.svg',
  },
  {
    label: 'Private',
    subLabel: 'Project access must be granted explicitly for every user.',
    color: 'var(--danger)',
    value: 'private',
    icon: '/images/Lock-01.svg',
  },
];

/* --------------------------  ------------------------------------- ------------------*/

export const PIPELINE_VIEWS_FORMAT = "DD/MM - hh:mm";

export const dataTypesMetadata = [
  {
    label: "Any",
    dataTypeName: PROJECT_DATA_TYPES.ANY,
    icon: "fas fa-archive",
  },
  {
    label: "Audio",
    dataTypeName: PROJECT_DATA_TYPES.AUDIO,
    icon: "fa fa-volume-up t-info",
  },
  {
    label: "Bin",
    dataTypeName: PROJECT_DATA_TYPES.BINARY,
    icon: "fas fa-barcode t-info",
  },
  { label: "None", dataTypeName: PROJECT_DATA_TYPES.NONE, icon: "" },
  {
    label: "Hier",
    dataTypeName: PROJECT_DATA_TYPES.HIERARCHICAL,
    icon: "fas fa-sitemap t-info",
  },
  {
    label: "Image",
    dataTypeName: PROJECT_DATA_TYPES.IMAGE,
    icon: "fas fa-images",
    style: { color: "#D2519D" },
  },
  {
    label: "Tabular",
    dataTypeName: PROJECT_DATA_TYPES.TABULAR,
    icon: "fas fa-grip-lines-vertical t-warning",
  },
  {
    label: "Text",
    dataTypeName: PROJECT_DATA_TYPES.TEXT,
    icon: "fa fa-file t-success",
  },
  {
    label: "T.Series",
    dataTypeName: PROJECT_DATA_TYPES.TIME_SERIES,
    icon: "fas fa-hourglass-end",
    style: { color: "#D2519D" },
  },
  {
    label: "Video",
    dataTypeName: PROJECT_DATA_TYPES.VIDEO,
    icon: "fa fa-video t-danger",
  },
  {
    label: "Model",
    dataTypeName: PROJECT_DATA_TYPES.MODEL,
    icon: "fas fa-project-diagram",
    style: { color: "#D2519D" },
  },
  {
    label: "Number",
    dataTypeName: PROJECT_DATA_TYPES.NUMBER,
    icon: "fas fa-calculator t-info",
  },
];

export const MLPaths = [
  "/dashboard/public/data_project",
  "/dashboard/starred/data_project",
  "/dashboard/my-repositories/data_project",
];
export const AIPaths = [
  "/dashboard/public/algorithm",
  "/dashboard/public/operation",
  "/dashboard/public/visualization",
  "/dashboard/starred/algorithm",
  "/dashboard/starred/operation",
  "/dashboard/starred/visualization",
  "/dashboard/my-repositories/algorithm",
  "/dashboard/my-repositories/operation",
  "/dashboard/my-repositories/visualization",
];

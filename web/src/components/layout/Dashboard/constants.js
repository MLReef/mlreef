import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

export const dataTypes = [
  { label: TEXT },
  { label: IMAGE },
  { label: AUDIO },
  { label: VIDEO },
  { label: TABULAR },
  { label: NUMBER },
  { label: BINARY },
  { label: MODEL },
  { label: HIERARCHICAL },
  { label: TIME_SERIES },
];

export const sortingOPtions = [
  { label: 'All', value: 0 },
  { label: 'Most stars', value: 1 },
];

export const publishedStateOptions = [
  { label: 'All', value: 0 },
  { label: 'Published', value: 1 },
  { label: 'Not published', value: 2 },
];

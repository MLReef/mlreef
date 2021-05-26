import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

export const dtypes = [
  IMAGE,
  TEXT,
  AUDIO,
  VIDEO,
  NUMBER,
  BINARY,
  MODEL,
  TABULAR,
  HIERARCHICAL,
  TIME_SERIES,
];

export const buildBody = (
  name, ownDataOpsOnly, namespace, starredOpsOnly, numberOfStars, dtypesSelected,
) => {
  let body = {
    published: true,
  };

  if (ownDataOpsOnly) {
    body = {
      ...body,
      namespace,
    };
  }

  if (starredOpsOnly) {
    body = {
      ...body,
      min_stars: numberOfStars,
    };
  }

  if (dtypesSelected.length > 0) {
    body = {
      ...body,
      input_data_types_or: dtypesSelected,
    };
  }

  if (name) {
    body = {
      ...body,
      name,
    };
  }

  return body;
};

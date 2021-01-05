import { ALGORITHM, DATA_OPERATION, MODEL, OPERATION, VISUALIZATION } from "dataTypes";

export const getSearchable = (feSearchableTypes) => {
  switch (feSearchableTypes) {
    case DATA_OPERATION:
      return OPERATION;
    case MODEL:
      return ALGORITHM;
    default:
      return VISUALIZATION;
  }
}
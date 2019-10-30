import {
  INT, FLOAT, regExps, BOOL,
} from '../dataTypes';

export const validateInput = (value, dataType, required) => {
  if (required && (typeof (value) === undefined || value.length === 0)) return false;
  if (value.length === 0) return true;

  switch (dataType) {
    case INT:
      return regExps.INT.test(value);
    case FLOAT:
      return regExps.FLOAT.test(value);
    case BOOL:
      return (value === 'true') || (value === 'false');
    default:
      return true;
  }
};

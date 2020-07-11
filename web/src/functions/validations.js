import {
  INT, FLOAT, regExps, BOOL, bannedCharsArray
} from '../dataTypes';

export default (value, dataType, required) => {
  if (required && (value === '' || (typeof (value) === 'undefined' || value.length === 0))) return false;
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

export const validateProjectName = (text) => {
  let bannedCharCount = 0;

  bannedCharsArray.forEach((char) => {
    if (text.startsWith(char) || text.startsWith('.') || text.startsWith('-') || text.startsWith(' ')) {
      return false;
    }
    if (text.includes(char)) {
      bannedCharCount += 1;
    }
  });

  return bannedCharCount === 0;
};

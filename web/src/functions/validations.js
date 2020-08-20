import {
  INTEGER, FLOAT, regExps, BOOLEAN, bannedCharsArray, STRING,
} from '../dataTypes';

export default (value, dataType, required) => {
  if (required && (!value || value === '')) return false;
  if (value === '') return true;
  switch (dataType) {
    case INTEGER:
      return regExps.INT.test(value);
    case FLOAT:
      return regExps.FLOAT.test(value) && !Number.isNaN(Number.parseFloat(value));
    case BOOLEAN:
      return (value?.toLowerCase() === 'true') || (value?.toLowerCase() === 'false');
    case STRING:
      return true;
    default:
      throw new Error('Not supported datatype');
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

export function isJson(item) {
  const stringItem = typeof item === 'string'
    ? item
    : JSON.stringify(item);
  let parsedItem;
  try {
    parsedItem = JSON.parse(stringItem);
  } catch (e) {
    return false;
  }

  if (typeof parsedItem === 'object' && parsedItem !== null) {
    return true;
  }

  return false;
}

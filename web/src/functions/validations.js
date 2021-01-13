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

/**
 * 
 * @param {*} files: files selected as input for data ops.
 * @param {*} dataProcessors: operators which will process files.
 */

export const validateForm = (files, dataProcessors) => {
  if (!dataProcessors || dataProcessors?.length === 0) {
    return false;
  }

  if (!files || files?.length === 0) {
    return false;
  }

  const invalidParamsCount = dataProcessors
    .map((dp) => dp.parameters.filter((param) => !param.isValid).length)
    .reduce((a, b) => a + b);
  return invalidParamsCount === 0;
}


export const validateBranchName = (branchName) => {
  if (!branchName.length > 0) {
    return false;
  }

  if (branchName.startsWith('-')) {
    return false;
  }
  let bannedCharCount = 0;

  if (/^(new|new-branch)$/.test(branchName)) {
    bannedCharCount += 1;
  }

  
  bannedCharsArray.forEach((char) => {
    if (branchName.includes(char)) {
      bannedCharCount += 1;
    }
  });

  return bannedCharCount === 0;
}
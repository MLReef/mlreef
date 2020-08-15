import validateInputs, { validateProjectName } from 'functions/validations';
import { parseDecimal } from '../functions/dataParserHelpers';
import { STRING, FLOAT, INTEGER, BOOLEAN } from 'dataTypes';

describe('Parse decimal numbers', () => {
  test('not number should return the input', () => {
    const values = ['hello', null, undefined, true];

    const res = values
      .map((n) => n === parseDecimal(n))
      .every((r) => r === true);

    expect(res).toBe(true);
  });

  test('parse correctly common values', () => {
    const values = [
      { original: 123456789, expected: 123456789 },
      { original: 123456.789234578, expected: 123456 },
      { original: 34.5678976, expected: 34.568 },
      { original: 0.0034567, expected: 0.0035 },
      { original: 0.000000434, expected: 0.0001 },
      { original: 456.78923, expected: 456.79 },
    ];

    const res = values
      .map(({ original, expected }) => expected === parseDecimal(original))
      .every((r) => r === true);

    expect(res).toBe(true);
  });
});

describe('Validate project names', () => {
  test('assert that function validates properly', () => {
    expect(validateProjectName('[wrong-name:project]')).toBe(false);
    expect(validateProjectName('right-project-name')).toBe(true);
  });
});

describe('Validate inputs in data ops', () => {
  test('assert that invalid strings are noit accepted', () => {
    expect(validateInputs('', STRING, true)).toBe(false);
    expect(validateInputs(null, STRING, true)).toBe(false);
    expect(validateInputs(undefined, STRING, true)).toBe(false);
    expect(validateInputs('', STRING, false)).toBe(true);
    expect(validateInputs('Some valid string', STRING, true)).toBe(true);
  });
  test('assert that the float format and required param are tested correctly', () => {
    expect(validateInputs('9', FLOAT, true)).toBe(false);
    expect(validateInputs('', FLOAT, true)).toBe(false);
    expect(validateInputs('rewreffwef', FLOAT, false)).toBe(false);
    expect(validateInputs('9.9', FLOAT, true)).toBe(true);
    expect(validateInputs(9.9, FLOAT, true)).toBe(true);
    expect(validateInputs('909909.9787897', FLOAT, true)).toBe(true);
  });
  test('assert that the integer format and required param are tested correctly', () => {
    expect(validateInputs('', INTEGER, true)).toBe(false);
    expect(validateInputs('rewreffwef', INTEGER, false)).toBe(false);
    expect(validateInputs('9.9', INTEGER, true)).toBe(false);
    expect(validateInputs('9', INTEGER, true)).toBe(true);
    expect(validateInputs(9, INTEGER, true)).toBe(true);
  });

  test('assert that the booleans are true or false', () => {
    expect(validateInputs('', BOOLEAN, true)).toBe(false);
    expect(validateInputs('true', BOOLEAN, true)).toBe(true);
    expect(validateInputs('false', BOOLEAN, true)).toBe(true);
  });

  test('assert that validations function does not accept any datatype', () => {
    try {
      validateInputs('RANDOM_STRING', 'RANDOM_DATA_TYPE', true);
    } catch (error) {
      expect(error).toEqual(new Error('Not supported datatype'));
    }
  });
});

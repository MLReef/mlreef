import 'babel-polyfill';
import { parseDecimal } from '../functions/dataParserHelpers';

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

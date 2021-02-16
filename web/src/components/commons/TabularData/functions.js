import genUUID from 'uuid/v1';

const parseNumber = (text) => {
  const num = parseFloat(text);

  return Number.isNaN(num) ? text : num;
};

export const transpose = (matrix) => matrix[0].map((_, ci) => matrix.map((row) => row[ci]));

const sanatizeMatrix = (matrix) => {
  const head = matrix[0];
  const tail = matrix[matrix.length - 1];

  const sameLength = head.length === tail.length;
  const lastRowfilled = tail.every((col) => col !== undefined);

  return sameLength && lastRowfilled ? matrix : matrix.slice(0, -1);
};

export const cvsToArray = (text, separator = ',') => {
  const matrix = text.split('\n')
    .map((line) => line.split(separator)
      .map(parseNumber));

  return sanatizeMatrix(matrix);
};

export const jsonToArray = (input) => {
  const items = Array.isArray(input) ? input : Object.values(input);

  if (!items.length) return items;
  // const row = Object.values(input)[0];
  const row = items[0];
  const header = Object.keys(row).map((label) => label);

  // const data = Object.values(input)
  const data = items
    .map((cols) => Object.values(cols).map((val) => val));

  const matrix = [header].concat(data);

  return sanatizeMatrix(matrix);
};

export const arrayToRichData = (matrix, separator = ',') => {
  const header = matrix[0];

  return {
    id: genUUID(),
    meta: {
      separator,
      timestamp: new Date(),
    },
    matrix,
    // data: flat(matrix.map((row, y) => row.map((value, x) => ({ x, y, value }))))
    data: matrix.map((cols, y) => ({
      id: y,
      cols: cols.map((value, x) => ({
        x,
        y,
        value,
        label: header[x],
      })),
    })),
  };
};

const extractField = (row, x) => row.cols.find((col) => col.x === x)?.value;

// eslint-disable-next-line
const checkIsNaN = isNaN;

const compareNaN = (a, b) => (comparision) => {
  if (checkIsNaN(a) && !checkIsNaN(b)) return 1;
  if (checkIsNaN(b) && !checkIsNaN(a)) return -1;

  return comparision;
};

export const sortDesc = (x) => (rows) => rows.slice()
  .sort((a, b) => {
    const valueA = extractField(a, x);
    const valueB = extractField(b, x);

    return compareNaN(valueA, valueB)(valueB >= valueA ? 1 : -1);
  });

export const sortAsc = (x) => (rows) => rows.slice()
  .sort((a, b) => {
    const valueA = extractField(a, x);
    const valueB = extractField(b, x);

    return compareNaN(valueA, valueB)(valueA >= valueB ? 1 : -1);
  });

export const round = (decs) => (input) => {
  const decimals = parseInt(decs, 10);

  if (Number.isNaN(decimals)) return input;

  if (decimals > 12) return input;

  const num = parseFloat(input);
  if (Number.isNaN(num)) return input;

  return Math.round(num * (10 ** decimals)) / (10 ** decimals);
};

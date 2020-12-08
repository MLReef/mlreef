const extractField = (row, x) => row.cols.find((col) => col.x === x)?.value;

export const sortDesc = (x) => (rows) => rows.slice()
  .sort((a, b) => extractField(b, x) - extractField(a, x));

export const sortAsc = (x) => (rows) => rows.slice()
  .sort((a, b) => extractField(a, x) - extractField(b, x));

export const round = (decs) => (input) => {
  const decimals = parseInt(decs, 10);

  if (Number.isNaN(decimals)) return input;

  if (decimals > 12) return input;

  const num = parseFloat(input);
  if (Number.isNaN(num)) return input;

  return Math.round(num * (10 ** decimals)) / (10 ** decimals);
};

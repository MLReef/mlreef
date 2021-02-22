import { useCallback } from 'react';

export const useUnfoldValue = (getColumn) => useCallback(
  (param) => {
    if (param.type === 'col') {
      return getColumn(parseInt(param.value, 10)).slice(1);
    }

    if (param.type === 'color') {
      const res = { color: param.color };
      if (param.size) res.size = parseInt(param.size, 10);
      if (param.width) res.width = parseInt(param.width, 10);

      return res;
    }

    if (param.type === 'range') {
      return [parseFloat(param.min), parseFloat(param.max)];
    }

    return param.value;
  },
  [getColumn],
);

export default useUnfoldValue;

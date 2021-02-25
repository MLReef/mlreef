import { useCallback } from 'react';

export const useUnfoldValue = (getColumn) => useCallback(
  (param) => {
    if (param.type === 'col') {
      // returns y: Array<value>
      return getColumn(parseInt(param.value, 10)).slice(1);
    }

    if (param.type === 'color') {
      const res = { color: param.color };
      if (param.size) res.size = parseInt(param.size, 10);
      if (param.width) res.width = parseInt(param.width, 10);
      // returns customization: { color, with, size }
      return res;
    }

    if (param.type === 'range') {
      return [parseFloat(param.min), parseFloat(param.max)];
    }
    // returns [Number, Number]
    return param.value;
  },
  [getColumn],
);

export default useUnfoldValue;

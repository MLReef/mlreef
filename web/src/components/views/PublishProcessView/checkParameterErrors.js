const checkParameterErrors = (param) => {
  const {
    type,
    values,
    defaultValue: def,
    range,
  } = param;

  if (type === 'List' && (!Array.isArray(values) || !values.length > 0)) {
    return {
      ...param,
      error: {
        type: 'values',
        message: 'incorrect values.',
      },
    };
  }

  if (def && type === 'Integer' && def !== parseInt(def, 10)) {
    return {
      ...param,
      error: {
        type: 'defaultValue',
        message: 'this is not an integer!',
      },
    };
  }

  if (def && type === 'Float' && def !== parseFloat(def)) {
    return {
      ...param,
      error: {
        type: '',
        message: 'default not float.',
      },
    };
  }

  if (range && (!Array.isArray(range) || range.length !== 2)) {
    return {
      ...param,
      error: {
        type: 'range',
        message: 'corrupted range.',
      },
    };
  }

  if (range && def && !(def >= range[0] && def <= range[1])) {
    return {
      ...param,
      error: {
        type: 'defaultValue',
        message: 'default value out of range.',
      },
    };
  }

  return param;
};

export default checkParameterErrors;

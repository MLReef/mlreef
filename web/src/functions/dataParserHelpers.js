const imageFormats = [
  '.png',
  '.jpg',
  '.gif',
  '.ico',
  '.jpeg',
  '.raw',
  '.clip',
  '.bmp',
];

export const getTimeCreatedAgo = (timeAgoCreatedAt, today) => {
  const timeAgoCreatedAtDate = new Date(timeAgoCreatedAt);
  const diff = today - timeAgoCreatedAtDate;
  let timediff;
  if (diff > 2678400e3) {
    timediff = `${Math.floor(diff / 2678400e3)} month(s)`;
  } else if (diff > 604800e3) {
    timediff = `${Math.floor(diff / 604800e3)} weeks`;
  } else if (diff > 86400e3) {
    timediff = `${Math.floor(diff / 86400e3)} days`;
  } else if (diff > 3600e3) {
    timediff = `${Math.floor(diff / 3600e3)} hour(s)`;
  } else if (diff > 60e3) {
    timediff = `${Math.floor(diff / 60e3)} minutes`;
  } else {
    timediff = 'just now';
  }

  return timediff;
};

/**
 * @param {*} duration in seconds to parse into hours, minutes and seconds
 */
export const parseDurationInSeconds = (duration) => {
  const durationMinutesStr = (duration / 60).toString();
  const durationParts = durationMinutesStr.split('.');

  const minutesStr = durationParts[0];
  const secondsFloat = Math.round(parseFloat(`0.${durationParts[1]}`) * 60);

  return `${minutesStr}m ${secondsFloat}s`;
};


export const getFilesInFolder = (folder, files) => files.filter(
  (file) => file.path.includes(folder.name)
        && file.id !== folder.id,
);

/**
 * @param {linesOfContent} mlreef yml broken into lines that will be analyzed to extract information
 */
export const parseMlreefConfigurationLines = (linesOfContent) => linesOfContent
  .filter((lineToFilter) => lineToFilter.includes('python')).map((line) => {
    let lineParams = [];
    const operationName = line.match(/[/][a-zA-z]+.py/g) || line.match(/[/][a-zA-z/\d/g]+.py/g);
    let parametersWithBooleanPat = line.match(/--[a-zA-z]+-+[a-zA-z]+\s+[a-zA-z]+\S/g);
    // some parametters are so rare that sometimes match returns null which raises an exception
    if (parametersWithBooleanPat === null) {
      parametersWithBooleanPat = [];
    }
    const match = line.match(/--[a-zA-z]+\s+[0-9]{1,5}/g);
    lineParams = [
      ...lineParams,
      ...(match || []),
      ...parametersWithBooleanPat,
    ];
    const rawParams = lineParams
      .filter((param) => param.name !== '')
      .map((param) => param.substring(2, param.length))
      .map((paramsAndValues) => {
        const dividedParam = paramsAndValues.split(' ');
        return {
          name: dividedParam[0],
          value: dividedParam[1],
        };
      });
    return {
      name: operationName
        ? operationName[0].substring(1, operationName[0].length).split('.')[0]
        : '',
      params: rawParams,
    };
  });

/**
 * Return a number with desired format.
 *
 * 5 significant digits preferred, max 5 fractional digits, keep integer part.
 *
 * @param {Number} num and integer or float, any else will just returned.
 * @param {Number[integer]} digits max desired digits.
 *
 * @return {Number[float]}
 */
export const parseDecimal = (input, digits = 5) => {
  const num = parseFloat(input);
  const minimum = 1 / (10 ** (digits - 1));

  if (isNaN(num)) {
    return input;
  }

  if (num >= 10 ** digits) {
    return Math.trunc(num);
  }

  if (num < minimum) {
    return minimum;
  }

  if (num < 1) {
    return parseFloat(num.toLocaleString('en', {
      maximumFractionDigits: digits - 1,
      useGrouping: false,
    }));
  }

  return parseFloat(num.toLocaleString('en', {
    maximumSignificantDigits: digits,
    useGrouping: false,
  }));
};

export const isImageFormat = (fileName) => {
  let imageFormatCounter = 0;
  imageFormats.forEach((format) => {
    if (fileName.includes(format)) {
      imageFormatCounter += 1;
    }
  });
  return imageFormatCounter > 0;
};

export const convertToSlug = (stringToConvert) => stringToConvert
  .toLowerCase()
  .replace(/ /g, '-')
  .replace(/[-]+/g, '-')
  .replace(/[^\w-]+/g, '');

export const getCommentFromCommit = (message = '') => {
  const [, ...comment] = message.split('\n\n');

  return comment.join('\n\n');
};

export const parseToCamelCase = (objectToParse) => {
  const keys = Object.keys(objectToParse);
  const newObj = { };
  keys.forEach((key) => {
    const splittedKey = key.toString().split('');
    let newKey = '';
    let newChar = '';
    splittedKey.forEach((char, indexOfChar) => {
      newChar = char;
      if (splittedKey[indexOfChar - 1] === '_') {
        newChar = char.toUpperCase();
      }
      newKey = `${newKey}${newChar}`.replace('_', '');
    });
    newObj[newKey] = objectToParse[key];
  });
  return newObj;
};

/**
 * Returns "YYY-MM-DD" date.
 *
 * @param {Date} date it's a date instance.
 * @return {String}
 */
export const parseDate = (date) => {
  const padNumber = (num) => num.toString().padStart(2, '0');
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  return `${y}-${padNumber(m)}-${padNumber(d)}`;
};

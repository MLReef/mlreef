import store from '../store';
import {
  colorsForCharts,
} from '../dataTypes';

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

export const generateSummarizedInfo = (epochObjects) => {
  /**
     * Next loop is to get all the epoc keys like acc, val_acc, loss, val_loss.
     */
  const resultData = Object.keys(epochObjects[0]).map((key) => {
    const pipeLineEpochValue = {};
    pipeLineEpochValue[key] = [];

    return pipeLineEpochValue;
  });

  Object.keys(epochObjects).forEach((obj) => {
    Object.keys(epochObjects[obj]).forEach((objKey, index) => {
      resultData[index][objKey].push(epochObjects[obj][objKey]);
    });
  });

  /**
     * Get average data per epoch value
     */
  resultData.forEach((epochValue) => {
    const epochNameValue = Object.keys(epochValue)[0];
    resultData[`avg_${epochNameValue}`] = (
      epochValue[epochNameValue]
        .reduce((a, b) => a + b)
                    / epochValue[epochNameValue].length
    );
  });
  return resultData;
};

export const getFilesInFolder = (folder, files) => files.filter(
  (file) => file.path.includes(folder.name)
        && file.id !== folder.id,
);

export function mapSummarizedInfoToDatasets(summarizedInfo) {
  return summarizedInfo.map(
    (epochObjectVal, index) => {
      const currentValueName = Object.keys(epochObjectVal)[0];
      const dataSet = {};

      dataSet.label = currentValueName;
      dataSet.fill = false;
      dataSet.backgroundColor = colorsForCharts[index];
      dataSet.borderColor = colorsForCharts[index];
      dataSet.lineTension = 0;
      dataSet.data = epochObjectVal[currentValueName];

      return dataSet;
    },
  );
}

export function parseDataAndRefreshChart(rawJsonData) {
  /* set information to show in the chart */
  const summarizedInfo = generateSummarizedInfo(rawJsonData);
  const datasets = mapSummarizedInfoToDatasets(summarizedInfo);
  const labels = Object.keys(datasets[0].data);

  /* set average values to show beside chart */
  const averageParams = Object.keys(summarizedInfo)
    .filter((sInfoItem) => sInfoItem.startsWith('avg_'))
    .map((sInfoItem) => ({
      name: sInfoItem.substring(4, sInfoItem.length),
      value: summarizedInfo[sInfoItem],
    }));
  const data = {
    labels,
    datasets,
  };
  return {
    data,
    averageParams,
  };
}

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

export const getCurrentUserInformation = () => {
  const { user } = store.getState();

  return {
    token: user.token,
    userEmail: user.email,
    userId: user.id,
    userName: user.username,
  };
};

import filesApi from '../apis/FilesApi';
import {
  colorsForCharts,
} from '../dataTypes';

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

/**
   * @param {fileToTest} file to be checked if should be displayed,
   * as some files belong to subfolders they should not be displayed in table
*/
export const findFolderContainer = (fileToTest, files) => files
  .filter((file) => file.type === 'tree')
  .filter(
    (folderFile) => fileToTest.path.includes(folderFile.path)
        && folderFile.id !== fileToTest.id, // this is to avoid a folder crash against itself
  );

export const generateNewArrayOfFilesToRender = async (filesResponse, projectId, branch) => {
  const files = filesResponse.filter((file) => file.type === 'blob');
  const folders = filesResponse.filter((file) => file.type === 'tree');
  const filesData = await Promise.all(files.map((file) => filesApi.getFileData(
    projectId,
    file.path.replace(/\//g, '%2F'),
    branch,
  )));

  const updatedFiles = assignSizeToFiles(files, filesData);
  const updatedFolders = updatedFiles.length === 0
    ? folders
    : assignSizeToFiles(folders, [], updatedFiles);

  return [...updatedFolders, ...updatedFiles];
};

export const assignSizeToFiles = (files, filesData, updatedFiles) => files.map((file) => {
  const newFile = file;
  newFile.size = file.type === 'blob'
    ? calculateSize(
      filesData.filter(
        (fD) => fD.blob_id === file.id,
      )[0].size,
      file,
      files,
    )
    : calculateSize(null, file, updatedFiles);

  return newFile;
});

export const calculateSize = (size, file, fullArrayOfFiles) => {
  if (file.type === 'blob') {
    return Math.floor(size / 1000);
  }
  const filesInFolder = getFilesInFolder(file, fullArrayOfFiles)
    .map((file) => file.size)
    .filter((size) => size !== undefined);

  return filesInFolder.length > 0
    ? filesInFolder.reduce((a, b) => a + b)
    : 0;
};

export const getFilesInFolder = (folder, files) => files.filter(
  (file) => file.path.includes(folder.name)
        && file.id !== folder.id,
);

export const getParamFromUrl = (
  param,
  url,
) => new URL(url).searchParams.get(param);

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

export function mlreefLinesToExtractConfiguration(linesOfContent) {
  const operationsArray = [];
  let operationName;
  let rawParams;
  let lineParams;
  linesOfContent.forEach((line) => {
    if (line.includes('python')) {
      lineParams = [];
      operationName = line.match(/[/][a-zA-z]+.py/g);
      let parametersWithBooleanPat = line.match(/--[a-zA-z]+-+[a-zA-z]+\s+[a-zA-z]+\S/g);
      // some parametters are so rare that sometimes match returns null which raises an exception
      if (parametersWithBooleanPat === null) {
        parametersWithBooleanPat = [];
      }
      lineParams = [
        ...lineParams,
        ...line.match(/--[a-zA-z]+\s+[0-9]{1,5}/g),
        ...parametersWithBooleanPat,
      ];
      rawParams = lineParams
        .filter((param) => param.name !== '')
        .map((param) => param.substring(2, param.length))
        .map((paramsAndValues) => {
          const dividedParam = paramsAndValues.split(' ');
          return {
            name: dividedParam[0],
            value: dividedParam[1],
          };
        });
      const dataOperation = {
        name: operationName[0].substring(1, operationName[0].length).split('.')[0],
        params: rawParams,
      };
      operationsArray.push(dataOperation);
    }
  });
  return operationsArray;
}

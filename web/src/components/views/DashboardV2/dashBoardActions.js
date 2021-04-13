import MLSearchApi from 'apis/MLSearchApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { mergeGitlabResource } from 'store/actions/projectInfoActions';
import { dataTypes, sortingOPtions } from './constants';

const mlSearchApi = new MLSearchApi();

const buildTagsArray = (sorting, selectedDataTypes, minimumStars, publishState) => {
  const parsedMinStars = parseInt(minimumStars);
  let tags = [
    ...selectedDataTypes.map((sdInd) => ({ label: dataTypes[sdInd].label, type: 'DATA_TYPE', id: sdInd })),
  ];

  if (sorting > 0) {
    tags = [
      ...tags,
      { label: `Sorted by ${sortingOPtions[sorting].label}`, type: 'SORTING' },
    ];
  }

  if (parsedMinStars > 0) {
    tags = [
      ...tags,
      { label: `Minimum of ${minimumStars} stars`, type: 'METRICS' },
    ];
  }

  if (publishState === 1 || publishState === 2) {
    tags = [
      ...tags,
      { label: `Only ${publishState === 2 ? 'not' : ''} published projects`, type: 'PUBLISH_STATE' },
    ];
  }

  return tags;
};

const getDataTypeNames = (options, values) => options
  .filter((_, ind) => values.includes(ind))
  .map((op) => op.label);

const getValuesStateOptions = (publishedStateOption) => {
  switch (publishedStateOption) {
    case 1:
      return true;
    case 2:
      return false;
    default:
      return null;
  }
};

const getProjects = (searchableType, body = {}, page, size) => mlSearchApi
  .searchPaginated(searchableType, body, page, size)
  .then((projsPag) => ({
    ...projsPag,
    projects: mergeGitlabResource(projsPag.content.map(parseToCamelCase)),
  }));

export default {
  getDataTypeNames,
  getValuesStateOptions,
  buildTagsArray,
  getProjects,
};

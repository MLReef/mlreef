import MLSearchApi from 'apis/MLSearchApi';
import store from 'store';
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

/**
 * 
 * @param {*} classifcation1: string to sort project into: my own, starred or public
 * @param {*} dataTypes: input data types: Text, video, image, etc.
 * @param {*} minimumStars: minimum threshold of stars to request
 * @param {*} publishStatus: published or not, maybe null to not discriminate 
 * and include projects of both states.
 * @returns: body containing request filters.
 */

const buildProjectsRequestBodyV2 = (classifcation1, dTypes = [], minimumStars, publishStatus) => {
  let body = {};
  const { user: { username } } = store.getState();
  if (classifcation1 === '' || classifcation1 === 'my-repositories') {
    body = {
      ...body,
      namespace: username,
    };
  } else if (classifcation1 === 'all') {
    body = {
      ...body,
      visibility: 'PUBLIC',
    };
  } else if (classifcation1 === 'starred') {
    body = {
      ...body,
      min_stars: 1,
    };
  }

  body = { ...body, input_data_types_or: [...dTypes]}

  if (minimumStars > 0) {
    body = { ...body, min_stars: minimumStars };
  }

  if ( publishStatus !== null) {
    body = { ...body, published: publishStatus }
  }

  return body;
};

const getProjects = (
  searchableType, 
  classification1, 
  selectedDataTypes, 
  minimumStars, 
  publishState, 
  page, 
  size
) => mlSearchApi
  .searchPaginated(searchableType.toUpperCase(), 
    buildProjectsRequestBodyV2(
      classification1,
      getDataTypeNames(dataTypes, selectedDataTypes),
      minimumStars,
      getValuesStateOptions(publishState),
    ),
    page, 
    size)
  .then((projsPag) => ({
    ...projsPag,
    projects: mergeGitlabResource(projsPag.content.map(parseToCamelCase)),
  }));

export default {
  getDataTypeNames,
  getValuesStateOptions,
  buildTagsArray,
  buildProjectsRequestBodyV2,
  getProjects,
};

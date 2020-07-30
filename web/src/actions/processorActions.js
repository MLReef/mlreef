import { OPERATION, ALGORITHM } from 'dataTypes';
import { SET_OPERATIONS, SET_ALGORITHMS, SET_VISUALIZATIONS } from './actionTypes';
import DataProcessorsApi from '../apis/DataProcessorsApi.ts';

const dataProcApi = new DataProcessorsApi();
/**
 *
 * @param {*} operations: load list of backend operations
 * @param {*} algorithms: load list of backend algorithms
 */

export function setOperationsSuccessfully(operations) {
  return { type: SET_OPERATIONS, operations };
}

export function setAlgorithmsSuccessfully(algorithms) {
  return { type: SET_ALGORITHMS, algorithms };
}

export function setVisualizationsSuccessfully(visualizations) {
  return { type: SET_VISUALIZATIONS, visualizations };
}

/**
   * get list of processors associated with corresponding project
   */

export function getProcessors(type) {
  const params = new Map();
  params.set('type', type);
  return (dispatch) => dataProcApi
    .filterByParams(params)
    .then((dataProcessors) => Promise.all(
      dataProcessors.map((dataProcessor) => dataProcApi.getParamDetails(dataProcessor.id)),
    ))
    .then((dataProcessorsVersionsArr) => dataProcessorsVersionsArr
      .map((versionsArr) => versionsArr.filter((version) => version.branch === 'master')) // this is not Gitlab info so to hardcode master makes sense. DO NOT REPLICATE
      .map((versionsFiltered) => versionsFiltered[0]))
    .then((processors) => {
      switch (type) {
        case OPERATION:
          dispatch(
            setOperationsSuccessfully(
              processors,
            ),
          );
          break;
        case ALGORITHM:
          dispatch(
            setAlgorithmsSuccessfully(
              processors,
            ),
          );
          break;
        default:
          dispatch(
            setVisualizationsSuccessfully(
              processors,
            ),
          );
          break;
      }
    });
}

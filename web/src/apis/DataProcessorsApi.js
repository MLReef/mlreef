import { toastr } from 'react-redux-toastr';
import { generateGetRequest } from './apiHelpers';

export default class DataProcessorsApi {
  /**
   * @param type  DataProcessor Type, can be ALGORITHM, OPERATION, VISUALISATION
   * @param inputDataType DataType of input for DataProcessor
   * @param outputDataType DataType of output for DataProcessor
   * @returns {Promise<any>}
   */
  static async filterDataProcessorsByTypeAndDataTypes(type, inputDataType, outputDataType) {
    const url = `/api/v1/data-processors?type=${type}&input_data_type=${inputDataType}&output_data_type=${outputDataType}`;
    const response = await generateGetRequest(url);

    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', `Server error while fetching Dataprocessors for type ${type}`);
    }
    return response.json();
  }

  /**
   * @param type  DataProcessor Type, can be ALGORITHM, OPERATION, VISUALISATION
   * @returns {Promise<any>}
   */
  static async filterDataProcessorsByType(type) {
    const url = `/api/v1/data-processors?type=${type}`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', `Server error while fetching Dataprocessors for type ${type}`);
    }
    return response.json();
  }
}

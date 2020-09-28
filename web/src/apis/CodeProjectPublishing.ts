import fetch from 'node-fetch';

// const projectInstance = new ProjectGeneralInfoApi();

export default class CodeProjectPublishingApi {
  async publishCodeProject(
    baseUrl = '',
    token = '',
  ) {
    const path = '/api/v1/explore/entries';
    // console.log(`token = ${token}`);

    const response = await fetch(baseUrl + path);
    if (!response.ok) {
      const body = await response.json();
      return Promise.reject(body.error_message);
    }
    return response.json();
  }
}

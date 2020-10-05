import { EXTERNAL_ROOT_URL } from 'apiConfig';
import fetch from 'node-fetch';

//
// This is a spike implementation.
// This code exists only to show a possible architecture of the end2end tests
// As with all spikes it is an experiment / investigation which
// can -and probably should- be deleted once a final solution is found
//
export default class CommitsApiMock {
  performCommit(
    projectId: number,
    filePath: string,
    fileContent: string,
    branch: string,
    commitMss: string,
    action: string,
    encoding: string = 'text',
    headers: any,
  ) {
    const body = JSON.stringify({
      branch,
      commit_message: commitMss,
      actions: [
        {
          action,
          file_path: filePath,
          content: fileContent,
          encoding,
        },
      ],
    });
    const url = `${EXTERNAL_ROOT_URL}/api/v4/projects/${projectId}/repository/commits`;

    return fetch(url, {
      headers,
      method: 'POST',
      body
    });
  }
}

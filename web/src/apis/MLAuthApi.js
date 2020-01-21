import { MLREEF_INSTANCE } from '../apiConfig';

export default class MLRAuthApi {
  static buildAuthHeaders(token) {
    return new Headers({
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
  static buildAnonHeaders() {
    return new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': `${MLREEF_INSTANCE}`,
    });
  }

  static async login(username, email, password) {
    const url = `/api/v1/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildAnonHeaders(),
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });
    const body = await response.json();
    if (response.status >= 400) {
      console.error(body);
      throw new Error("Bad response from server: "+body.errorName);
    }
    return body;
  }

}

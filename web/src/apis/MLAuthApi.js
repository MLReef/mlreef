import { API_GATEWAY } from '../apiConfig';

export default class MLRAuthApi {
  static buildAuthHeaders(token) {
    return new Headers({
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  static buildAnonHeaders() {
    return new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  static async login(username, email, password) {
    const url = `${API_GATEWAY}/api/v1/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildAnonHeaders(),
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const body = await response.json();
    if (response.status >= 400) {
      throw new Error(`Bad response from server: ${body.errorName}`);
    }
    return body;
  }

  static register(data) {
    const request = new Request('/api/v1/auth/register', {
      method: 'POST',
      headers: this.buildAnonHeaders(),
      body: JSON.stringify(data),
    });

    return fetch(request)
      .then((res) => res.ok ? res.json() : Promise.reject(res));
  }
}

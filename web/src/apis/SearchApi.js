import Search from 'functions/Search';
import { getCurrentToken, filterBots, filterRoot } from './apiHelpers';

const search = new Search();

export default class SearchApi {
  static updateMeta(meta) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }

  static getUserInfo() {
    const url = '/api/v4/user';

    const request = new Request(url, {
      method: 'GET',
      headers: new Headers({
        authorization: getCurrentToken(),
      }),
    });

    return fetch(request)
      .then((res) => res.ok ? res : Promise.reject(res))
      .then((res) => res.json());
  }

  static updateUserInfo(info) {
    // waiting for the endpoint
    return Promise.resolve(info);
  }

  static getUsers(q) {
    const url = `/api/v4/search?scope=users&search=${q}`;

    const request = new Request(url, {
      method: 'GET',
      headers: new Headers({
        authorization: getCurrentToken(),
      }),
    });

    return search.fetch(request)
      // in case of gitlab fails
      .then((results) => Array.isArray(results) ? results : [])
      .then(filterRoot)
      .then(filterBots);
  }

  static searchProjectByName(name) {
    const url = `/api/v4/search?scope=projects&search=${name}`;

    const request = new Request(url, {
      method: 'GET',
      headers: new Headers({
        authorization: getCurrentToken(),
      }),
    });

    return search.fetch(request)
      // in case of gitlab fails
      .then((results) => Array.isArray(results) ? results : []);
  }
}

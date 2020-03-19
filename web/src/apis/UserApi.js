
export default class UserApi {
  static updateMeta(meta) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }

  static updateUserInfo(info) {
    // waiting for the endpoint
    return Promise.resolve(info);
  }
}

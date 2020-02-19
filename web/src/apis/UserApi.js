
export default class UserApi {
  static updateMeta(meta) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }
}

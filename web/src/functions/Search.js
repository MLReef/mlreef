/**
 * Secure search object.
 *
 * the aim of this object is to avoid asynchronous problems when user is typing
 * a live search, e.g. it's possible the last search committed is not the last
 * request made, rather a delayed response.
 *
 * @var {Number} ts
 * @var {Object} response
 * @method search
 * @method fetch
 */
export default function Search() {
  this.ts = null;
  this.response = {};

  /**
   * Fetch with a custom function.
   *
   * @param {Function} callbackPromise
   * @return {Promise}
   */
  this.search = (callbackPromise) => () => {
    const ts = new Date().getTime();
    this.ts = ts;

    return callbackPromise()
      .then((res) => {
        if (ts >= this.ts) this.response = res;

        return this.response;
      });
  };

  /**
   * Fetch with browser fetch
   *
   * @return {Promise}
   */
  this.fetch = (...args) => {
    const ts = new Date().getTime();
    this.ts = ts;

    return fetch(...args)
      .then((res) => res.ok ? res : Promise.reject(res))
      .then((res) => {
        if (ts >= this.ts) this.response = res.json();

        return this.response;
      });
  };
}

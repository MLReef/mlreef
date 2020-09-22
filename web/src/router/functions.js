/**
 * Compose like: f.g x = g(f(x))
 *
 * @example compose (fn4, fn3, fn2, fn1) (arg) === fn4(fn3(fn2(fn1(arg))))
 *
 * @param {Array[Function]} fns sequence of functions.
 * @param arg input parameter.
 *
 * @return far left funcion return.
 */
export const c = (...fns) => (arg) => fns.reverse().reduce((acc, fn) => fn(acc), arg);

/**
 * Return the recorded route that matches name.
 */
export const findRouteInfo = (routes) => ({ name }) => routes.find((route) => route.name === name);

/**
 * Replace placeholders by parameters. e.g. /:user/messages -> /nick/messages.
 *
 * @param {Object(Route)} to implicit.
 * @param {Object} params e.g. key-val object, from the to object.
 * @param {Object(Route)} record the route from routes.
 *
 * @return {Object(Route)} route with path modified.
 */
export const replaceParams = (to) => (record = {}) => {
  if (to.params) {
    const path = Object.entries(to.params)
      .reduce((final, [k, v]) => final.replace(new RegExp(`:${k}`), v), record.path || '');

    return { ...record, path };
  }

  return record;
};

/**
 * Add the hash part. e.g. #last-menu-item
 *
 * @param {Object(Route)} to implicit.
 * @param {String} hash e.g. last-menu-item, from the to object.
 * @param {Object(Route)} record the route from routes.
 *
 * @return {Object(Route)} route with path modified.
 */
export const addHash = (to) => (record) => !to.hash ? record
  : { ...record, path: `${record.path}#${to.hash}` };

export const makeQuery = (query) => Object.entries(query)
  .map(([k, v]) => `${k}=${v}`)
  .join('&');

/**
 * Add the query search. e.g. ?user=nickname&priority=high
 *
 * @param {Object(Route)} to implicit.
 * @param {Object} query e.g. key-val object, from the to object.
 * @param {Object(Route)} record the route from routes.
 *
 * @return {Object(Route)} route with path modified.
 */
export const addQuery = (to) => (record) => !to.query ? record
  : { ...record, path: `${record.path}?${makeQuery(to.query)}` };

export const unpack = ({ path }) => path;

export const resolveRoute = (routes, to) => c(
  unpack, addQuery(to), addHash(to), replaceParams(to), findRouteInfo(routes),
)(to);

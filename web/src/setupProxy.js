const proxy = require('http-proxy-middleware');

// in production, "/api" should also happen to be redirected! If it is not, then you are not running the nginx-proxy!
// then this middleware must proxy  develop frontend (npm start) to the backend
// proxy
module.exports = function (app) {
    const BACKEND_REROUTE = process.env.REACT_APP_BACKEND_REROUTE || 'http://localhost';
  app.use(
    // This is MLReef's own API served by our backend
    '/api/v1',
    proxy({
      target: `${BACKEND_REROUTE}:8080`,
      changeOrigin: true,
    })
  ),
  app.use(
    // This is the Gitlab API served by the Gitlab container
    '/api/v4',
    proxy({
      target: `${BACKEND_REROUTE}:10080`,
      changeOrigin: true,
    })
  );
};

// start your local proxy,backend and gitlab!


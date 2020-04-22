const proxy = require('http-proxy-middleware');
// in production, "/api" should also happen to be redirected! If it is not, then you are not running the nginx-proxy!
// then this middleware must proxy  develop frontend (npm start) to the backend
// proxy 
module.exports = function (app) {
    /*
    First of all ... yes this configuration is … unfortunate :)
    But as long as MLReef's API version is below gitlab's API version this will work
    **YAAY**
     */
  app.use(
    '/api/v1',
    proxy({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  ),
  app.use(
    '/api/v4',
    proxy({
        target: 'http://localhost:10080',
      changeOrigin: true,
    })
  );
};

// start your local proxy,backend and gitlab!


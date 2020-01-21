const proxy = require('http-proxy-middleware');
// in production, "/api" should also happen to be redirected! If it is not, then you are not running the nginx-proxy!
// then this middleware must proxy  develop frontend (npm start) to the backend
// proxy 
module.exports = function (app) {
  app.use(
    '/api',
    proxy({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};

// start your local proxy,backend and gitlab!


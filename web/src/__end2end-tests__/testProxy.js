const express = require('express');
const proxy = require('http-proxy-middleware');

// Create an instance of the http server to handle HTTP requests

// Create Express Server
const app = express();
const targetApi = process.env.INSTANCE_HOST || 'localhost';
app.use(
  '/',
  proxy({
    target: `http://${targetApi}`,
    changeOrigin: true,
  }),
);

// Configuration
const HOST = 'localhost';
const PORT = 80;
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT} ==> ${targetApi}`);
});

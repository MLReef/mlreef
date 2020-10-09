const express = require('express');
const setup = require('../setupProxy');

const app = express();
const port = 80;

setup(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Listening at http://localhost:${port}`);
});

import React from 'react';

export const files = [
  {
    id: '1979dde53cd35a4c8bab4a7306a76346321db006',
    name: 'more-pics',
    type: 'tree',
  },
  {
    id: 'd46deea93ca82eb2be037a7a3cdea2ac71c6f7c6',
    name: 'cats01.jpg',
    selected: true,
    type: 'blog',
  },
  {
    id: 'd46deea93ca82eb2be037a7a3cdea2ac71c6f744',
    name: 'cats02.jpg',
    type: 'blog',
  },
  {
    id: 'd46deea93ca82eb2be037a7a3cdea2ac71c6f745',
    name: 'cats03.jpg',
    type: 'blog',
    callback: () => {},
  },
];

export const bricks = [
  (
    <div className="bg-primary p-1 d-flex" style={{ height: 320, width: 200 }}>
      <span className="m-auto">1</span>
    </div>
  ),
  (
    <div className="bg-danger p-1 d-flex" style={{ height: 150, width: 200 }}>
      <span className="m-auto">2</span>
    </div>
  ),
  (
    <div className="bg-info p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">3</span>
    </div>
  ),
  (
    <div className="bg-dark p-1 d-flex" style={{ height: 300, width: 200 }}>
      <span className="m-auto">4</span>
    </div>
  ),
  (
    <div className="bg-secondary p-1 d-flex" style={{ height: 170, width: 200 }}>
      <span className="m-auto">5</span>
    </div>
  ),
  (
    <div className="bg-warning p-1 d-flex" style={{ height: 240, width: 200 }}>
      <span className="m-auto">6</span>
    </div>
  ),
  (
    <div className="bg-primary p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">7</span>
    </div>
  ),
  (
    <div className="bg-danger p-1 d-flex" style={{ height: 380, width: 200 }}>
      <span className="m-auto">8</span>
    </div>
  ),
  (
    <div className="bg-info p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">9</span>
    </div>
  ),
  (
    <div className="bg-dark p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">10</span>
    </div>
  ),
  (
    <div className="bg-secondary p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">11</span>
    </div>
  ),
  (
    <div className="bg-warning p-1 d-flex" style={{ height: 200, width: 200 }}>
      <span className="m-auto">12</span>
    </div>
  ),
];

export const filters = [
  {
    name: 'Computing infrastructure',
    selected: null,
    options: [
      {
        name: 'CPU',
        value: 1,
      },
      {
        name: 'GPU',
        value: 2,
      },
    ],
  },
  {
    name: 'Python version',
    selected: null,
    options: [
      {
        name: 'Python version',
        value: 1,
      },
      {
        name: 'Python 1.3',
        value: 2,
      },
      {
        name: 'Python 1.4',
        value: 3,
      },
      {
        name: 'Python 1.7',
        value: 4,
      },
    ],
  },
  {
    name: 'Frameworks',
    selected: null,
    options: [
      {
        name: 'Tensorflow',
        value: 1,
      },
      {
        name: 'Theano',
        value: 2,
      },
      {
        name: 'Caffee',
        value: 3,
      },
      {
        name: 'Keras',
        value: 4,
      },
    ],
  },
];

export const modelOptions = [
  {
    label: 'CNN',
    value: 1,
  },
  {
    label: 'Clustering',
    value: 2,
  },
  {
    label: 'Tree',
    value: 3,
  },
  {
    label: 'Regression',
    value: 4,
  },
];

export const categoryOptions = [
  {
    label: 'Regression',
    value: 1,
  },
  {
    label: 'Prediction',
    value: 2,
  },
  {
    label: 'Classification',
    value: 3,
  },
  {
    label: 'Dimensionality reduction',
    value: 4,
  },
];

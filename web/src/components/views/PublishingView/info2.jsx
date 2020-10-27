export const environments = [
  {
    id: '1',
    name: 'CPU - TF - KERAS',
    requirements: [
      'package 122',
      'package 123',
      'package 124',
      'package 125',
    ],
  },
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

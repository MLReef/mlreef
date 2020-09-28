export const parameters = [
  {
    name: 'Input height',
    type: 'Integer',
    range: [1, 200],
    description: 'The input height defines the height in pixel of the input image.',
  },
  {
    name: 'Input width',
    type: 'Integer',
    defaultValue: 'asd',
    description: 'The input width defines the width in pixel of the input image.',
  },
  {
    name: 'Loss_class',
    type: 'List',
    values: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  },
  {
    name: 'Loss_class_wrong',
    type: 'List',
    values: 'Values like string',
  },
  {
    name: 'Input height between',
    type: 'Integer',
    defaultValue: 15,
    range: [1, 200],
    description: 'The input height defines the height in pixel of the input image.',
  },
  {
    name: 'Input height between wrong',
    type: 'Integer',
    defaultValue: 254,
    range: [1, 200],
    description: 'The input height defines the height in pixel of the input image.',
  },
  {
    name: 'Input width wrong range',
    type: 'Integer',
    range: [4],
    description: 'The input width defines the width in pixel of the input image.',
  },

];

export const requeriments = [
  {
    name: 'tensorflow',
    specified: 'none',
    installed: '1.15',
  },
  {
    name: 'scikit-learn',
    specified: '0.22.2',
    installed: '0.22.2',
  },
  {
    name: 'erika-learn',
    specified: '0.01',
    installed: '',
    error: {
      type: '',
      message: 'package not found -> revise version or package name',
    },
  },
  {
    name: 'Camillo+erika-learn',
    error: {
      type: '',
      message: 'error installing -> already installed with a different version',
    },
  },
  {
    name: 'camillo-learn',
    specified: '0.00001',
    warning: {
      type: '',
      message: 'The package is already installed.',
    },
  },
];

export const stages = [
  {
    label: 'Integrity',
    jobs: [
      {
        name: 'python-integrity',
        status: 'passed',
      },
      {
        name: 'dummy',
        status: 'warning',
      },
    ],
  },
  {
    label: 'Annotations',
    jobs: [
      {
        name: 'requirements',
        status: 'running',
      },
      {
        name: 'parameter-annotations',
        status: 'failed',
      },
      {
        name: 'dummy',
        status: 'warning',
      },
    ],
  },
  {
    label: 'Build',
    jobs: [
      {
        name: 'environment',
        status: 'pending',
      },
      {
        name: 'dummy',
        status: 'pending',
      },
    ],
  },
];

export const dataArchives = [
  {
    name: 'Data archive 1',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
      sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. `,
    dataTypes: [
      'TEXT',
      'HIERARCHICAL',
      'TABULAR',
      'NUMBER',
    ],
    tags: [{ name: 'tag 1' }, { name: 'tag 2' }, { name: 'tag 3' }],
    starsCount: 2154,
  },
  {
    name: 'Data archive 2',
    description: `Venenatis eleifend leo sodales ultricies nunc parturient nec platea nisl massa torquent,
     id laoreet curabitur sagittis elementum mus lacus lacinia magna eros maecenas pulvinar`,
    dataTypes: [
      'VIDEO',
    ],
    tags: [{ name: 'tag 1' }, { name: 'tag 2' }, { name: 'tag 3' }, { name: 'tag 4' }],
    starsCount: 1997,
  },
];

export const filters = [{
  name: 'Data type',
  selected: null,
  options: [
    {
      name: 'Images',
      value: 1,
    },
    {
      name: 'Text',
      value: 2,
    },
    {
      name: 'Tabular',
      value: 3,
    },
    {
      name: 'Video',
      value: 4,
    },
  ],
}];

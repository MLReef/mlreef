export default [
  {
    label: 'Line Chart',
    value: 'line',
    settings: {
      params: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          value: '',
        },
        {
          label: 'Y-Axis',
          name: 'y',
          type: 'col',
        },

        {
          label: 'Mode',
          name: 'mode',
          type: 'hidden',
          value: 'lines',
        },
        {
          label: 'Line',
          name: 'line',
          type: 'color',
          color: '#0000FF',
          width: 2,
        },
      ],

    },
  },
  {
    label: 'Scatters',
    value: 'scatters',
    settings: {
      params: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          value: '',
        },
        {
          label: 'Y-Axis',
          name: 'y',
          type: 'col',
        },
        {
          label: 'Y-Axis Range',
          name: 'yRange',
          type: 'range',
          min: 0,
          max: 0,
          disabled: true,
        },
        {
          label: 'X-Axis',
          name: 'x',
          type: 'col',
        },
        {
          label: 'X-Axis Range',
          name: 'xRange',
          type: 'range',
          min: 0,
          max: 0,
          disabled: true,
        },
        {
          label: 'Mode',
          name: 'mode',
          type: 'hidden',
          value: 'markers',
        },
        {
          label: 'Marker',
          name: 'marker',
          type: 'color',
          color: '#BADA55',
          size: 2,
        },

      ],
    },
  },
  {
    label: 'Head map',
    value: 'heatmap',
    settings: {
      params: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          value: '',
        },
        {
          label: 'Y-Axis',
          name: 'y',
          type: 'col',
        },
        {
          label: 'Y-Axis Range',
          name: 'yRange',
          type: 'range',
          min: 0,
          max: 0,
        },
        {
          label: 'X-Axis',
          name: 'x',
          type: 'col',
        },
        {
          label: 'X-Axis Range',
          name: 'xRange',
          type: 'range',
          min: 0,
          max: 0,
        },

      ],
    },
  },
];

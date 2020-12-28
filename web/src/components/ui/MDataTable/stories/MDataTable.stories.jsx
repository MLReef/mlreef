import React, { useState } from 'react';
import { compose as c } from 'functions/helpers';
import { jsonToArray, arrayToRichData } from 'components/commons/TabularData/functions';
import MDataTable from '../MDataTable';
import experiment from './experiment.json';

const parseExperiment = c(arrayToRichData, jsonToArray)(experiment);

export default {
  title: 'UI/MDataTable',
  component: MDataTable,
  argTypes: {
    onFieldChange: {
      action: 'fieldChanged',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    onDeleteRow: {
      action: 'rowDeleted',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    className: {
      control: {
        type: 'text',
      },
    },
    data: {
      type: { required: true },
    },
    actives: {
      type: { required: true },
    },
    editable: { control: 'boolean' },
  },
};

// eslint-disable-next-line
const Template = (args) => <MDataTable {...args} />;

export const Basics = Template.bind({});
Basics.args = {
  data: parseExperiment.data,
};

export const SelfControlled = (args) => {
  const [data, setData] = useState(parseExperiment.data);

  // from src/components/commons/TabularData/TabularData.jsx
  const onFieldChange = (field) => {
    const changedData = data.map((row) => row.id !== field.y ? row : ({
      id: row.id,
      cols: row.cols.map((col) => col.x !== field.x ? col : field),
    }));

    setData(changedData);
  };

  // from src/components/commons/TabularData/TabularData.jsx
  const onDeleteRow = (id) => {
    setData(data.filter((row) => row.id !== id));
  };

  const actives = [
    { color: '#CC88FF', cols: [0, 2] },
  ];

  return (
    <MDataTable
      // eslint-disable-next-line
      {...args}
      editable
      data={data}
      onFieldChange={onFieldChange}
      onDeleteRow={onDeleteRow}
      actives={actives}
    />
  );
};

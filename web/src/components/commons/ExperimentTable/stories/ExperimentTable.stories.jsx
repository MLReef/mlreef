import React from 'react';
import { compose as c } from 'functions/helpers';
import { jsonToArray, arrayToRichData } from 'components/commons/TabularData/functions';
import ExperimentTable from '../ExperimentTable';
import experiment from './experiment.json';
import exp from './exp';

const parseExperiment = c(arrayToRichData, jsonToArray)(experiment);

export default {
  title: 'commons/ExperimentTable',
  component: ExperimentTable,
  argTypes: {
    className: {
      control: {
        type: 'text',
      },
    },
  },
};

// eslint-disable-next-line
const Template = (args) => <ExperimentTable {...args} />;

export const Basics = Template.bind({});
Basics.args = {
  richData: { data: exp },
};

// eslint-disable-next-line
export const SelfControlled = (args) => {
  return (
    <ExperimentTable
      // eslint-disable-next-line
      {...args}
      richData={parseExperiment}
    />
  );
};

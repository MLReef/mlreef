import React from 'react';
import { MemoryRouter, Route } from 'react-router';
import ExperimentTable from '../ExperimentTable';
import experimentsDemo from './experimentsDemo.json';

export default {
  title: 'commons/ExperimentTable',
  component: ExperimentTable,
  argTypes: {
    className: {
      control: {
        type: 'text',
      },
    },
    onDeleteExperiments: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    onStopExperiments: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    onUpdateExperiments: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
  },
};

const Template = (args) => (
  <MemoryRouter initialEntries={['/namespace/first-demo/-/experiments']}>
    <Route
      component={(routerProps) => (
        <div style={{ display: 'flex' }}>
          {/* eslint-disable-next-line */}
          <ExperimentTable style={{ width: '1050px' }} {...routerProps} {...args} />
        </div>
      )}
      path="/:namespace/:slug/-/experiments"
    />
  </MemoryRouter>
);

export const Basics = Template.bind({});
Basics.args = {
  experiments: experimentsDemo,
};

// eslint-disable-next-line
// export const SelfControlled = (args) => {
//   return (
//     <ExperimentTable
//       // eslint-disable-next-line
//       {...args}
//       experiments={experimentsDemo}
//     />
//   );
// };

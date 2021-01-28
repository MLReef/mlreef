import React from 'react';
import Router from 'router';
import Tutorial from '../Tutorial';
import TutorialList from '../TutorialList';
import TutorialExecution from '../TutorialExecution';
import rules from '../rules';
import data from '../data.json';
import defaultTutorials from './demo.json';
import { ContextProvider } from '../context';

const container = (Story) => (
  <Router routes={[]}>
    <div
      style={{
        width: '100%',
        height: '150vh',
        color: 'var(--light)',
      }}
    >
      <div>
        <button
          type="button"
          className="btn btn-danger m-2"
          data-tutorial="label1"
        >
          1
        </button>
        <button
          type="button"
          className="btn btn-danger m-2"
          id="label2"
        >
          2
        </button>
        <button
          type="button"
          className="btn btn-danger m-2"
          id="label3"
        >
          3
        </button>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-info m-2"
          data-tutorial="labelblue1"
        >
          1
        </button>
        <button
          type="button"
          className="btn btn-info m-2"
          id="labelblue2"
        >
          2
        </button>
        <button
          type="button"
          className="btn btn-info m-2"
          id="labelblue3"
        >
          3
        </button>
      </div>
      <Story />
    </div>
  </Router>

);

export default {
  title: 'commons/Tutorial',
  component: Tutorial,
  decorators: [container],
  argTypes: {
    className: {
      control: {
        type: 'text',
      },
    },
    active: {
    },
  },
};

// eslint-disable-next-line
const Template = (args) => <Tutorial {...args} />;

export const Basics = Template.bind({});
Basics.args = {
  active: true,
  rules,
  defaultTutorials,
};

// eslint-disable-next-line
export const SelfControlled = (args) => {
  return (
    <Tutorial active />
  );
};

const t = data.tutorials[0];

const tutorials = [
  {
    ...t,
  },
  {
    ...t,
    status: 'pending',
  },
  {
    ...t,
    status: 'done',
  },
];

// eslint-disable-next-line
export const TutorialListOnly = (args) => {
  return (
    <div
      style={{
        margin: '2rem auto',
        width: '280px',
        maxHeight: '300px',
        overflow: 'auto',
      }}
      className="bg-secondary"
    >
      <TutorialList tutorials={tutorials} />
    </div>
  );
};

// eslint-disable-next-line
export const TutorialExecutionOnly = (args) => {
  return (
    <div
      style={{
        margin: '2rem auto',
        width: '280px',
        maxHeight: '300px',
        overflow: 'auto',
      }}
      className="bg-secondary"
    >
      <ContextProvider>
        <TutorialExecution
          name={t.name}
          steps={t.steps}
          rules={rules}
        />
      </ContextProvider>
    </div>
  );
};

// eslint-disable-next-line
export const TutorialModal = (args) => {
  return (
    <div
      style={{
        margin: '2rem auto',
        width: '280px',
        maxHeight: '300px',
        overflow: 'auto',
      }}
      className="bg-secondary"
    >
      <Tutorial active />
    </div>
  );
};

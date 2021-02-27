import React from 'react';
import MSimpleTabs from './MSimpleTabs';

const defaultSections = [
  {
    label: 'First tab',
    content: (
      <div>
        First Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
        est laborum.
      </div>
    ),
  },
  {
    label: 'Second tab',
    defaultActive: true,
    content: (
      <div>
        Second Lorem ipsum dolor sit amet, sunt in culpa qui officia deserunt mollit
        anim id est laborum,consectetur adipisicing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
      </div>
    ),
  },

  {
    label: 'Third tab',
    content: (
      <div>
        Third Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
        ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
        dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, consectetur
        adipisicing elit, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>
    ),
  },
];

export default {
  title: 'UI/MSimpleTabs',
  component: MSimpleTabs,
  argTypes: {
    border: { control: 'boolean' },
    vertical: { control: 'boolean' },
    pills: { control: 'boolean' },
    steps: { control: 'boolean' },
    sections: {
      type: {
        required: true,
      },
      defaultValue: defaultSections,
    },
    // label: { control: { type: 'text' }, defaultValue: 'Accept', type: { required: true } },
    className: {
      defaultValue: '',
      control: {
        type: 'select',
        options: [
          'm-auto',
        ],
      },
    },
    contentClassNames: {
      defaultValue: '',
      control: {
        type: 'select',
        options: [
          'm-auto',
        ],
      },
    },
  },
};

// eslint-disable-next-line
const Template = (args) => <MSimpleTabs {...args} />;

export const Basics = Template.bind({});
Basics.props = {
  sections: [
    {
      label: 'hola',
      content: (<div>hola</div>),
    },
  ],
};

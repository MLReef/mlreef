import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
// import { Story, Meta } from '@storybook/react/types-6-0';

import MButton from 'components/ui/MButton';

export default {
  title: 'UI/MButton',
  component: MButton,
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    waiting: { control: 'boolean' },
    disabled: { control: 'boolean' },
    noDisable: { control: 'boolean' },
    label: { control: { type: 'text' }, defaultValue: 'Accept', type: { required: true } },
    className: {
      defaultValue: 'btn btn-primary',
      control: {
        type: 'select',
        options: [
          'btn btn-primary',
          'btn btn-basic-primary',
          'btn btn-outline-primary',
          'btn btn-primary btn-sm',
          'btn btn-basic-primary btn-sm',
          'btn btn-outline-primary btn-sm',
        ],
      },
    },
  },
};

// eslint-disable-next-line
const Template = (args) => <MButton {...args} />;

export const Basics = Template.bind({});

export const SelfControlled = (args) => {
  const [waiting, setWaiting] = useState(false);

  const onClick = () => {
    setWaiting(true);
    setTimeout(() => setWaiting(false), 2000);
  };

  return (
    // eslint-disable-next-line
    <MButton {...args} waiting={waiting} onClick={onClick}>
      Send
    </MButton>
  );
};

import React, { useState } from 'react';
import MImageUpload from './MImageUpload';

export default {
  title: 'UI/MImageUpload',
  component: MImageUpload,
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
    },
    label: {
      control: { type: 'text' },
      defaultValue: 'Public',
      type: { required: true },
    },
    className: {
      defaultValue: '',
      control: {
        type: 'select',
        options: [
          'btn btn-primary',
        ],
      },
    },
  },
};

// eslint-disable-next-line
const Template = (args) => <MImageUpload {...args} />;

export const Basics = Template.bind({});
Basics.args = {
  icon: '/images/public-01.svg',
};

export const NoIcon = Template.bind({});
NoIcon.args = {
  icon: null,
  label: 'Any label',
};

export const ControlledGroup = (args) => {
  const [value, setValue] = useState();

  const onClick = (v) => {
    setValue(v);
  };

  return (
    <div>
      <MImageUpload
        {...args}
        icon="/images/public-01.svg"
        checked={value === '1'}
        onClick={onClick}
        color="var(--info)"
        name="one-name"
        value="1"
      />
      <MImageUpload
        {...args}
        checked={value === '2'}
        onClick={onClick}
        label="Private"
        color="var(--danger)"
        icon="/images/Lock-01.svg"
        name="one-name"
        value="2"
      />
    </div>

  );
};

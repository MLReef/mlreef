import React, { useState } from 'react';
import MRichCheckButton from 'components/ui/MRichCheckButton';

export default {
  title: 'UI/MRichCheckButton',
  component: MRichCheckButton,
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
    subLabel: {
      control: { type: 'text' },
      defaultValue: 'The project can be accessed without any authentification.',
    },
    disabled: {
      control: { type: 'boolean' },
    },
    radius: {
      control: { type: 'boolean' },
      defaultValue: true,
    },
    checked: {
      control: { type: 'boolean' },
      defaultValue: true,
    },
    value: {
      control: { type: 'text' },
      defaultValue: '1',
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
const Template = (args) => <MRichCheckButton {...args} />;

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
      <MRichCheckButton
        {...args}
        icon="/images/public-01.svg"
        checked={value === '1'}
        onClick={onClick}
        color="var(--info)"
        name="one-name"
        value="1"
      />
      <MRichCheckButton
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

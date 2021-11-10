import React, { useState } from 'react';
import MRichRadioGroup from 'components/ui/MRichRadioGroup';

export default {
  title: 'UI/MRichRadioGroup',
  component: MRichRadioGroup,
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Callback function',
      type: { name: 'function', required: true },
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

const options = [
  {
    label: 'Public',
    subLabel: 'The project can be accessed without any authentification.',
    color: 'var(--info)',
    value: 'public',
    icon: '/images/public-01.svg',
  },
  {
    label: 'Private',
    subLabel: 'Project access must be granted explicitly for every user.',
    color: 'var(--danger)',
    value: 'private',
    icon: '/images/Lock-01.svg',
  },
];

export const Basics = () => {
  const [value, setValue] = useState();

  const onClick = (v) => {
    setValue(v);
  };

  return (
    <MRichRadioGroup
      onClick={onClick}
      color="var(--info)"
      name="one-name"
      value={value}
      options={options}
    />
  );
};

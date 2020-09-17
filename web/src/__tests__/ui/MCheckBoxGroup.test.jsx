import React from 'react';
import { mount } from 'enzyme';
import MCheckBoxGroup from 'components/ui/MCheckBoxGroup';

const onSelect = jest.fn();

const setup = ({ options, value, name = 'name' }) => mount(
  <MCheckBoxGroup
    name={name}
    options={options}
    value={value}
    onSelect={onSelect}
  />,
);

describe('MCheckBoxGroup basics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup({
      value: 2,
      options: [
        { label: 'Firt option', value: 1 },
        { label: 'Second option', value: 2 },
        { label: 'Third option', value: 3 },
      ],
    });
  });

  test('assert that options are rendered', () => {
    const options = wrapper.find('.m-check-box-group-option-btn');
    expect(options).toHaveLength(3);
    expect(options.find('MCheckBox')).toHaveLength(3);
  });

  test('assert that value changes correctly', () => {
    const options = wrapper.find('.m-check-box-group-option-btn');
    options.first().simulate('click');

    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

import React from 'react';
import { shallow, mount } from 'enzyme';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';

const setup = (options = { checked: false }) => shallow(
  <MCheckBox name="test-group" labelValue="Option 1" callback={() => {}} checked={options.checked} />,
);

const setupWithMount = (options = { checked: false }) => mount(
  <MCheckBox name="test-group" labelValue="Option 1" callback={() => {}} checked={options.checked} />,
);

describe('check elements in DOM and test state', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that checkbox contains all the initial components', () => {
    expect(wrapper.find('div')).toHaveLength(1);
    expect(wrapper.find('p')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(1);
    expect(wrapper.find('span')).toHaveLength(1);
  });

  test('assert that checked property changes after click event', () => {
    const mockSetValue = jest.fn();
    React.useState = jest.fn(() => [false, mockSetValue]);

    wrapper = setup();
    const button = wrapper.find('div');
    button.simulate('click', {});

    expect(mockSetValue).toHaveBeenCalledWith(true);
  });
});

describe('test props updating state', () => {
  test('assert that checked prop changes state', () => {
    const mockSetValue = jest.fn();
    React.useState = jest.fn(() => [false, mockSetValue]);
    setupWithMount({ checked: true });
    expect(mockSetValue).toHaveBeenCalledWith(true);
  });
});

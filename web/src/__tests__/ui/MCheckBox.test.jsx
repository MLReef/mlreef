import React from 'react';
import { shallow, mount } from 'enzyme';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';

const setup = (options = { checked: false, disabled: false, callback: () => {} }) => shallow(
  <MCheckBox name="test-group" labelValue="Option 1" callback={options.callback} checked={options.checked} disabled={options.disabled} />,
);

const setupWithMount = (options = { checked: false, disabled: false, callback: () => {} }) => mount(
  <MCheckBox name="test-group" labelValue="Option 1" callback={options.callback} checked={options.checked} disabled={options.disabled} />,
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

  test('assert that disabled prop does not let change state', () => {
    const mockSetValue = jest.fn();
    const mockCallback = jest.fn();
    React.useState = jest.fn(() => [false, mockSetValue]);
    const wrapper = setup({ checked: false, disabled: true, callback: mockCallback });
    const button = wrapper.find('div');
    button.simulate('click', {});

    expect(mockSetValue.mock.calls.length).toBe(0);
    expect(mockCallback.mock.calls.length).toBe(0);
  });
});

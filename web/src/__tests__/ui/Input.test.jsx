import React from 'react';
import Input from 'components/ui/input/input';
import { mount } from 'enzyme';

const callbackMock = jest.fn();

const setup = (callback, hasErrors) => {
  return mount(
    <Input placeholder="test-input" onBlurCallback={callback} callback={callback} hasErrors={hasErrors} />
  );
}

describe('test input comp functionality and rendering', () => {
  let wrapper;
  test('assert that callback is called', () => {
    wrapper = setup(callbackMock, false);
    wrapper.find('input').simulate('change');
    expect(callbackMock).toHaveBeenCalled();
  });

  test('assert that comp won`t break when callback is null', () => {
    wrapper = setup(null, false);
    wrapper.find('input').simulate('change');
    //only assert that component renders even tho callback is null
    expect(wrapper.find('input').props().className).toBe('grey-border'); 
  });

  test('assert that hasErrors make style change', () => {
    wrapper = setup(null, true);
    expect(wrapper.find('input').props().style.border).toBe('1px solid var(--danger)');
  });

  test('assert that on blur works', () => {
    wrapper = setup(callbackMock, false);
    wrapper.find('input').simulate('blur');
    expect(callbackMock).toHaveBeenCalled();
  });

  afterEach(() => {
    callbackMock.mockClear()
  });
});

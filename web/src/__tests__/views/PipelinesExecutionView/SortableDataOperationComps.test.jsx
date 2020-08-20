import React from 'react';
import { mount } from 'enzyme';
import { dataPipeLines } from 'testData';
import { SelectComp } from 'components/views/PipelinesExecutionView/SortableDataProcessorsList';

const dataOp = dataPipeLines[0];
const param = dataOp.parameters[10];
const options = JSON.parse(param.default_value);

const booleanParam = dataOp.parameters[8];
const booleanParam1 = dataOp.parameters[9];

const setup = (currentParm, isBoolean = false) => mount(
  <SelectComp param={currentParm} isBoolean={isBoolean} />,
);

describe('', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(param);
  });

  test('test html elements presence', () => {
    expect(wrapper.find('MTooltip')).toHaveLength(1);
    expect(wrapper.find('MTooltip').props().message).toBe(param.description);
    expect(wrapper.find('button')).toHaveLength(1);
  });
});

describe('', () => {
  let wrapper;
  test('assert that select works for list params', () => {
    wrapper = setup(param);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    expect(liElements).toHaveLength(options.length + 1);
    expect(wrapper.find('input').props().value).toBe('');
    liElements.at(1).childAt(0).simulate('click');
    expect(wrapper.find('input').props().value).toBe(options[0].value);
  });
  test('assert that button work for booleans', () => {
    wrapper = setup(booleanParam, true);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    expect(wrapper.find('input').props().value).toBe('TRUE');
    liElements.at(2).childAt(0).simulate('click');
    expect(wrapper.find('input').props().value).toBe('false');
  });
  test('assert that validations work for select fields', () => {
    wrapper = setup(booleanParam1, true);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    liElements.at(0).childAt(0).simulate('click');
    expect(wrapper.find('ErrorsDiv')).toHaveLength(1);
  });
});

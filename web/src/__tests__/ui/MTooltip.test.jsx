import React from 'react';
import { shallow } from 'enzyme';
import MTooltip from 'components/ui/MTooltip';

const setup = (options = {}) => {
  const {
    message,
    simple,
  } = options;

  return shallow(
    <MTooltip simple={simple} message={message || 'This is an info tooltip'} />,
  );
};

describe('MTooltip basics', () => {
  const wrapper = setup();

  test('Should render question mark', () => {
    expect(wrapper.find('.fa.fa-question-circle')).toHaveLength(1);
  });

  test('Should have a title prop if simple', () => {
    const simpleWrapper = setup({ simple: true });
    expect(simpleWrapper.props().title).toEqual('This is an info tooltip');
    expect(simpleWrapper.find('.m-tooltip-text')).toHaveLength(0);
  });

  test('Should have a popup if not simple', () => {
    expect(wrapper.find('.m-tooltip-text')).toHaveLength(1);
  });
});

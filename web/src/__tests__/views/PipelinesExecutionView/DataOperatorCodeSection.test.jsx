import React from 'react';
import { mount } from 'enzyme';
import DataOperatorCodeSection from 'components/views/PipelinesExecutionView/SortableDataProcessorsList/DataOperatorCodeSection/DataOperatorCodeSection';
import actions from 'components/views/PipelinesExecutionView/SortableDataProcessorsList/DataOperatorCodeSection/actionsAndFunction';
import { mockedOperations } from 'testData';

const setup = () => mount(
  <DataOperatorCodeSection processor={mockedOperations.content[0]} />,
);

describe('test basic UI presence', () => {
  let wrapper;

  beforeEach(() => {
    actions.getEntryPointFileInfo = jest.fn(() => new Promise((resolve) => resolve({ content: 'c29tZSBjb250ZW50' })));
    wrapper = setup();
  });

  test('asssert that basic rendering works', () => {
    const codeSectionRenderBtn = wrapper.find('button#open-code-section');
    expect(wrapper.find('MLoadingSpinner').length).toBe(0);
    expect(codeSectionRenderBtn.hasClass('btn-dark')).toBeTruthy();

    codeSectionRenderBtn.simulate('click');
    expect(wrapper.find('MLoadingSpinner').length).toBe(1);
    expect(actions.getEntryPointFileInfo).toHaveBeenCalled();
  });
});

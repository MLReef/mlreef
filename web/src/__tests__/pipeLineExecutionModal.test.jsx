import React from 'react';
import { mount } from 'enzyme';
import ExecutePipeLineModal from '../components/execute-pipeline-modal/executePipeLineModal';

const setup = () => mount(
  <ExecutePipeLineModal
    isShowing
    toggle={() => { }}
    amountFilesSelected={3}
    dataInstanceName="experiment-weird-exp"
    httpUrlToRepo="http://some-project.com"
  />,
);

describe('Check elements in the first render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that three buttons', () => {
    const buttonsArr = wrapper.find('button');
    expect(buttonsArr).toHaveLength(3);
  });

  test('assert that machines list is displayed after dropdown button click', () => {
    wrapper.find('#show-first-opt').simulate('click');
    expect(wrapper.find('#t-machine-selector')).toHaveLength(1);
  });
});

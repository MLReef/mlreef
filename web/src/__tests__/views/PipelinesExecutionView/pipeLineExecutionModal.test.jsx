import React from 'react';
import { mount } from 'enzyme';
import { ALGORITHM } from 'dataTypes';
import ExecutePipeLineModal from '../../../components/views/PipelinesExecutionView/ExecutePipelineModal/ExecutePipeLineModal';

const setup = () => mount(
  <ExecutePipeLineModal
    isShowing
    processorsSelected={[]}
    projectNamespace="project-name"
    projectSlug="project-slug"
    backendId="88989-08-8809809-898098809089098"
    branchSelected="master"
    type={ALGORITHM}
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

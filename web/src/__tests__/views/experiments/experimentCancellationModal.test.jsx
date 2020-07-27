import React from 'react';
import { mount } from 'enzyme';
import { experimentMock } from 'testData'
import ExperimentCancellationModal from 'components/experiments-overview/cancellationModal';

const setup = (abortClickHandler) => mount(
  <ExperimentCancellationModal
    experimentToAbort={experimentMock}
    shouldComponentRender
    abortClickHandler={abortClickHandler}
    closeModal={jest.fn()}
  />,
);

describe('test elements presence in DOM', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(() => {});
  });

  test('assert that experiment information is present in the modal', () => {
    expect(wrapper.find('#question-to-abort').text().includes(experimentMock.name)).toBe(true);
    expect(wrapper.find('#experiment-status').text().includes(experimentMock.status)).toBe(true);
    expect(wrapper.find('#owner').text().includes(experimentMock.authorName)).toBe(true);
  });
});

describe('test functionality', () => {
  test('assert that abort experiment is called with the right parameters', () => {
    const mockedFunction = jest.fn();
    const wrapper = setup(mockedFunction);
    const abortBtn = wrapper.find('button#abort-experiment');
    abortBtn.simulate('click');
    expect(mockedFunction).toHaveBeenCalledWith(experimentMock.pipelineJobInfo.id);
  });
});

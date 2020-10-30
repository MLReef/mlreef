import React from 'react';
import { mount } from 'enzyme';
import { experimentMock } from 'testData'
import ExperimentCancellationModal from 'components/experiments-overview/cancellationModal';

const setup = () => mount(
  <ExperimentCancellationModal
    experimentToAbort={experimentMock}
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

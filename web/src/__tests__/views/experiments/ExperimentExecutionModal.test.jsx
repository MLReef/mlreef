import React from 'react';
import { shallow } from 'enzyme';
import { experimentMock } from 'testData';
import ExperimentCancellationModal from 'components/experiments-overview/cancellationModal';

const abortClickHandlerMock = jest.fn();
const closeModalMock = jest.fn();

const setup = () => shallow(
  <ExperimentCancellationModal
    experimentToAbort={experimentMock}
    shouldComponentRender
    abortClickHandler={abortClickHandlerMock}
    closeModal={closeModalMock}
  />,
);

describe('test presence of elements in DOM', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that close and cancel button are executed', () => {
    expect(
      wrapper.find('p#question-to-abort').text()
        .includes(experimentMock.name),
    ).toBe(true);
    expect(
      wrapper.find('div#experiment-status').children().at(2).text()
        .includes(experimentMock.status),
    ).toBe(true);
    expect(
      wrapper.find('p#owner').text()
        .includes(experimentMock.authorName),
    ).toBe(true);

    expect(wrapper.find('button#cancel-aborting-experiment')).toHaveLength(1);
    expect(wrapper.find('button#abort-experiment')).toHaveLength(1);
  });
});

describe('test presence of elements in DOM', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that buttons are triggered', () => {
    wrapper.find('button#close-modal').simulate('click');
    wrapper.find('button#cancel-aborting-experiment').simulate('click');
    expect(closeModalMock.mock.calls.length).toBe(2);

    wrapper.find('button#abort-experiment').simulate('click');
    expect(abortClickHandlerMock).toHaveBeenCalledWith(experimentMock.pipelineJobInfo.id);
  });
});
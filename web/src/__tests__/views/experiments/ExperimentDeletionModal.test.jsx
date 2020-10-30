import React from 'react';
import { shallow } from 'enzyme';
import { experimentMock } from 'testData';
import ExperimentDeletionModal from 'components/experiments-overview/DeletionModal';
import { SUCCESS } from 'dataTypes';

const setup = () => shallow(
  <ExperimentDeletionModal
    experiment={experimentMock}
  />,
);

describe('test the DOM', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('test elements presence', () => {
    expect(wrapper.find('#question-for-delete-exp').text().includes(experimentMock.name)).toBe(true);
    expect(wrapper.find('#experiment-status').text().toLowerCase().includes(SUCCESS)).toBe(true);
    expect(wrapper.find('#owner').text().includes(experimentMock.authorName)).toBe(true);
  });
});

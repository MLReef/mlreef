import React from 'react';
import { shallow } from 'enzyme';
import { experimentMock } from 'testData';
import ExperimentDeletionModal from 'components/experiments-overview/DeletionModal';
import { SUCCESS } from 'dataTypes';

const deleteClickHandlerMock = jest.fn();
const closeModalMock = jest.fn();

const setup = (shouldComponentRender = true) => shallow(
  <ExperimentDeletionModal
    experiment={experimentMock}
    shouldRender={shouldComponentRender}
    handleCloseModal={closeModalMock}
    handleDeleteExp={deleteClickHandlerMock}
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
    expect(wrapper.find('button#cancel-deleting-experiment')).toHaveLength(1);
    expect(wrapper.find('button#delete-experiment')).toHaveLength(1);
  });
});

test('assert that no html is returned when shouldRender is false', () => {
  const wrapper = setup(false);
  expect(wrapper.isEmptyRender()).toBe(true);
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that callbacks work correctly', () => {
    wrapper.find('#cancel-deleting-experiment').simulate('click');
    expect(closeModalMock.mock.calls.length).toBe(1);
    wrapper.find('#delete-experiment').simulate('click');
    expect(deleteClickHandlerMock).toHaveBeenCalledWith(experimentMock.id);
  });
});

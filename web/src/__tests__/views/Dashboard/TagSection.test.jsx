import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import TagSection from 'components/layout/Dashboard/TagSection';
import { DashboardContext } from 'components/layout/Dashboard/DashboardContext';
import { sortingOPtions } from 'components/layout/Dashboard/constants';

const setup = (dispatch) => mount(
  <MemoryRouter>
    <DashboardContext.Provider value={[
      { sorting: sortingOPtions[1].value, minimumStars: '3', selectedDataTypes: [1, 3] },
      dispatch,
    ]}
    >
      <TagSection />
    </DashboardContext.Provider>
  </MemoryRouter>,
);

describe('test UI and functionality', () => {
  let wrapper;
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn();
    wrapper = setup(dispatch);
  });

  test('assert that basic render', () => {
    const tags = wrapper.find('button.m-tags-item');
    expect(tags).toHaveLength(4);
  });

  test('assert that data types are removed correclty from tag click', () => {
    const tags = wrapper.find('button.m-tags-item');
    tags.at(1).simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SELECTED_DATA_TYPE', payload: 3 });
  });

  test('assert that min stars is removed correclty from tag click', () => {
    const tags = wrapper.find('button.m-tags-item');
    tags.at(2).simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SORTING', payload: 0 });
  });

  test('assert that min stars is removed correclty from tag click', () => {
    const tags = wrapper.find('button.m-tags-item');

    tags.at(3).simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MINIMUM_STARS', payload: '' });
  });

  afterEach(() => {
    dispatch.mockClear();
  });
});

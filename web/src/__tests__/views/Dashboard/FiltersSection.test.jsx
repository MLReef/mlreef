import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import FiltersSections from 'components/views/DashboardV2/FiltersSections';
import { DashboardContext } from 'components/views/DashboardV2/DashboardContext';

const setup = (dispatch) => mount(
  <MemoryRouter>
    <DashboardContext.Provider value={[
      {},
      dispatch,
    ]}
    >
      <FiltersSections />
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

  test('assert that basic render works', () => {
    expect(wrapper.find('div.dashboard-v2-content-filters-content')).toHaveLength(0);
    wrapper.find('button.toggle-hide-show').simulate('click');
    expect(wrapper.find('div.dashboard-v2-content-filters-content')).toHaveLength(1);
  });

  test('assert that dispatch is called correctly for data types', () => {
    wrapper.find('button.toggle-hide-show').simulate('click');
    wrapper.find('button.m-check-box-group-option-btn').at(0).simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SELECTED_DATA_TYPE', payload: 0 });
  });

  test('assert that dispatch is called correctly for min stars', () => {
    wrapper.find('button.toggle-hide-show').simulate('click');
    wrapper.find('.dashboard-v2-content-filters-content-metrics').find('input').simulate('change', { target: { value: '4' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MINIMUM_STARS', payload: '4' });
  });

  test('assert that dispatch sorting is called', () => {
    wrapper.find('button.toggle-hide-show').simulate('click');
    wrapper.find('MRadioGroup[name="sorting-options"]').find('input.m-radio-input').at(1).simulate('click');

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SORTING', payload: 1 });
  });

  afterEach(() => {
    dispatch.mockClear();
  });
});

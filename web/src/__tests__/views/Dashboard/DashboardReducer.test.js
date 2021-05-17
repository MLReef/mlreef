import { publishedStateOptions, sortingOPtions } from 'components/layout/Dashboard/constants';
import { reducer } from 'components/layout/Dashboard/DashboardContext';

describe('test reducer code', () => {
  test('assert that data types array is set correctly', () => {
    const newState = reducer({
      selectedDataTypes: [2, 3],
    }, { type: 'SET_SELECTED_DATA_TYPE', payload: 1 });

    expect(newState.selectedDataTypes.includes(1)).toBe(true);
    expect(newState.selectedDataTypes.includes(2)).toBe(true);
    expect(newState.selectedDataTypes.includes(3)).toBe(true);

    const newState1 = reducer({
      selectedDataTypes: [1, 4, 5],
    }, { type: 'SET_SELECTED_DATA_TYPE', payload: 4 });

    expect(newState1.selectedDataTypes.includes(4)).toBe(false);
    expect(newState1.selectedDataTypes.includes(1)).toBe(true);
    expect(newState1.selectedDataTypes.includes(5)).toBe(true);
  });

  test('assert that minimum stars is updated', () => {
    const newState = reducer({
      minimumStars: 0,
    }, { type: 'SET_MINIMUM_STARS', payload: 2 });

    expect(newState.minimumStars).toBe(2);
  });

  test('assert that minimum stars is updated', () => {
    const newState = reducer({
      sorting: sortingOPtions[0],
    }, { type: 'SET_SORTING', payload: sortingOPtions[1].value });

    expect(newState.sorting).toBe(sortingOPtions[1].value);
  });

  test('assert that publishing state is updated', () => {
    const newState = reducer({
      publishState: publishedStateOptions[0].value,
    }, { type: 'SET_PUBLISH_STATE', payload: publishedStateOptions[1].value });
    expect(newState.publishState).toBe(publishedStateOptions[1].value);
  });
});

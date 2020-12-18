import 'babel-polyfill';
import * as mergeActions from 'store/actions/mergeActions';
import { mockMergeRequests } from 'testData';
import { storeFactory } from 'functions/testUtils';

describe('assert state changes after project actions are called', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({
      mergeRequests: {
        list: [],
        current: {},
      },
    });
  });

  test('assert that this action updates the jobs array in redux', () => {
    const expectedMockArr = mockMergeRequests[1];
    store.dispatch(mergeActions.setMergeRequest(expectedMockArr));
    expect(store.getState().mergeRequests.current).toStrictEqual(expectedMockArr);
  });
});

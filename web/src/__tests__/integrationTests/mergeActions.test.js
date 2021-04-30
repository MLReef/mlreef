import * as mergeActions from 'store/actions/mergeActions';
import { mockMergeRequests } from 'testData';
import { generatePromiseResponse, storeFactory } from 'functions/testUtils';

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

  test('assert that action updates the merge list', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, mockMergeRequests, 50))
    await store.dispatch(mergeActions.getMergeRequestsList(1));
    expect(store.getState().mergeRequests.list).toStrictEqual(mockMergeRequests);
  });

  test('assert that action updates a single merge request', async () => {
    const expectedMockArr = mockMergeRequests[1];
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, expectedMockArr, 50));
    await store.dispatch(mergeActions.getMergeRequest(1, 1));
    expect(store.getState().mergeRequests.current).toStrictEqual(expectedMockArr);
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

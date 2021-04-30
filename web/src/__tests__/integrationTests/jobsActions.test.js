import * as jobsActions from 'store/actions/jobsActions';
import { jobMock } from 'testData';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';

describe('asert that state changes', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({ jobs: [], });
  });
  test('assert that this action updates the jobs array in redux', async () => {
    const expectedMockArr = [jobMock];
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, expectedMockArr, 50));
    store.dispatch(jobsActions.getJobsListPerProject());
    await sleep(55);
    expect(store.getState().jobs).toStrictEqual(expectedMockArr);
  });
});

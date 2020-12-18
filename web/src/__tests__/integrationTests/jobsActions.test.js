import 'babel-polyfill';
import * as jobsActions from 'store/actions/jobsActions';
import { jobMock } from 'testData';
import { storeFactory } from 'functions/testUtils';

describe('asert that state changes', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({ jobs: [], });
  });
  test('assert that this action updates the jobs array in redux', () => {
    const expectedMockArr = [jobMock];
    store.dispatch(jobsActions.setJobsSuccesfully(expectedMockArr));
    expect(store.getState().jobs).toStrictEqual(expectedMockArr);
  });
});

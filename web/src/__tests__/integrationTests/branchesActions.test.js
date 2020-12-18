import * as branchesActions from 'store/actions/branchesActions';
import { branchesMock } from 'testData';
import { storeFactory } from 'functions/testUtils';

describe('asert that state changes', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({ branches: [] });
  });
  test('assert that this action updates the branches array in redux', () => {
    const expectedBranchesArr = branchesMock;
    store.dispatch(branchesActions.setBranchesSuccessfully(expectedBranchesArr));
    expect(store.getState().branches).toStrictEqual(expectedBranchesArr);
  });
})

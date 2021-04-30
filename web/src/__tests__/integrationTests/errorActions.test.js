import initialState from 'store/reducers/initialState';
import { storeFactory } from 'functions/testUtils';
import * as errorActions from 'store/actions/errorsActions'

describe('assert state changes after project actions are called', () => {
  let store;
  beforeEach(() => {
    store = storeFactory(initialState);
  });

  test('assert that action set the error correctly in the state', () => {
    store.dispatch(errorActions.redirectNotFound());
    const { errors } = store.getState();
    expect(errors.hasErrors).toBe(true);
    expect(errors.info).toStrictEqual({ code: 404, message: 'Not found' });
  });
});

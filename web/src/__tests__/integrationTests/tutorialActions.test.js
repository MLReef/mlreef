import { storeFactory } from 'functions/testUtils';
import * as tutorialActions from 'store/actions/tutorialActions';
import initialState from 'store/reducers/initialState';
import tutorialData from 'components/commons/Tutorial/data.json';

describe('test tutorial actions', () => {
  let store;
  beforeEach(() => {
    store = storeFactory(initialState);
  });

  test('assert tuto is active at the beginning', () => {
    const { tutorial: active } = store.getState();
    expect(active).toBeTruthy();
  });

  test('assert that user can toggle visibility', () => {
    store.dispatch(tutorialActions.toggleTutorial());
    expect(store.getState().tutorial.active).toBe(false);
  });

  test('assert that user can set active as true/false', () => {
    store.dispatch(tutorialActions.setActive(true));
    expect(store.getState().tutorial.active).toBe(true);

    store.dispatch(tutorialActions.setActive(false));
    expect(store.getState().tutorial.active).toBe(false);
  });

  test('assert user can set/update current', () => {
    store.dispatch(tutorialActions.startTutorial(tutorialData.tutorials[0]));
    expect(store.getState().tutorial.current.id).toBe(tutorialData.tutorials[0].id);

    store.dispatch(tutorialActions.updateCurrent(tutorialData.tutorials[1]));
    expect(store.getState().tutorial.current.id).toBe(tutorialData.tutorials[1].id);
  });
});

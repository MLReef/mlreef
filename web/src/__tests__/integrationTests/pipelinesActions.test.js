import { generatePromiseResponse, storeFactory } from 'functions/testUtils';
import { getProjectPipelinesByType } from 'store/actions/pipelinesActions';
import initialState from 'store/reducers/initialState';
import data from './testDataForPipelines.json';

describe('test redux actions', () => {
  let store;
  beforeEach(() => {
    jest.spyOn(global, 'fetch')
      .mockImplementation((req) => {
        let responseBody = {};
        if (req.url.includes('/api/v1/data-projects/')) {
          responseBody = data.backendPipes;
        } else if (req.url.includes('/branches')) {
          responseBody = data.gitlabBranches;
        } else {
          responseBody = data.gitlabPipes;
        }

        return generatePromiseResponse(200, true, responseBody, 50);
      });
    store = storeFactory(initialState);
  });
  test('assert that data visualizations are classified correctly', async () => {
    await store.dispatch(
      getProjectPipelinesByType(
        'some-backend-id',
        1,
        'VISUALIZATION',
      ),
    );
    expect(store.getState().visualizations).toHaveLength(5);
    expect(store.getState().visualizations[2].values).toHaveLength(2);
    expect(store.getState().visualizations[3].values).toHaveLength(1);
  });
  test('assert that data instances are classified correctly', async () => {
    await store.dispatch(
      getProjectPipelinesByType(
        'some-backend-id',
        1,
        'DATA',
      ),
    );
    expect(store.getState().datainstances).toHaveLength(5);
    expect(store.getState().datainstances[3].values).toHaveLength(2);
  });
  afterEach(() => {
    global.fetch.mockClear();
  });
});

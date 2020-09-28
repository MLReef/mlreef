import CodeProjectPublishingApi from 'apis/CodeProjectPublishing';

const api = new CodeProjectPublishingApi();

// run test with: `npm test CodePublishing.test.jsx`

describe('Can request all the Stuffs from the API', () => {
  it('should load projects data', () => api.publishCodeProject(
    'https://mlreef.com',
  )
    .then((data) => {
      // console.log('then', data);
      expect(data).toBeDefined();
    }));

  // Example test for Rainer, I have an idea, please try to use the actions instead
  // of the api directly. they are connected to redux and the redux store

  // describe('asert that state changes', () => {
  //   let store;
  //   beforeEach(() => {
  //     store = storeFactory({ jobs: [], });
  //   });
  //   test('assert that this action updates the jobs array in redux', () => {
  //     const expectedMockArr = [jobMock];
  //     store.dispatch(jobsActions.setJobsSuccesfully(expectedMockArr));
  //     expect(store.getState().jobs).toStrictEqual(expectedMockArr);
  //   });
  // });
  /*
    test('assert that this action updates the branches array in redux', () => {
        assert response code == 200
  */
});

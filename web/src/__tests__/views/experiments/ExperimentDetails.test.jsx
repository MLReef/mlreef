import React from 'react';
import { mount } from 'enzyme';
import ExperimentDetail from 'components/ExperimentDetails/ExperimentDetail';
import actions from 'components/ExperimentDetails/actions';
import { experimentMock, jobMock, projectsArrayMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

const getExperimentDetailsMock = jest.fn(() => new Promise((resolve) => resolve(experimentMock)));

const getJobsPerProjectMock = jest.fn(
  () => new Promise((resolve) => resolve([{ ...jobMock, ref: experimentMock.name }])),
);

const setup = () => {
  const store = storeFactory({ projects: projectsArrayMock.projects });
  actions.getExperimentDetails = getExperimentDetailsMock;
  actions.getJobsPerProject = getJobsPerProjectMock;
  const match = { params: { namespace: 'namespace', slug: 'some-slug', experimentId: '8789890-890890-89089' } };
  return mount(
    <MemoryRouter>
      <Provider store={store}>
        <ExperimentDetail store={store} match={match} />
      </Provider>
    </MemoryRouter>,
  );
};

describe('test the UI and functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that HTML contains basic props and they can be interacted with', () => {
    wrapper.setProps({});
    const buttons = wrapper.find('button.simple-tabs-menu-tab-btn');
    expect(buttons).toHaveLength(3);

    expect(buttons.at(0).text()).toBe('Details');
    expect(buttons.at(1).text()).toBe('Training');
    expect(buttons.at(2).text()).toBe('Files');
  });

  test('assert that life cycle methods call fetch data correctly', () => {
    expect(getExperimentDetailsMock).toHaveBeenCalled();
    expect(getJobsPerProjectMock).toHaveBeenCalled();
  });
});

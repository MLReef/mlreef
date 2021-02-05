import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { projectsArrayMock } from '../testData';
import { storeFactory } from '../functions/testUtils';
import Insights from '../components/insights/insights';

const match = {
  path: '/my-projects/:projectId/insights/-/jobs',
  url: '/my-projects/5/insights/-/jobs',
  isExact: true,
  params: {
    projectId: '5',
  },
};

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  const wrapper = mount(
    <MemoryRouter>
      <Provider store={store}>
        <Insights
          store={store}
          match={match}
        />
      </Provider>
    </MemoryRouter>,
  );
  return wrapper;
};

describe('frontend contains initial insights tab elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that insight-menu buttons are present', () => {
    expect(wrapper.find('#insights-menu').children()).toHaveLength(1);
  });

  test('assert that jobs table is shown', () => {
    expect(wrapper.find('.job-table'));
  });
});

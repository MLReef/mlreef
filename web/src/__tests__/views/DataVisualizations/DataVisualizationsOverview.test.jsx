import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import DataVisualizationOverview from 'components/views/DataVisualization/dataVisualizationOverview';
import { storeFactory } from '../../../functions/testUtils';
import { projectsArrayMock, branchesMock } from '../../../testData';
import classifiedMockedVisualizations from './testData';

const match = {
  params: { namespace: 'group-name', slug: 'my-proejct' },
};

const store = storeFactory({
  projects: projectsArrayMock.projects,
  branches: branchesMock,
  user: {
    username: 'mlreef',
    email: 'user@mlreef.com',
    auth: true,
    userInfo: {
      avatarUrl: 'https://dummy.url',
    },
    meta: {
      closedInstructions: {},
    },
    isLoading: false,
  },
  visualizations: classifiedMockedVisualizations,
});

const setup = () => mount(
  <Provider store={store}>
    <Router>
      <DataVisualizationOverview match={match} />
    </Router>
  </Provider>,
);

describe('Data instance overview contains 4 buttons', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('renders filtering functionality buttons', () => {
    expect(wrapper.find('div#buttons-container').children()).toHaveLength(5);
    expect(wrapper.find('DataVisualizationCard')).toHaveLength(2);
  });

  test('assert that in-progress button filters', () => {
    wrapper.find('button#InProgress').simulate('click');
    const cards = wrapper.find('DataVisualizationCard');
    expect(cards).toHaveLength(1);
    expect(cards.at(0).find('Link').find('a').text()).toBe('fresh-seal-18012021225907-2');
  });

  test('assert that failed button filters', () => {
    wrapper.find('button#Failed').simulate('click');
    const cards = wrapper.find('DataVisualizationCard');
    expect(cards).toHaveLength(1);
    expect(cards.at(0).find('Link').find('a').text()).toBe('fresh-seal-18012021225907-1');
  });
});

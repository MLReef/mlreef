import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { storeFactory } from '../../../functions/testUtils';
import DataInstanceOverview from '../../../components/views/Datainstances/DataInstancesOverview';
import { projectsArrayMock, branchesMock } from '../../../testData';
import classifiedMockedDatainstances from './testData';

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
  datainstances: classifiedMockedDatainstances,
});

const setup = () => mount(
  <Provider store={store}>
    <Router>
      <DataInstanceOverview match={match} />
    </Router>
  </Provider>,
);

describe('Data instance overview contains 4 buttons', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that cards are rendered', () => {
    expect(wrapper.find('DataInstancesCard')).toHaveLength(2);
  });

  test('assert that in-progress button actually filters', () => {
    wrapper.find('button#InProgress').simulate('click');
    const cards = wrapper.find('DataInstancesCard');
    expect(cards).toHaveLength(1);
    expect(cards.at(0).props().name).toBe('data-pipeline/fit-dolphin-18012021215828-1');
  });

  test('assert that canceled button actually filters', () => {
    wrapper.find('button#Failed').simulate('click');
    const cards = wrapper.find('DataInstancesCard');
    expect(cards).toHaveLength(1);
    expect(cards.at(0).props().name).toBe('data-pipeline/gentle-warwhal-18012021223245-1');
  });
});

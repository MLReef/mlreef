import React from 'react';
import { shallow, mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import 'babel-polyfill';
import { Provider } from 'react-redux';
import { storeFactory } from '../functions/testUtils';
import DataInstanceOverview from '../components/data-instance/dataInstanceOverview';
import { projectsArrayMock, branchesMock } from '../testData';

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
  },
});
const wrapper = shallow(<DataInstanceOverview store={store} />);

describe('Data instance overview contains 4 buttons', () => {
  it('renders filtering functionality buttons', () => {
    const afterDiveWrapper = wrapper.dive().dive();
    expect(afterDiveWrapper.find('#buttons-container').contains([
      <button>All</button>,
      <button>In Progress</button>,
      <button>Active</button>,
      <button>Expired</button>,
    ]));
    expect(afterDiveWrapper.find('#buttons-container').children()).toHaveLength(4);
  });
});

describe('Button filters data instances', () => {
  it('according to the parameter', () => {
    const instanceWrapper = mount((
      <Provider store={store}>
        <Router>
          <DataInstanceOverview />
        </Router>
      </Provider>
    ));
    instanceWrapper.find('#buttons-container').childAt(0).simulate('click');
    expect(instanceWrapper).toMatchSnapshot();
  });
});

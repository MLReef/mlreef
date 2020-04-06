import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';
import NewProject from '../components/new-project/newProject';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, branchesMock } from '../testData';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock.map((branch) => branch.name),
    users: projectsArrayMock.users,
  });
  const wrapper = shallow(
    <NewProject store={store} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('Assert that new project view contains the most basic components', () => {
    expect(wrapper.find('#projectTitle')).toHaveLength(1);
    expect(wrapper.find('#demo-simple-select-outlined')).toHaveLength(1);
    expect(wrapper.find('#projectSlug')).toHaveLength(1);
    expect(wrapper.find('#projectDescription')).toHaveLength(1);
    expect(wrapper.find('#free-tags')).toHaveLength(1);
    expect(wrapper.find('MCheckBox')).toHaveLength(10);
    expect(wrapper.find('.btn.btn-basic-dark')).toHaveLength(1);
    expect(wrapper.find('.btn.btn-primary')).toHaveLength(1);
  });
});

describe('test the frontend functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that function validates properly', () => {
    expect(wrapper.instance().validateProjectName('[wrong-name:project]')).toBe(false);
    expect(wrapper.instance().validateProjectName('right-project-name')).toBe(true);
  });

  test('assert that project name changes in the state', () => {
    const mockProjectName = 'new-project-name';
    const projectNameInput = wrapper.find('#projectTitle');
    const mockEvent = {
      target: {
        value: mockProjectName,
      },
    };
    projectNameInput.simulate('change', mockEvent);
    expect(wrapper.state().projectName).toBe(mockProjectName);
  });

  test('assert that data types are added to state when selected', () => {
    wrapper.find('MCheckBox').forEach((comp) => {
      comp.dive().find('button').simulate('click', {});
    });
    expect(wrapper.state().dataTypesSelected.length).toBe(4);
  });
});

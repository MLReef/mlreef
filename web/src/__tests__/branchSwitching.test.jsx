import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16';
import { RepoFeatures } from '../components/repoFeatures';
import { projectsArrayMock, branchesMock } from '../testData';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => shallow(
  <RepoFeatures
    projects={projectsArrayMock.projects}
    branch="master"
    branches={branchesMock}
    path=""
    projectId={projectsArrayMock.projects.selectedProject.id}
    updateLastCommit={() => {}}
  />,
);

describe('There should be 7 buttons', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    const buttonsArr = wrapper.find('button');
    expect(buttonsArr).toHaveLength(5);
  });
});

describe('Dropdown appears on button click', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    wrapper.find('#branch-dropdown').simulate('click');
    expect(wrapper.find('#branches-list')).toHaveLength(1);
  });
});

describe('The branches list should be displayed when dropdown button is clicked', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('dropdown of branches appear', () => {
    const component = renderer
      .create(
        <MemoryRouter>
          {wrapper}
        </MemoryRouter>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
});

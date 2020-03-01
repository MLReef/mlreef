import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16';
import { RepoFeatures } from '../components/repoFeatures';
import { projectsArrayMock } from '../testData';

Enzyme.configure({ adapter: new Adapter() });

describe('There should be 7 buttons', () => {
  it('renders without crashing given the required props', () => {
    const wrapper = shallow(<RepoFeatures projects={projectsArrayMock.projects} />);
    const buttonsArr = wrapper.find('button');
    expect(buttonsArr).toHaveLength(5);
  });
});

describe('Dropdown appears on button click', () => {
  it('renders without crashing given the required props', () => {
    const wrapper = shallow(<RepoFeatures projects={projectsArrayMock.projects} />);
    wrapper.find('#branch-dropdown').simulate('click');
    expect(wrapper.find('#branches-list')).toHaveLength(1);
  });
});

describe('The branches list should be displayed when dropdown button is clicked', () => {
  it('dropdown of branches appear', () => {
    const component = renderer
      .create(
        <MemoryRouter>
          <RepoFeatures projectId={projectsArrayMock.projects.selectedProject.id} />
        </MemoryRouter>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
});

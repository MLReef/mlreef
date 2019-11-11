import React from 'react';
import { RepoFeatures } from "../components/repoFeatures";
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

const wrapper = shallow(<RepoFeatures />);

describe('There should be 7 buttons', () => {
  it('renders without crashing given the required props', () => {
    const buttonsArr = wrapper.find('button');
    expect(buttonsArr).toHaveLength(7);
  })
})

describe('Dropdown appears on button click', () => {
  it('renders without crashing given the required props', () => {
    wrapper.find("#branch-dropdown").simulate("click");
    expect(wrapper.find("#branches-list")).toHaveLength(1);
  })
})

// test('The machines list should be displayed when dropdown button is clicked', () => {
//   wrapper.find("#show-first-opt").simulate("click"); 
//   wrapper.find("button.arrow-button").simulate("click");
//   expect(wrapper.find("#machines-list")).toHaveLength(1);
// });

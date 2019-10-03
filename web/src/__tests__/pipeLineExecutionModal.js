import React from 'react';
import ExecutePipeLineModal from "./../components/pipeline-view/executePipeLineModal";
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() })

const wrapper = mount(
  <ExecutePipeLineModal isShowing={true} toggle={() => {console.log("toggle")}} amountFilesSelected={3}/>
);

test('There should be three buttons', () => {
  const buttonsArr = wrapper.find('button');
  expect(buttonsArr).toHaveLength(3);
});

test('The machines list should be displayed when dropdown button is clicked', () => {
  wrapper.find("#show-first-opt").simulate("click"); 
  wrapper.find("button.arrow-button").simulate("click");
  expect(wrapper.find("#machines-list")).toHaveLength(1);
});

/* test('Assert if command generation from operations selected works properly', () => {
  
}); */
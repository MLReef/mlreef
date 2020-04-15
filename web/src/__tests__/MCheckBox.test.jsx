import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => shallow(
  <MCheckBox name="test-group" labelValue="Option 1" callback={() => {}} />,
);

let wrapper;
beforeEach(() => {
  wrapper = setup();
});
test('assert that checkbox contains all the initial components', () => {
  expect(wrapper.find('button')).toHaveLength(1);
  expect(wrapper.find('p')).toHaveLength(1);
  expect(wrapper.find('input')).toHaveLength(1);
  expect(wrapper.find('span')).toHaveLength(1);
});

test('assert that checked property changes after click event', () => {
  const mockSetValue = jest.fn();
  React.useState = jest.fn(() => [false, mockSetValue]);

  wrapper = setup();
  const button = wrapper.find('button');
  button.simulate('click', {});

  expect(mockSetValue).toHaveBeenCalledWith(true);
});

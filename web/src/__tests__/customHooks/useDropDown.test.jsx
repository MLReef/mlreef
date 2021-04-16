import React from 'react';
import { mount } from 'enzyme';
import useDropdown from 'customHooks/useDropdown'

const TestingDrowDown = () => {
  const [dropDownRef, toggleShow, isDropdownOpen] = useDropdown();
  return (
    <>
    <button>Trap button</button>>
    <div
      ref={dropDownRef} 
      onClick={toggleShow}
    >
      {isDropdownOpen && (
        <ul>
          <li>option 1</li>
          <li>option 2</li>
          <li>option 3</li>
        </ul>
      )}
    </div>
    </>
  );
};

const setup = () => mount(
  <TestingDrowDown />,
);

describe('', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that comp renders and deploys options correclty on click', () => {
    expect(wrapper.find('li')).toHaveLength(0);
    wrapper.find('div').simulate('click');
    expect(wrapper.find('li')).toHaveLength(3);
  });
});

import React from 'react';
import { mount } from 'enzyme';
import MDropDown from 'components/ui/MDropdown';

const dropDown = (
  <MDropDown 
    className="ml-3 my-auto"
    buttonClasses="btn btn-dark px-1"
    label="Whole drop down"
    component={(
      <div id="buttons-container">
        <button id="some-sort-of-btn-1">Some sort of btn 1</button>
        <button id="some-sort-of-btn-2">Some sort of btn 2</button>
        <button id="some-sort-of-btn-3">Some sort of btn 3</button>
        <button id="some-sort-of-btn-4">Some sort of btn 4</button>
      </div>
    )}
  />
);

const setup = () => mount(
  <>
    <button id="button-to-test">Button to test outside click</button>
    {dropDown}
  </>
  ,
);

const getShowProperty = (currentWrapper) => currentWrapper.find('div').first().hasClass('show');

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  })
  test('assert that toggle function works when an outside element is clicked', () => {
    wrapper.find('.m-dropdown-button > button').simulate('click', {});
    expect(getShowProperty(wrapper)).toBe(true);
    wrapper.find('#buttons-container').simulate('click', {});
    expect(getShowProperty(wrapper)).toBe(false);
  });
});

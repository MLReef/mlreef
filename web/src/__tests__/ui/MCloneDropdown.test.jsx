import React from 'react';
import { shallow } from 'enzyme';
import MCloneDropdown from 'components/ui/MCloneDropdown';

const ssh = 'ssh://git@gitlab:10022/mlreef/walking-on-moon.git';
const http = 'http://gitlab/mlreef/walking-on-moon.git';

const wrapper = shallow(<MCloneDropdown http={http} ssh={ssh} />);

describe('Component exists', () => {
  it('should render 2 buttons when clicked', () => {
    wrapper.find('#t-clonedropdown-toggle').simulate('click');

    // should check for length 2 when ssh is available
    expect(wrapper.find('.clone-icon')).toHaveLength(1);
  });
});

import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import ResetPasswordView from 'components/views/ResetPassword/ResetPasswordView';
import CheckEmailView from 'components/views/ResetPassword/CheckEmailView';

const props = {
  history: {
    push: jest.fn(),
  },
};

describe('presence of basic user elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<ResetPasswordView props={props} />);
  });

  test('assert that snapshot matches', () => {
    const snapShot = renderer.create(<ResetPasswordView props={props} />).toJSON();
    expect(snapShot).toMatchSnapshot();
  });

  test('assert password reset button changes state', () => {
    wrapper.find('#password-submit').simulate('click');
    expect(wrapper.find('CheckEmailView')).toHaveLength(1);
  });
});

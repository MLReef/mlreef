import React from 'react';
import { shallow } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import { userProfileMock } from 'testData';
import UserAccount from 'components/views/userSettings/UserAccount';
import 'babel-polyfill';

const setup = () => {
  const user = { userInfo: { name: 'mlreef' } };
  const store = storeFactory({
    user: userProfileMock,
  });
  const wrapper = shallow(
    <UserAccount store={store} user={user} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('presence of basic user settings elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that breadcrumb links are present', () => {
    expect(wrapper.find('.breadCrumbs-link > ul').children()).toHaveLength(3);
  });

  test('assert that user settings sidebar is present', () => {
    expect(wrapper.find('.insights-menu').children()).toHaveLength(1);
  });
});

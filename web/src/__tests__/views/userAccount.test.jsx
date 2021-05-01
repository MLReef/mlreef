import React from 'react';
import { shallow } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import { userProfileMock } from 'testData';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import UserAccount from 'components/views/userSettings/UserAccount';

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

const breadcrumbs = [
  {
    name: 'User Settings',
    href: '/profile',
  },
  {
    name: 'Profile',
    href: '/profile',
  },
];

describe('presence of basic user settings elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that breadcrumb links are present', () => {
    expect(wrapper.contains(<MBreadcrumb items={breadcrumbs} />)).toBeTruthy();
  });

  test('assert that user settings sidebar is present', () => {
    expect(wrapper.find('#profile-menu').children()).toHaveLength(1);
  });
});

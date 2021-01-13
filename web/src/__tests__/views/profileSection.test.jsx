import React from 'react';
import { shallow } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import { userProfileMock } from 'testData';
import ProfileSection from 'components/views/userSettings/ProfileSection';

const user = {
  auth: true,
  userInfo: {
    avatarUrl: 'https://www.gravatar.com/avatar/d64636c9c4cf15dd5c9e1ed6ab529100?s=80&d=identicon',
    id: 2,
    name: 'mlreef',
  },
};

const setup = () => {
  const store = storeFactory({
    user: userProfileMock,
  });
  const wrapper = shallow(
    <ProfileSection store={store} user={user} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('UI renders user profile with user data', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that user profile is rendered correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('assert that file input is present and has the right props', () => {
    const fileInput = wrapper.find('[type="file"]');
    expect(fileInput).toHaveLength(1);
    const fileInputProps = fileInput.first().props();
    expect(fileInputProps.accept).toBe('image/*');
  });

  test('assert that user avatar is displayed', () => {
    expect(wrapper.find('img').props().src).toEqual(user.userInfo.avatarUrl);
  });
});

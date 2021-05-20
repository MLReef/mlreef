import React from 'react';
import { mount } from 'enzyme';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { userProfileMock } from 'testData';
import ProfileSection from 'components/views/userSettings/ProfileSection';

const message = 'I am a great person';

const user = {
  auth: true,
  gitlab_id: 1,
  userInfo: {
    avatarUrl: 'https://www.gravatar.com/avatar/d64636c9c4cf15dd5c9e1ed6ab529100?s=80&d=identicon',
    id: 2,
    name: 'mlreef',
  },
};

const setup = () => {
  jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, { message }, 10));
  const store = storeFactory({
    user: userProfileMock,
  });
  return mount(
    <ProfileSection store={store} />,
  );
};

describe('UI renders user profile with user data', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that file input is present and has the right props', async () => {
    await sleep(20);
    wrapper.setProps({});

    expect(wrapper.find('input#user_status').props().value).toBe(message);
    const fileInput = wrapper.find('[type="file"]');
    expect(fileInput).toHaveLength(1);
    const fileInputProps = fileInput.first().props();
    expect(fileInputProps.accept).toBe('image/*');
    expect(wrapper.find('img').props().src).toEqual(user.userInfo.avatarUrl);

    const mockedFile1 = new File([''], 'new-file', { type: 'application/jpg' });

    wrapper.find('#image-file').simulate('change', { target: { files: [mockedFile1] } });

    await sleep(20);
    wrapper.setProps({});

    expect(wrapper.find('span').text()).toBe('new-file');
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { convertToSlug } from 'functions/dataParserHelpers';
import { storeFactory } from 'functions/testUtils';
import NewGroup from '../components/views/create-group/createGroup';

const setup = () => {
  const store = storeFactory({});
  const wrapper = shallow(
    <NewGroup store={store} />,
  );

  return wrapper.dive().dive();
};

describe('asserting html elements are present in first render', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that component contains the most basic elements', () => {
    expect(wrapper.find('input#group-name')).toHaveLength(1);
    expect(wrapper.find('input#group-url')).toHaveLength(1);
    expect(wrapper.find('textarea#group-description')).toHaveLength(1);
    expect(wrapper.find('button#group-avatar')).toHaveLength(1);
    expect(wrapper.find('button#create-group')).toHaveLength(1);
    expect(wrapper.find('button#cancel-group-creation')).toHaveLength(1);
  });
});

describe('assert components behavior', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that create button is disabled when state contains null data', () => {
    const onClickHandler = jest.fn();
    wrapper.instance().handleOnClickCreateGroup = onClickHandler;
    wrapper.instance().descriptionTextAreaRef = { current: { value: "" } };
    wrapper.find('button#create-group').simulate('click');

    expect(wrapper.instance().handleOnClickCreateGroup.mock.calls.length).toBe(0);
  });

  test('assert that create button is disabled when state contains invalid data', () => {
    const changeGroupNameEv = {
      currentTarget: {
        value: '..^ { new ~ group } ^..',
      },
    };
    wrapper.find('input#group-name').simulate('change', changeGroupNameEv);

    const onClickHandler = jest.fn();
    wrapper.instance().handleOnClickCreateGroup = onClickHandler;
    wrapper.instance().descriptionTextAreaRef = { current: { value: "" } };
    wrapper.find('button#create-group').simulate('click');

    expect(wrapper.instance().handleOnClickCreateGroup.mock.calls.length).toBe(0);
  });

  test('assert that group name and group url change in state after onChange event', () => {
    const mockGroupName = 'coronavirus infected dudes';
    const groupNameInput = wrapper.find('input#group-name');
    const changeEvent = {
      currentTarget: {
        value: mockGroupName,
      },
    };
    wrapper.instance().descriptionTextAreaRef = { current: { value: ""} };
    groupNameInput.simulate('change', changeEvent);
    const stateGroupName = wrapper.state().groupName;
    const stateGroupUrl = wrapper.state().groupUrl;

    expect(stateGroupName).toBe(mockGroupName);
    expect(stateGroupUrl).toBe(convertToSlug(mockGroupName));
  });

  test('assert that create group is called with the right parameters', () => {
    const changeGroupNameEv = {
      currentTarget: {
        value: 'new group',
      },
    };
    const projectDesc = 'some description';
    wrapper.find('input#group-name').simulate('change', changeGroupNameEv);
    wrapper.instance().descriptionTextAreaRef = { current: { value: projectDesc } };
    wrapper.instance().create = jest.fn();
    wrapper.find('button#create-group').simulate('click');

    expect(wrapper.instance().create).toHaveBeenCalledWith(
      changeGroupNameEv.currentTarget.value,
      convertToSlug(changeGroupNameEv.currentTarget.value),
      projectDesc,
      'private',
      null,
    );
  });
});

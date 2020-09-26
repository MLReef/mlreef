import React from 'react';
import GroupView from 'components/views/MlreefGroups/GroupView';
import { storeFactory } from 'functions/testUtils';
import { shallow } from 'enzyme';
import { groupsMock } from 'testData';

const setup = () => {
  const store = storeFactory({
    groups: groupsMock,
  });
  const match = {
    params: { groupPath: 'group-for-test' },
  };
  return shallow(
    <GroupView
      actions={{
        getGroupsList: () => {},
      }}
      match={match}
      store={store}
    />,
  ).dive().dive();
};

describe('test basic rendering for Group View', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that elements exist in the component', () => {
    expect(wrapper.find('.project-name > #projectName').first().text()).toBe('Group for Test');
    expect(wrapper.find('MEmptyAvatar')).toHaveLength(1);
    expect(wrapper.find('MParagraph').prop('text')).toBe('laala lalalata');
  });
});

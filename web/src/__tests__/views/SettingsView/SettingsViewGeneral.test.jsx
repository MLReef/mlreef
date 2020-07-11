import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import SettingsViewGeneral from 'components/views/SettingsView/SettingsViewGeneral';

const props = {
  id: 10,
  branch: 'master',
  projectName: 'Test123',
  description: 'Some test description',
  avatar: null,
  ownerId: 'test',
  projectId: 'test',
};

describe('presence of basic user elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(<SettingsViewGeneral props={props} />);
  });

  test('assert that snapshot matches', () => {
    const snapShot = renderer.create(<SettingsViewGeneral props={props} />).toJSON();
    expect(snapShot).toMatchSnapshot();
  });

  test('assert that props are tested', () => {
    const defaultProps = {
      avatar: null,
    };
    const propWrapper = mount(<SettingsViewGeneral props={defaultProps} />);
    expect((propWrapper).prop('avatar')).toEqual(null);
  });

  test('assert the functionality of accordions', () => {
    wrapper.find('#names-topics').simulate('click');
    expect(wrapper.find('m-accordion-item_content'));
  });
});

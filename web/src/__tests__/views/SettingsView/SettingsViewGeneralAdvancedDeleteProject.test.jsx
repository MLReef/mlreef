import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import DeleteProject from 'components/views/SettingsView/SettingsViewGeneralAdvancedDeleteProject';

const onDelete = () => 'deleted';

describe('basic behaviour', () => {
  test('assert that snapshot matches', () => {
    const component = (
      <DeleteProject name="Awesome project Name" onDelete={onDelete} />
    );

    const snapShot = renderer.create(component).toJSON();
    expect(snapShot).toMatchSnapshot();
  });

  test('assert that confirm button is disabled', () => {
    const wrapper = mount(
      <DeleteProject name="Awesome project Name" onDelete={onDelete} />,
    );

    const isDisabled = wrapper.find('button')
      .getElement()
      .props.disabled;

    expect(isDisabled).toBe(true);
  });
});

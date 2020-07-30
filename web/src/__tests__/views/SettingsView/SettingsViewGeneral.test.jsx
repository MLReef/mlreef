import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import { storeFactory } from 'functions/testUtils';
import SettingsViewGeneral from 'components/views/SettingsView/SettingsViewGeneral';

const initProps = {
  id: 10,
  branch: 'master',
  projectName: 'Test123',
  description: 'Some test description',
  avatar: null,
  ownerId: 'test',
  projectId: 'test',
};

const ProvidedComponent = (props) => (
  <Provider store={storeFactory({})}>
    <SettingsViewGeneral {...props} />
  </Provider>
);

describe('presence of basic user elements', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<ProvidedComponent {...initProps} />);
  });

  // skipped because it displays dynamic content
  test.skip('assert that snapshot matches', () => {
    const snapShot = renderer.create(<ProvidedComponent {...initProps} />).toJSON();
    expect(snapShot).toMatchSnapshot();
  });

  test('assert that props are tested', () => {
    const defaultProps = {
      avatar: null,
    };
    const propWrapper = mount(<ProvidedComponent {...defaultProps} />);
    expect((propWrapper).prop('avatar')).toEqual(null);
  });

  test('assert the functionality of accordions', () => {
    wrapper.find('#names-topics').simulate('click');
    expect(wrapper.find('m-accordion-item_content'));
  });
});

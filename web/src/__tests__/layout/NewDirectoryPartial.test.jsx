import React from 'react';
import { shallow } from 'enzyme';
import NewDirectoryPartial from 'components/layout/NewDirectoryPartial';

const onCancel = jest.fn();
const onSuccess = jest.fn();

const project = {
  gid: 30,
  branch: 'master',
  path: 'path-to/current directory',
};

const spiedFetch = jest.spyOn(global, 'fetch');

const getInputFromMInput = (wrapper) => (id) => wrapper
  .find(`MInput#${id}`).dive().find('input');

const setupWrapper = () => shallow(
  <NewDirectoryPartial
    gid={project.gid}
    branch={project.branch}
    targetDir={project.path}
    onCancel={onCancel}
    onSuccess={onSuccess}
  />,
);

describe('NewDirectoryPartial basics', () => {
  const wrapper = setupWrapper();
  const inputDirectory = getInputFromMInput(wrapper)('new-directory');
  const inputBranch = getInputFromMInput(wrapper)('new-branch');
  const btnAccept = wrapper.find('MButton').dive().find('button');

  test('compoments render', () => {
    expect(inputDirectory.props().type).toBe('text');
    expect(inputBranch.props().value).toBe(project.branch);
    expect(inputBranch.props().readOnly).toBe(true);
    expect(wrapper.find('#target-directory').text()).toBe(`${project.path}/`);
    expect(wrapper.find('#commit-message-input').props().value).not.toBe('');
  });

  test('button is disabled for incorrect data', () => {
    expect(btnAccept.props().disabled).toBe(true);
  });

  test('creating function is called with correct data', () => {
    inputDirectory.simulate('change', { target: { value: 'Changed' } });
    expect(wrapper.find('MButton').dive().find('button').props().disabled).toBe(false);

    wrapper.find('MButton').dive().find('button').simulate('click');
    expect(spiedFetch).toBeCalled();
  });
});

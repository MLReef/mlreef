import React from 'react';
import { shallow } from 'enzyme';
import DeleteFileModal from 'components/DeleteFileModal/DeleteFileModal';
import deleteActions from 'components/DeleteFileModal/DeleteFileActions';

const projectId = 12395599;

const branchToSelect = 'master';

const filepath = '.gitignore';

const setup = (isModalVisible) => {
  deleteActions.createCommit = jest.fn(() => new Promise((resolve) => resolve('resolve')));
  return shallow(
    <DeleteFileModal
      projectId={projectId}
      filepath={filepath}
      isModalVisible={isModalVisible}
      fileName=".gitignore"
      branches={[branchToSelect, 'test-br-1', 'test-br-2']}
      showDeleteModal={() => {}}
      namespace="someNamespace"
      slug="some-slug"
      sourceBranch={branchToSelect}
    />,
  );
};

test('assert that modal does not render when isModalVisible is false', () => {
  const modalShouldRender = false;
  const wrapper = setup(modalShouldRender);
  expect(wrapper.find('div.modal').hasClass('show')).toBe(modalShouldRender);
});

describe('test that initial elements render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(true);
  });
  test('assert that title contains file name', () => {
    expect(
      wrapper.find('.modal-header').text()
        .includes('.gitignore'),
    ).toBe(true);
    expect(wrapper.find('#commit-message')).toHaveLength(1);
    expect(wrapper.find('MInputSelect')).toHaveLength(1);
    expect(wrapper.find('button#cancel-btn')).toHaveLength(1);
    expect(wrapper.find('MButton.btn.btn-danger')).toHaveLength(1);
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(true);
  });
  test('assert that user selects commit mss and branch before deleting', () => {
    const newCommitValue = 'Delete file test';
    const textareaOnChangeEv = { target: { value: newCommitValue } };
    wrapper.find('textarea#commit-message').simulate('change', textareaOnChangeEv);

    const mselect = wrapper.find('MInputSelect').dive();
    mselect.find('ArrowButton').dive().find('button').simulate('click');
    mselect.find('li').at(1).simulate('click');

    const mButton = wrapper.find('MButton');
    expect(mButton.props().disabled).toBe(false);

    mButton.simulate('click');

    expect(
      deleteActions.createCommit,
    ).toHaveBeenCalledWith(projectId, branchToSelect, filepath, newCommitValue, null);
  });

  test('assert that API receives start_branch when branch is typed in the input', () => {
    const newCommitValue = 'Delete file test';
    const newBranch = 'new-branch';
    const textareaOnChangeEv = { target: { value: newCommitValue } };
    wrapper.find('textarea#commit-message').simulate('change', textareaOnChangeEv);

    const mselect = wrapper.find('MInputSelect').dive();
    mselect.find('ArrowButton').dive().find('button').simulate('click');
    mselect.find('input').simulate('change', { target: { value: newBranch } });

    const mButton = wrapper.find('MButton');
    expect(mButton.props().disabled).toBe(false);

    mButton.simulate('click');

    expect(
      deleteActions.createCommit,
    ).toHaveBeenCalledWith(projectId, newBranch, filepath, newCommitValue, branchToSelect);
  });
});

import React from 'react';
import DeleteBranchModal from 'components/views/BranchesListView/deleteBranchModal';
import { mount } from 'enzyme';
import { generatePromiseResponse, sleep } from 'functions/testUtils';

const toggleIsModalVisible = jest.fn();

const setup = (isModalVisible = true) => {
  jest.spyOn(global, 'fetch').mockImplementation(() => {
    return generatePromiseResponse(200, true, { message: 'works' }, 10);
  });
  return mount(
    <DeleteBranchModal
      isModalVisible={isModalVisible}
      toggleIsModalVisible={toggleIsModalVisible}
      projectId={2378123}
      branchName="master"
    />
  )
};

describe('test rendering and functions', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that comp renders and call has the right params', async () => {
    expect(wrapper.find('div.modal').props().className.includes('show')).toBeTruthy();
    wrapper.find('button').at(2).simulate('click');
    await sleep(15);
    expect(global.fetch.mock.calls.length).toBeGreaterThan(0);
    const [firstCall] = global.fetch.mock.calls;
    expect(firstCall[0].url).toContain('/api/v4/projects/2378123/repository/branches/master');
    expect(firstCall[0].method).toBe('DELETE');
  });

  test('assert that cancel button closes the modal', () => {
    wrapper.find('button').at(0).simulate('click');
    expect(toggleIsModalVisible).toHaveBeenCalledWith('', false);
  });

  test('assert that close button closes the modal', () => {
    wrapper.find('button').at(1).simulate('click');
    expect(toggleIsModalVisible).toHaveBeenCalledWith('', false);
  });

  afterEach(() => {
    toggleIsModalVisible.mockClear();
  });
});

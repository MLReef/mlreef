import React from 'react';
import { mount } from 'enzyme';
import { generatePromiseResponse, sleep } from 'functions/testUtils';
import { filesMock, projectsArrayMock } from 'testData';
import DataintanceFiles from 'components/views/Datainstances/DatainstanceFiles';
import { MemoryRouter } from 'react-router-dom';

const setup = (path = '') => mount(
  <MemoryRouter>
    <DataintanceFiles
      selectedProject={projectsArrayMock.projects.selectedProject}
      dataInsId="23123-ewf-wef-34-3-4234234"
      branchName="mocked-branch-23123-ewf-wef-34-3-4234234"
      path={path}
    />
  </MemoryRouter>,
);

describe('test the functionality of the files', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, filesMock, 50));
  });

  test('assert that folder link works', async () => {
    wrapper = setup();
    await sleep(55);
    wrapper.setProps({});
    wrapper.find('tbody').find('tr').at(0).simulate('click');
    expect(wrapper.find('Router').props().history.location.pathname)
      .toBe('/mlreef/the-project-name/-/datasets/mocked-branch-23123-ewf-wef-34-3-4234234/23123-ewf-wef-34-3-4234234/path/directory_1');
  });

  test('assert that user can comeback in the files tree', async () => {
    wrapper = setup('data');
    await sleep(55);
    wrapper.setProps({});
    const fileRows = wrapper.find('tbody').find('tr');

    expect(fileRows.length).toBe(filesMock.length + 1);
    fileRows.at(0).find('button').at(1).simulate('click');
    expect(wrapper.find('Router').props().history.action).toBe('POP');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

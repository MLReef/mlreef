import React from 'react';
import { mount } from 'enzyme';
import { generatePromiseResponse, sleep } from 'functions/testUtils';
import { filesMock } from 'testData';
import DataVisualizationFiles from 'components/views/DataVisualization/DataVisualizationFiles';
import { MemoryRouter } from 'react-router-dom';

const setup = (path = '') => mount(
  <MemoryRouter>
    <DataVisualizationFiles
      namespace="mlreef"
      slug="the-project-name"
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
      .toBe('/mlreef/the-project-name/-/tree/mocked-branch-23123-ewf-wef-34-3-4234234/directory_1');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

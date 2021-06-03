import React from 'react';
import { mount } from 'enzyme';
import { generatePromiseResponse } from 'functions/testUtils';
import DataOperatorCodeSection from 'components/views/PipelinesExecutionView/SortableDataProcessorsList/DataOperatorCodeSection/DataOperatorCodeSection';
import { dataProcessors } from './testData';

const setup = () => mount(
  <DataOperatorCodeSection
    gid={1}
    commitSha="d6789ewrfhjewfbnmokpqwsdmkl"
    entryPointPath="file_entry.py"
    processor={dataProcessors[0]}
  />,
);

describe('test basic UI presence', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() => generatePromiseResponse(
        200, true, { content: 'c29tZSBjb250ZW50' }, 15,
      ));
    wrapper = setup();
  });

  test('asssert that basic rendering works', async () => {
    const codeSectionRenderBtn = wrapper.find('button#open-code-section');
    expect(wrapper.find('MLoadingSpinner').length).toBe(0);
    expect(codeSectionRenderBtn.hasClass('btn-dark')).toBeTruthy();

    codeSectionRenderBtn.simulate('click');
    expect(wrapper.find('MLoadingSpinner').length).toBe(1);

    expect(
      global.fetch.mock.calls[0][0].url
    ).toBe('/api/v4/projects/1/repository/files/file_entry.py?ref=d6789ewrfhjewfbnmokpqwsdmkl');
  });
});

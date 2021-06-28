import React from 'react';
import { shallow } from 'enzyme';
import { filesMock } from 'testData';
import FilesTable from '../components/FilesTable/filesTable';

const setup = (files = filesMock) => shallow(
  <FilesTable files={files} headers={['Name']} onCLick={() => {}} isReturnOptVisible={false} />,
);

describe('files table should render properly', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that contains the right number of rows', () => {
    expect(wrapper.find('tbody').children()).toHaveLength(filesMock.length);
  });

  test('assert that icon item is present', () => {
    expect(wrapper.find('img')).toHaveLength(filesMock.length);
  });

  test('assert that file name is right', () => {
    wrapper.find('.file-name-link').forEach((node, index) => {
      expect(node.children().text()).toBe(filesMock[index].name);
    });
  });
});

describe('warning message shown only for 100 or more files', () => {
  let wrapper;

  test('assert that warning is not shown for less than100 files', () => {
    wrapper = setup(Array(99).fill().map((_, index) => ({
      id: `file-${index}`,
      name: `file-${index}`,
      type: 'blob',
      path: `file-${index}`,
      mode: '040000',
    })));

    expect(wrapper.find('[data-test="warning"]')).toHaveLength(0);
  });

  test('assert that warning is shown for 100 files', () => {
    wrapper = setup(Array(100).fill().map((_, index) => ({
      id: `file-${index}`,
      name: `file-${index}`,
      type: 'blob',
      path: `file-${index}`,
      mode: '040000',
    })));

    expect(wrapper.find('[data-test="warning"]')).toHaveLength(1);
  });
});

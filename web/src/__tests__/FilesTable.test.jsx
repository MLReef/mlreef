import React from 'react';
import { shallow } from 'enzyme';
import { filesMock } from 'testData';
import FilesTable from '../components/files-table/filesTable';

const setup = () => shallow(
  <FilesTable files={filesMock} headers={['Name']} onCLick={() => {}} isReturnOptVisible={false} />,
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

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import UploadFile from 'components/views/uploadFile/uploadFile';
import { branchesMock } from 'testData';
import { sleep, storeFactory } from 'functions/testUtils';

let goBackMock;
const setup = () => {
  goBackMock = jest.fn();
  const match = {
    params: { branch: 'master' },
  };
  const location = { state: { currentFilePath: 'data' } };
  const store = storeFactory({
    branches: branchesMock,
  });
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <UploadFile match={match} location={location} history={{ goBack: goBackMock }} />
      </MemoryRouter>
    </Provider>,
  );
};

describe('presence of elements and functions', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that file input is present and has the right props', () => {
    const fileInput = wrapper.find('[type="file"]');
    expect(fileInput).toHaveLength(1);
    const fileInputProps = fileInput.first().props();
    expect(fileInputProps.accept).toBe('*');
    expect(fileInputProps.multiple).toBe(true);
  });

  test('assert other elements are present in Dom', () => {
    expect(wrapper.find('textarea#commitMss-text-area')).toHaveLength(1);
    expect(wrapper.find('input#target-branch')).toHaveLength(1);
    expect(wrapper.find('button#cancel-button')).toHaveLength(1);
    expect(wrapper.find('MButton')).toHaveLength(1);
  });

  test('assert that form is valid when all fields were filled out', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise((resolve) => resolve({ ok: true })));
    expect(wrapper.find('button[type="submit"]').props().disabled).toBe(true);
    const mockFileName1 = 'a-file-to-test-1';
    const mockFileName2 = 'a-file-to-test-2';
    const mockedFile1 = new File([''], mockFileName1, { type: 'application/jpg' });
    const mockedFile2 = new File([''], mockFileName2, { type: 'application/jpg' });
    wrapper.find('.draggable-container').simulate('drop', {
      stopPropagation: () => {},
      preventDefault: () => {},
      dataTransfer: { files: [mockedFile1, mockedFile2] },
    });
    const filesInTheDom = wrapper.find('FileToSend');
    expect(filesInTheDom).toHaveLength(2);
    expect(filesInTheDom.first().props().fileName).toBe(mockFileName1);
    expect(filesInTheDom.at(1).props().fileName).toBe(mockFileName2);

    await sleep(50);
    wrapper.setProps({});

    wrapper.find('button.remove-file-button').at(1).simulate('click');
    const files = wrapper.find('FileToSend');
    expect(files).toHaveLength(1);
    const fileName = files.at(0).find('p');
    expect(fileName.text()).toBe('Uploaded a-file-to-test-1 ');

    wrapper.find('textarea#commitMss-text-area').simulate('change', { target: { value: 'some message' } });
    wrapper.find('input#target-branch').simulate('change', { target: { value: 'master-1' } });
    const startMr = wrapper.find('MCheckBox');
    expect(startMr).toHaveLength(1);
    startMr.childAt(0).simulate('click');

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.props().disabled).toBe(false);

    submitButton.simulate('click');
    const request = global.fetch.mock.calls[0][0];
    expect(request.url).toBe('/api/v4/projects/12395599/repository/commits');
    const body = JSON.parse(request._bodyInit);

    expect(body.branch).toBe('master-1');
    expect(body.start_branch).toBe('master');
    expect(body.commit_message).toBe('some message');

    const [action] = body.actions;
    expect(action.action).toBe('create');
    expect(action.file_path).toBe('//a-file-to-test-1');

    global.fetch.mockClear();
  });

  test('assert that goback is called correctly', () => {
    wrapper.find('#cancel-button').simulate('click');
    expect(goBackMock).toHaveBeenCalled();
  });
});

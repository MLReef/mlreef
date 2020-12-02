import reducer from 'components/views/uploadFile/uploadFileReducer';
import { initialState, REMOVE_FILE, SET_CONTENT, SET_PROGRESS } from 'components/views/uploadFile/uploadConstantsAndFunctions';
import FileToUpload from 'components/views/uploadFile/FileToUpload';

const fileObj1 = new FileToUpload();
fileObj1.setId('first-file');
const fileObj2 = new FileToUpload();
fileObj2.setId('second-file');
const fileObj3 = new FileToUpload();
fileObj3.setId('third-file');

const filesToUpload = [fileObj1, fileObj2, fileObj3];

describe('test reducer', () => {
  test('assert that reducer removes file from files array', () => {
    const result = reducer({
      ...initialState,
      filesToUpload,
    }, {
      type: REMOVE_FILE,
      payload: { fileId: 'second-file' },
    });

    expect(filesToUpload).toHaveLength(3);
    expect(result.filesToUpload).toHaveLength(2);
    expect(result.filesToUpload.filter((f) => f.getId() === 'second-file')).toHaveLength(0);
  });

  test('assert that reducer sets content to a file', () => {
    const content = 'some-content';
    const result = reducer({
      ...initialState,
      filesToUpload,
    }, {
      type: SET_CONTENT,
      payload: { fileId: 'third-file', content },
    });

    expect(result.filesToUpload[2].getContent()).toBe(content);
  });

  test('assert that reducer sets progress to a file', () => {
    const progress = 50;
    const result = reducer({
      ...initialState,
      filesToUpload,
    }, {
      type: SET_PROGRESS,
      payload: { fileId: 'second-file', progress },
    });

    expect(result.filesToUpload[1].getProg()).toBe(progress);
  });
});

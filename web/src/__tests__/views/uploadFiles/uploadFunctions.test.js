import { isFileExtensionForBase64Enc } from 'components/views/uploadFile/uploadConstantsAndFunctions';

describe('test basic functions', () => {
  test('assert that a files are classified to upload', () => {
    expect(isFileExtensionForBase64Enc('application/png')).toBe(true);
    expect(isFileExtensionForBase64Enc('application/pdf')).toBe(true);
    expect(isFileExtensionForBase64Enc('')).toBe(false);
  });

  test('', () => {

  });  
});

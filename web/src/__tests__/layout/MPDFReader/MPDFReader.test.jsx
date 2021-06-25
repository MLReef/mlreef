import React from 'react';
import ReactDOM from 'react-dom';
import MPDFFilesReader from 'components/layout/MPdfReader/MPDFFilesReader';
import { act } from 'react-dom/test-utils';
import { sleep } from 'functions/testUtils';

const fs = require('fs');
let container;
let base64Data;

fs.readFile('src/__tests__/layout/MPDFReader/base64.txt', (err, data) => {
  if (err) console.log(err);

  base64Data = data.toString();
});

describe('basic UI testing', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });
  test('assert that basic rendering works', async () => {
    expect.assertions(3);
    await sleep(250);
    act(() => {
      ReactDOM.render(<MPDFFilesReader data={base64Data}/> , container);
    });
    expect(document.getElementsByTagName('canvas')).toBeDefined();
    expect(document.getElementsByTagName('button').length).toBe(2);
    expect(document.getElementsByTagName('input').length).toBe(1);
    await sleep(50);
  });
});
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import ContributorsSection from 'components/views/FileviewComp/ContributorsSection';
import {
  usersArrayMock,
} from '../../../testData';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('test html elements', () => {
  let container;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((request) => {
      if (request.url.includes('/contributors')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: 200,
              ok: true,
              json: () => Promise.resolve([{ ...usersArrayMock[0].userInfo }]),
            });
          }, 200);
        });
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve({ avatar_url: 'http://avatar-url/123456' }),
          });
        }, 200);
      });
    });
  });
  test('assert that contributors array render', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      render(
        <MemoryRouter>
          <ContributorsSection gid={1} />
        </MemoryRouter>,
        container,
      );
    });

    await sleep(500);
    expect(container.textContent).toBe('1 contributor(s)');
    expect(container.innerHTML.includes('responsiveAvatar')).toBe(true);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    global.fetch.mockClear();
  });
});

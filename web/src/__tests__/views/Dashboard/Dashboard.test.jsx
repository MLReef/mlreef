import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, unmountComponentAtNode } from 'react-dom';
import DashboardV2 from 'components/views/DashboardV2';
import { sleep, storeFactory, generatePromiseResponse } from 'functions/testUtils';
import { Provider } from 'react-redux';
import { mockedOperations } from 'testData';

global.ResizeObserver = () => ({ observe: () => {} });

describe('test html elements', () => {
  let container;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(
      200,
      true,
      mockedOperations,
      100,
    ));
  });

  test('assert that Dashboard renders projects array', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    render(
      <Provider store={storeFactory({})}>
        <MemoryRouter>
          <DashboardV2 />
        </MemoryRouter>
      </Provider>,
      container,
    );

    await sleep(500);

    expect(global.fetch).toHaveBeenCalled();
    expect(container.innerHTML.includes('mlreef')).toBe(true);
    expect(container.innerHTML.includes('Add noise 22feb')).toBe(true);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    global.fetch.mockClear();
  });
});

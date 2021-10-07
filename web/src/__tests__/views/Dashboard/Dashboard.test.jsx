import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import DashboardV2 from 'components/views/DashboardV2';
import { sleep, storeFactory, generatePromiseResponse } from 'functions/testUtils';
import { Provider } from 'react-redux';
import { mockedOperations } from 'testData';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

global.ResizeObserver = () => ({ observe: () => {} });

describe('test html elements', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(
      200,
      true,
      mockedOperations,
      10,
    ));
  });

  test('assert that Dashboard renders projects array', async () => {
    act(() => {
      render(
        <Provider store={storeFactory({})}>
          <MemoryRouter>
            <DashboardV2 />
          </MemoryRouter>
        </Provider>,
      );
    });

    await sleep(50);

    expect(global.fetch).toHaveBeenCalled();
    expect((await screen.findAllByText('mlreef')).pop()).toBeDefined();
    expect((await screen.findAllByText('Add noise 22feb')).pop()).toBeDefined();

    const req = global.fetch.mock.calls[0][0];
    expect(req.url)
      .toBe(
        '/api/v1/explore/entries/search?searchable_type=DATA_PROJECT&page=0&size=10&sort=_starsCount,DESC'
      );

    // emulate on key up event to search
    const searchInput = screen.getByTestId('search-bar-input');
    act(() => {
      searchInput.setAttribute('value', 'jaja');
      fireEvent.keyUp(searchInput, { key: 'Enter' });
    });
    // Assert that after keyup the view is loading
    expect(screen.getByTestId('global-marker')
      .children.item(0)
      .getAttribute('style'))
      .toBe('animation-iteration-count: infinite; animation-duration: 1s; background-color: rgb(145, 169, 69);');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

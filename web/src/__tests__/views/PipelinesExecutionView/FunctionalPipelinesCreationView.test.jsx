import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import FunctionalExecutionPipelinesView from 'components/views/PipelinesExecutionView';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { branchesMock, filesMock, projectsArrayMock } from 'testData';
import { dataProcessors } from './testData';

let container;

describe('test the overall pipelines view behavior', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.spyOn(global, 'fetch')
      .mockImplementation((req) => {
        if (req.url.includes('explore/entries/search')) {
          return generatePromiseResponse(
            200, true, { content: dataProcessors }, 10,
          );
        } if (req.url.includes('repository/tree')) {
          return generatePromiseResponse(
            200, true, filesMock, 10,
          );
        }
        return generatePromiseResponse(
          200, true, [], 10,
        );
      });
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });
  test('assert that user can pick files and data operators from the options', async () => {
    const store = storeFactory({ branches: branchesMock, projects: projectsArrayMock.projects });
    act(() => {
      ReactDOM.render(
        <Provider store={store}>
          <Router>
            <FunctionalExecutionPipelinesView
              match={{
                path: '/mlreef/cats-and-dogs-dataset/-/datasets/new',
                params: {
                  namespace: 'namespace',
                  slug: 'slug',
                },
              }}
            />
          </Router>
        </Provider>,
        container,
      );
    });
    await sleep(50);
    act(() => {
      document.getElementById('select-data-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      document
        .getElementById('tr-file-1')
        .firstChild
        .firstChild
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await sleep(10);
    act(() => {
      document.getElementById('accept').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await sleep(10);
    act(() => {
      const processor = document.getElementById('bc65cfbf-c09c-40ec-8bd5-d984ceb0e8b1');
      const doubleClickEvent = document.createEvent('MouseEvents');
      doubleClickEvent.initEvent('dblclick', true, true);
      processor.dispatchEvent(doubleClickEvent);
    });
    expect(document.getElementById('sortable 110dce76-d28d-4350-988a-af7b40e550b0')).not.toBe(null);
  });
});

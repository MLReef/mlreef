import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DataVisualizationDetail from 'components/views/DataVisualization/dataVisualizationDetail';
import moment from 'moment';
import { PIPELINE_VIEWS_FORMAT } from 'dataTypes';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import {
  branchesMock, filesMock,
} from '../../../testData';
import { dataInsDetailsJobs, dataVisDetGit, dataVisualizationDet } from './testData';

const pushMock = jest.fn();

const history = { push: pushMock };

const match = {
  params: {
    namespace: 'my-namespace',
    slug: 'the-project-name',
    visId: '1df0c510-fec4-4fd3-bbc9-d911fbbc496e',
    path: '',
  },
};

const branches = branchesMock;

branches[0].name = 'data-visualization/special-whale-7052021150849';

const store = storeFactory({
  branches,
});

describe('Data instance details contains basic UI elements', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(({ url }) => {
      let resPayload;
      if (url.includes('/api/v1/pipelines/')) {
        resPayload = dataVisualizationDet;
      } else if (url.includes('/api/v4/projects/12395599/pipelines/618/jobs')) {
        resPayload = dataInsDetailsJobs;
      } else if (url.includes('/api/v4/projects/12395599/pipelines/')) {
        resPayload = dataVisDetGit;
      } else if (url.includes('/branches')) {
        resPayload = branches;
      } else {
        resPayload = filesMock;
      }
      return generatePromiseResponse(200, true, resPayload, 20);
    });
    act(() => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <DataVisualizationDetail match={match} history={history} />
          </MemoryRouter>
        </Provider>,
      );
    });
  });

  test('assert that comp renders pipeline information correctly', async () => {
    await sleep(350);
    const branchLink = screen.getByTestId('dataset-branch-link').getElementsByTagName('a').item(0);
    expect(branchLink).toBeDefined();
    expect(branchLink.href.includes('/my-namespace/the-project-name/-/tree/data-visualization%2Fspecial-whale-7052021150849')).toBeTruthy();

    const jobLink = screen.getByTestId('job-link').getElementsByTagName('a').item(0);
    expect(jobLink.href.includes('/my-namespace/the-project-name/insights/-/jobs/528')).toBeTruthy();

    const timeCreatedAgo = moment(
      dataVisDetGit.created_at,
    ).format(PIPELINE_VIEWS_FORMAT);
    const updatedAt = moment(
      dataVisDetGit.updated_at,
    ).format(PIPELINE_VIEWS_FORMAT);
    expect((await screen.findAllByText(timeCreatedAgo)).pop()).toBeDefined();
    expect((await screen.findAllByText(updatedAt)).pop()).toBeDefined();
    expect((await screen.findAllByText('00:05:01')).pop()).toBeDefined();

    expect(screen.findByRole('table')).toBeDefined();
    expect((await screen.findAllByText('directory_1')).pop()).toBeDefined();
    expect((await screen.findAllByText('directory_2')).pop()).toBeDefined();
    expect((await screen.findAllByText('script.py')).pop()).toBeDefined();
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

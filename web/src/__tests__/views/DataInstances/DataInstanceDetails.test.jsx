import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DataInstanceDetails from 'components/views/Datainstances/dataInstanceDetails';
import moment from 'moment';
import { PIPELINE_VIEWS_FORMAT } from 'dataTypes';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import {
  branchesMock, dataInstanceDetialsGitlab, filesMock, jobMock, mockedDataInstanceDetails,
} from '../../../testData';

const pushMock = jest.fn();

const history = { push: pushMock };

const match = {
  params: {
    namespace: 'my-namespace',
    slug: 'the-project-name',
    dataId: '1df0c510-fec4-4fd3-bbc9-d911fbbc496e',
    path: '',
  },
};

const branches = branchesMock;

branches[0].name = 'data-pipeline/gentle-warwhal-18012021223245-1';

const store = storeFactory({
  branches,
});

describe('Data instance details contains basic UI elements', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(({ url }) => {
      let resPayload;
      if (url.includes('/api/v1/pipelines/')) {
        resPayload = mockedDataInstanceDetails;
      } else if (url.includes('/api/v4/projects/12395599/pipelines/603/jobs')) {
        resPayload = [jobMock];
      } else if (url.includes('/api/v4/projects/12395599/pipelines/')) {
        resPayload = dataInstanceDetialsGitlab;
      } else if (url.includes('/branches')) {
        resPayload = branches;
      } else {
        resPayload = filesMock;
      }
      return generatePromiseResponse(200, true, resPayload, 50);
    });
    act(() => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <DataInstanceDetails match={match} history={history} />
          </MemoryRouter>
        </Provider>,
      );
    });
  });

  test('assert that comp renders pipeline information correctly', async () => {
    await sleep(300);
    const branchLink = screen.getByTestId('dataset-branch-link').getElementsByTagName('a').item(0);
    expect(branchLink).toBeDefined();
    expect(branchLink.href.includes('/my-namespace/the-project-name/-/tree/data-pipeline%2Fnice-whale-5052021182232-1')).toBeTruthy();

    const jobLink = screen.getByTestId('job-link').getElementsByTagName('a').item(0);
    // expect(jobLink.href.includes('/my-namespace/the-project-name/insights/-/jobs/386629443')).toBeTruthy();

    const timeCreatedAgo = moment(
      dataInstanceDetialsGitlab.created_at,
    ).format(PIPELINE_VIEWS_FORMAT);
    const updatedAt = moment(
      dataInstanceDetialsGitlab.updated_at,
    ).format(PIPELINE_VIEWS_FORMAT);
    expect((await screen.findAllByText(timeCreatedAgo)).pop()).toBeDefined();
    expect((await screen.findAllByText(updatedAt)).pop()).toBeDefined();
    expect((await screen.findAllByText('00:04:37')).pop()).toBeDefined();

    expect(screen.findByRole('table')).toBeDefined();
    expect((await screen.findAllByText('directory_1')).pop()).toBeDefined();
    expect((await screen.findAllByText('directory_2')).pop()).toBeDefined();
    expect((await screen.findAllByText('script.py')).pop()).toBeDefined();
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DataInstanceDetails from 'components/views/Datainstances/dataInstanceDetails';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import {
  branchesMock, filesMock, mockedDataInstanceDetails, mockedRawPipelines,
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

const setup = () => mount(
  <Provider store={store}>
    <MemoryRouter>
      <DataInstanceDetails match={match} history={history} />
    </MemoryRouter>
  </Provider>
  ,
);

describe('Data instance details contains basic UI elements', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((request) => {
      let resPayload;
      if (request.url.includes('/api/v1/pipelines/')) {
        resPayload = mockedDataInstanceDetails;
      } else if (request.url.includes('/api/v4/projects/12395599/pipelines')) {
        resPayload = mockedRawPipelines;
      } else if (request.url.includes('/branches')) {
        resPayload = branches;
      } else {
        resPayload = filesMock;
      }
      return generatePromiseResponse(200, true, resPayload, 50);
    });
    wrapper = setup();
  });

  test('assert that comp renders pipeline information correctly', async () => {
    await sleep(500);
    wrapper.setProps({});

    const contentRows = wrapper.find('.content > .content-row');
    expect(wrapper.find('button')).toHaveLength(6);
    expect(wrapper.find('.file-properties')).toHaveLength(1);
    expect(contentRows).toHaveLength(5);
    expect(
      contentRows
        .at(0)
        .childAt(0)
        .childAt(1)
        .text()
        .includes('gentle-warwhal-18012021223245-1'),
    ).toBeTruthy();

    expect(
      contentRows
        .at(0)
        .childAt(1)
        .find('button.btn-danger'),
    ).toHaveLength(1);

    expect(wrapper.find('FilesTable').find('tr.files-row')).toHaveLength(filesMock.length);

    const statusContentItem = contentRows.at(1).at(0);
    expect(statusContentItem.find('p').at(1).text().includes('failed')).toBeTruthy();

    const baseLink = '/my-namespace/the-project-name/-/repository/tree/-/commit/1ab182a63edbdbb04c9b190860d29f4215c52afc';

    const dataCardsLinks = wrapper.find('DataCard').at(0).find('a');
    const dataCardsLinks1 = wrapper.find('DataCard').at(1).find('a');
    expect(
      dataCardsLinks.at(0).props().href,
    ).toBe(`${baseLink}/path/data`);

    expect(
      dataCardsLinks.at(1).props().href,
    ).toBe(baseLink);

    expect(dataCardsLinks1.at(0).props().href).toBe('/my-namespace/commons-color-modifier');
  });

  test('assert that file events are called', async () => {
    await sleep(500);
    wrapper.setProps({});

    wrapper.find('FilesTable').find('tr.files-row').at(0).simulate('click');
    expect(pushMock)
      .toHaveBeenCalledWith('/mlreef/the-project-name/-/datasets/data-pipeline%2Fgentle-warwhal-18012021223245-1/66df3da0-ea13-41e7-8f75-f75d5b46b515/path/directory_1');
  });

  test('assert that redirection to pipeline rebuild is called', async () => {
    await sleep(500);
    wrapper.setProps({});

    wrapper.find('.pipeline-view-btn').simulate('click');
    expect(pushMock).toHaveBeenCalledWith('/my-namespace/the-project-name/-/datasets/66df3da0-ea13-41e7-8f75-f75d5b46b515/rebuild');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

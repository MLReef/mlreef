import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import PublishProcessView from 'components/views/PublishProcessView';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';
import publishingActions from 'components/views/PublishProcessView/publishingActionsAndFuncs';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';

const { selectedProject } = projectsArrayMock.projects;

const sortedJobs = [
  {
    label: 'test',
    jobs: [
      {
        id: 151,
        status: 'success',
        stage: 'test',
        name: 'job',
        ref: 'master',
        tag: false,
        coverage: null,
        allow_failure: false,
        created_at: '2020-11-03T18:28:34.258Z',
        started_at: '2020-11-03T18:28:35.274Z',
        finished_at: '2020-11-03T18:29:15.417Z',
        duration: 40.142958,
        user: {
          id: 2,
          name: 'mlreef',
          username: 'mlreef',
          state: 'active',
          avatar_url: 'https://www.gravatar.com/avatar/d64636c9c4cf15dd5c9e1ed6ab529100?s=80&d=identicon',
          web_url: 'http://ec2-18-157-161-187.eu-central-1.compute.amazonaws.com:10080/mlreef',
          created_at: '2020-09-08T07:40:24.316Z',
          bio: null,
          location: null,
          public_email: '',
          skype: '',
          linkedin: '',
          twitter: '',
          website_url: '',
          organization: null,
        },
        commit: {
          id: '563790b2ad29f7690e02573807b6e1e78d500390',
          short_id: '563790b2',
          created_at: '2020-11-03T18:28:33.000+00:00',
          parent_ids: [
            '559dcdf99b58d6b85819c57b24ca396fc3044406',
          ],
          title: 'Adding Dockerfile and .mlreef.yml files for publishing',
          message: 'Adding Dockerfile and .mlreef.yml files for publishing',
          author_name: 'mlreef',
          author_email: 'mlreef@example.org',
          authored_date: '2020-11-03T18:28:33.000+00:00',
          committer_name: 'mlreef',
          committer_email: 'mlreef@example.org',
          committed_date: '2020-11-03T18:28:33.000+00:00',
        },
        pipeline: {
          id: 201,
          sha: '563790b2ad29f7690e02573807b6e1e78d500390',
          ref: 'master',
          status: 'success',
          created_at: '2020-11-03T18:28:34.249Z',
          updated_at: '2020-11-03T18:29:15.516Z',
          web_url: 'http://ec2-18-157-161-187.eu-central-1.compute.amazonaws.com:10080/mlreef/commons-bertsent/pipelines/201',
        },
        web_url: 'http://ec2-18-157-161-187.eu-central-1.compute.amazonaws.com:10080/mlreef/commons-bertsent/-/jobs/151',
        artifacts: [
          {
            file_type: 'trace',
            size: 7541,
            filename: 'job.log',
            file_format: null,
          },
        ],
        runner: {
          id: 135,
          description: 'Packaged Dispatcher on ec2-18-157-161-187.eu-central-1.compute.amazonaws.com',
          ip_address: '172.18.0.1',
          active: true,
          is_shared: true,
          name: 'gitlab-runner',
          online: true,
          status: 'online',
        },
        artifacts_expire_at: null,
      },
    ],
  },
];

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  publishingActions.getPipelineJobs = jest.fn(() => new Promise((resolve) => resolve(sortedJobs)));
  return mount(
    <MemoryRouter>
      <Provider store={store}>
        <PublishProcessView
          match={{
            params: {
              namespace: selectedProject.namespace,
              slug: selectedProject.slug,
            },
          }}
        />
      </Provider>
    </MemoryRouter>,
  );
};

describe('test basic render and functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that MTabs renders with the right sections', () => {
    wrapper.setProps({});
    expect(publishingActions.getPipelineJobs).toHaveBeenCalled();
    const liBreads = wrapper.find('ul.m-breadcrumb-list').children();
    expect(liBreads).toHaveLength(4);
    expect(liBreads.at(0).find('a.m-breadcrumb-list-item-link').text()).toBe(selectedProject.namespace);
    expect(liBreads.at(1).find('a.m-breadcrumb-list-item-link').text()).toBe(selectedProject.slug);
    const tabs = wrapper.find('MSimpleTabs');
    expect(tabs).toHaveLength(1);
    const tabsProps = tabs.props();
    expect(tabsProps.vertical).toBe(true);
    expect(tabsProps.sections).toHaveLength(4);
    expect(wrapper.find('li.simple-tabs-menu-tab.pills')).toHaveLength(4);
  });

  test('assert that pipeline and jobs info is rendered in the overview', () => {
    wrapper.setProps({});
    expect(wrapper.find('div#unique-Overview')).toHaveLength(1);
    const paragraghsInfo1 = wrapper.find('div.publishing-process-view-content-overview-basic-info-1').children();

    const { pipeline } = sortedJobs[0].jobs[0];
    expect(paragraghsInfo1.at(0).text().includes(pipeline.id)).toBeTruthy();
    const triggeredTimeAgo = getTimeCreatedAgo(pipeline?.created_at, new Date());
    expect(paragraghsInfo1.at(1).text().includes(`triggered ${triggeredTimeAgo} ago by `)).toBeTruthy();

    const paragraghsInfo2 = wrapper.find('div.publishing-process-view-content-overview-basic-info-2').children();
    expect(paragraghsInfo2.at(1).childAt(0).text().includes('03/11/2020')).toBeTruthy();

    const paragraghsInfo3 = wrapper.find('div.publishing-process-view-content-overview-basic-info-3').children();
    expect(paragraghsInfo3.at(1).text().includes('0m 40s')).toBeTruthy();
  });
});

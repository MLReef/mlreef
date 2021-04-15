import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import Publications from 'components/views/Publications/Publications';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';
import { MemoryRouter } from 'react-router-dom';
import PublicationInfoRow from 'components/views/Publications/PublicationInfoRow';
import actions from 'components/views/Publications/PublicationActionsAndFunctions';

const namespace = 'some-namespace';
const slug = 'some-slug';

const pipe = {
  id: 8,
  sha: '20ebcbd95a0f8e49d8109051016fc99d28f823d3',
  ref: 'master',
  status: 'success',
  createdAt: '2020-11-13T03:18:34.240Z',
  updatedAt: '2020-11-13T03:19:23.171Z',
  webUrl: 'http://ec2-3-126-255-18.eu-central-1.compute.amazonaws.com:10080/mlreef/commons-bertsent/pipelines/8',
  beforeSha: '339711652c0d2576c5f5d7b2fce8afb571243e74',
  tag: false,
  yamlErrors: null,
  user: {
    id: 2,
    name: 'mlreef',
    username: 'mlreef',
    state: 'active',
    avatarUrl: 'https://www.gravatar.com/avatar/d64636c9c4cf15dd5c9e1ed6ab529100?s=80&d=identicon',
    webUrl: 'http://ec2-3-126-255-18.eu-central-1.compute.amazonaws.com:10080/mlreef',
  },
  startedAt: '2020-11-13T03:18:35.769Z',
  finishedAt: '2020-11-13T03:19:23.167Z',
  committedAt: null,
  duration: 47,
  coverage: null,
  detailedStatus: {
    icon: 'status_success',
    text: 'passed',
    label: 'passed',
    group: 'success',
    tooltip: 'passed',
    has_details: true,
    details_path: '/mlreef/commons-bertsent/pipelines/8',
    illustration: null,
    favicon: '/assets/ci_favicons/favicon_status_success-8451333011eee8ce9f2ab25dc487fe24a8758c694827a582f17f42b0a90446a2.png',
  },
};

const { projects } = projectsArrayMock;

const setup = () => {
  projects.selectedProject.pipelines = [{}];
  const store = storeFactory({ projects });
  return mount(
    <MemoryRouter>
      <Provider store={store}>
        <Publications match={{ params: { namespace, slug } }} />
      </Provider>
    </MemoryRouter>,
  );
};

const headingTitles = [
  'status',
  'method',
  'usable',
  'branch',
  'job',
  'timing',
];

describe('test elements presence and functionality', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(
      200,
      true,
      [{}],
      100,
    ));
    wrapper = setup();
  });
  test('assert that UI elements are present', () => {
    expect(wrapper.find('button#all')).toHaveLength(1);
    expect(wrapper.find('button#pending')).toHaveLength(1);
    expect(wrapper.find('button#running')).toHaveLength(1);
    expect(wrapper.find('button#failed')).toHaveLength(1);
    expect(wrapper.find('button#finished')).toHaveLength(1);
    const links = ['/', `/${namespace}/${slug}`];
    const linkNodes = wrapper.find('Link.m-breadcrumb-list-item-link');
    expect(linkNodes).toHaveLength(2);
    linkNodes.forEach((node, ind) => {
      expect(node.props().to).toBe(links[ind]);
    });
    const noPublicationsDiv = wrapper.find('div.publications-content-bottom-not-found');
    expect(noPublicationsDiv).toHaveLength(1);
    expect(noPublicationsDiv.childAt(0).is('img')).toBe(true);
    expect(noPublicationsDiv.childAt(1).is('p')).toBe(true);
    expect(noPublicationsDiv.childAt(1).text()).toBe('No publications have been made so far');

    const table = wrapper.find('table');
    expect(table).toHaveLength(1);
    const headings = wrapper.find('th');
    expect(headings).toHaveLength(6);
    headings.forEach((node, index) => {
      expect(node.childAt(0).text().toLowerCase()).toBe(headingTitles[index]);
    });
  });
});

describe('test rendering', () => {
  test('assert that "getPipelinesAdditionalInformation" is called by lifecycle methods', async () => {
    const wrapper = setup();
    actions
      .getPipelinesAdditionalInformation = jest.fn(() => new Promise((resolve) => resolve([pipe])));
    wrapper.setProps({});
    await sleep(200);
    expect(actions.getPipelinesAdditionalInformation).toHaveBeenCalled();
  });
});

const setupPublicationRow = () => shallow(
  <PublicationInfoRow namespace={namespace} slug={slug} pipe={pipe} />,
);

describe('test rendering only', () => {
  test('assert that comp renders with the right features', () => {
    const wrapper = setupPublicationRow();
    const linkToCompareWith = `/${namespace}/${slug}/-/publications/${pipe.id}`;
    const userlinkToCompareWith = `/${pipe.user.username}`;
    wrapper.find('Link.publications-content-bottom-table-content-link-to-publication').forEach((node) => {
      expect(node.props().to).toBe(linkToCompareWith);
    });

    wrapper.find('Link.publications-content-bottom-table-content-link-to-user').forEach((node) => {
      expect(node.props().to).toBe(userlinkToCompareWith);
    });
  });
});

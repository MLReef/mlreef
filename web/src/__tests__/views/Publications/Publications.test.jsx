import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Publications from 'components/views/Publications/Publications';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';
import { MemoryRouter } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import publicationTestInfo from './publicationsTestInfo.json';

const namespace = 'some-namespace';
const slug = 'some-slug';

const { projects } = projectsArrayMock;

const setup = () => {
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
  'version',
  'usable',
  'branch',
  'job',
  'timing',
];

describe('test elements presence and functionality', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((req) => {
      let bodyRes = publicationTestInfo.publicationBEResponse;
      if (req.url.includes('/api/v4/projects/12395599/pipelines/')) {
        bodyRes = publicationTestInfo.pipelineGitlabResponse;
      }

      return generatePromiseResponse(
        200,
        true,
        bodyRes,
        10,
      );
    });
    wrapper = setup();
  });
  test('assert that UI elements are present', async () => {
    await sleep(100);
    wrapper.setProps({});
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

    const table = wrapper.find('table');
    expect(table).toHaveLength(1);
    const headings = wrapper.find('th');
    expect(headings).toHaveLength(6);
    headings.forEach((node, index) => {
      expect(node.childAt(0).text().toLowerCase()).toBe(headingTitles[index]);
    });

    const publicationRows = wrapper.find('PublicationInfoRow');
    expect(publicationRows).toHaveLength(2);
    const { content } = publicationTestInfo.publicationBEResponse;

    publicationRows.forEach((pubRowNode, ind) => {
      const tds = pubRowNode.find('td');

      expect(tds.at(0).find('p').text()).toBe('PUBLISHED');
      expect(tds.at(1).find('p').text()).toBe('1');
      expect(tds.at(2).find('Link').at(0).props().to)
        .toBe('/some-namespace/some-slug/-/publications/691');
      expect(tds.at(3).find('p').text())
        .toBe(content[ind].branch);
      expect(tds.at(4).find('p').text().includes('#691'))
        .toBeTruthy();
      expect(tds.at(4).find('a').props().href).toBe('/mlreef');
      expect(tds.at(4).find('img').props().src)
        .toBe('https://www.gravatar.com/avatar/d64636c9c4cf15dd5c9e1ed6ab529100?s=80&d=identicon');
      const sixthNodeContent = tds
        .at(5)
        .find('div');
      expect(
        sixthNodeContent
          .at(0)
          .find('p')
          .text(),
      ).toBe(dayjs(content[ind].job_started_at).format('HH:mm:ss'));
      expect(
        sixthNodeContent
          .at(1)
          .find('p')
          .text(),
      ).toBe(getTimeCreatedAgo(content[ind].job_started_at));
    });
  });
});

describe('test rendering when no publication was found', () => {
  test('assert that no pipe div is rendered', () => {
    const wrapper = setup();
    const noPublicationsDiv = wrapper.find('div.publications-content-bottom-not-found');
    expect(noPublicationsDiv).toHaveLength(1);
    expect(noPublicationsDiv.childAt(0).is('img')).toBe(true);
    expect(noPublicationsDiv.childAt(1).is('p')).toBe(true);
    expect(noPublicationsDiv.childAt(1).text()).toBe('No publications have been made so far');
  });
});

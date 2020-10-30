import React from 'react';
import { shallow } from 'enzyme';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, mockMergeRequests } from '../testData';
import MergeRequestOverview from '../components/views/MergeRequests/MergeRequestsOverview';

const push = jest.fn();

const history = { push };

const match = {
  params: { namespace: 'my-namespace', slug: 'project-slug' },
};

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    mergeRequests: {
      list: mockMergeRequests,
    },
  });

  const wrapper = shallow(
    <MergeRequestOverview match={match} store={store} history={history} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test UI and functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that comp renders with initial elements', () => {
    const filterButtons = wrapper.find('button.btn.btn-basic-dark');
    expect(filterButtons).toHaveLength(4);
    expect(filterButtons.at(0).text()).toBe('2 Open');
    expect(filterButtons.at(1).text()).toBe('1 Merged');
    expect(filterButtons.at(2).text()).toBe('0 Closed');
    expect(filterButtons.at(3).text()).toBe('All');
    expect(wrapper.find('button#new-mr-link')).toHaveLength(1);
    expect(wrapper.find('MergeRequestCard')).toHaveLength(3);
  });

  test('assert that filter buttons work', () => {
    // ------------------------ test open button ------------------------ //
    let filterButtons = wrapper.find('button.btn.btn-basic-dark');
    filterButtons.at(0).simulate('click', { currentTarget: { id: 'open' } });

    const openedcards = wrapper.find('MergeRequestCard');
    expect(openedcards).toHaveLength(1);

    expect(openedcards.at(0).dive().find('.title').text()).toBe('opened');

    // ------------------------ test merged button ------------------------ //
    filterButtons = wrapper.find('button.btn.btn-basic-dark');
    filterButtons.at(1).simulate('click', { currentTarget: { id: 'merged' } });

    const mergedCards = wrapper.find('MergeRequestCard');
    expect(mergedCards).toHaveLength(1);

    expect(mergedCards.at(0).dive().find('.title').text()).toBe('merged');

    // ------------------------ test closed button ------------------------ //
    filterButtons = wrapper.find('button.btn.btn-basic-dark');
    filterButtons.at(2).simulate('click', { currentTarget: { id: 'closed' } });

    const closedCards = wrapper.find('MergeRequestCard').dive().find('div.merge-request-card');
    expect(closedCards).toHaveLength(0);

    // ------------------------ test merged button ------------------------ //
    filterButtons = wrapper.find('button.btn.btn-basic-dark');
    filterButtons.at(3).simulate('click', { currentTarget: { id: 'all' } });

    const allCards = wrapper.find('MergeRequestCard');
    expect(allCards).toHaveLength(3);
  });

  test('assert that new merge request button is called with the right params', () => {
    wrapper.find('button#new-mr-link').simulate('click');
    const { params: { namespace, slug } } = match;

    expect(push).toHaveBeenCalledWith(`/${namespace}/${slug}/-/merge_requests/new`);
  });
});

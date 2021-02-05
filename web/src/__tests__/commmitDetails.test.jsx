import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import CommitDetails from '../components/commits-details/commitDetails';
import actions from '../components/commits-details/actionsAndFunctions';
import { commitMockObject, imagesToRender, usersArrayMock } from '../testData';

const setup = () => {
  actions.getCommitDetails = jest.fn(() => new Promise((resolve) => resolve(commitMockObject)));
  actions.loadDiffCommits = jest.fn(() => new Promise((resolve1) => resolve1({
    tp: 1,
    totalFilesChanged: 1,
    imagePromises: new Promise((resolve2) => resolve2(imagesToRender)),
  })));
  const wrapper = mount(
    <MemoryRouter>
      <Provider store={storeFactory({})}>
        <CommitDetails
          users={usersArrayMock}
          match={{
            params: {
              commitHash: 'bff668601438866cab6461a34db1b0b9bc6b67ec',
              namespace: 'some-namespace',
              slug: 'some-slug',
              branch: 'master',
            },
          }}
        />
      </Provider>
    </MemoryRouter>,
  );

  return wrapper;
};

describe('images diff', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that both images are rendered previous and new ones', () => {
    wrapper.setProps({});
    const commitSpan = wrapper.find('span.commit-authored');
    expect(commitSpan).toHaveLength(1);
    expect(commitSpan.text().includes(commitMockObject.short_id)).toBe(true);
    expect(wrapper.find('span.author').childAt(0).childAt(0).text()).toBe(commitMockObject.author_name);
    expect(wrapper.find('div.commit-message').childAt(0).childAt(0).text()).toBe(commitMockObject.message);
    expect(wrapper.find('p.stats').text().includes('Showing 1 files changed with')).toBe(true);
    expect(wrapper.find('MScrollableSection')).toHaveLength(1);
    expect(wrapper.find('ImageDiffSection')).toHaveLength(1);
    expect(wrapper.find('span.addition').text().trim().includes('0 additions')).toBe(true);
    expect(wrapper.find('span.deleted').text().trim().includes('0 deletions')).toBe(true);
  });
});

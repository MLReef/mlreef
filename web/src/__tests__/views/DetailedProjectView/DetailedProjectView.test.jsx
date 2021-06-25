import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import DetailedProjectView from 'components/views/DetailedProjectView/DetailedProjectView';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { branchesMock, commitMockObject, filesMock, usersArrayMock } from 'testData';
import testData from './projectTestData.json';

const setup = (auth) => {
  const store = storeFactory({
    user: { ...usersArrayMock[0].userInfo, auth },
  });
  jest.spyOn(global, 'fetch').mockImplementation(({ url }) => {
    let reqBody;

    if (url === '/api/v1/projects/mlreef/sign-language-classifier') {
      reqBody = testData.rawBEProj;
    } else if (url === '/api/v4/projects/2') {
      reqBody = testData.rawGitlabProj;
    } else if (url.includes('/starrers')) {
      reqBody = [];
    } else if (url.includes('/commits')) {
      reqBody = commitMockObject;
    } else if (url.includes('/tree')) {
      reqBody = filesMock;
    } else if (url.includes('/branches')) {
      reqBody = branchesMock;
    }

    return generatePromiseResponse(200, true, reqBody, 10);
  });
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <DetailedProjectView match={{
          params: {
            namespace: 'mlreef', slug: 'sign-language-classifier', path: '', branch: 'master',
          },
        }}
        />
      </MemoryRouter>
    </Provider>,
  );
};

describe('test basic rendering for data projects', () => {
  test('assert that component renders for authenticathed users', async () => {
    const wrapper = setup(true);
    await sleep(500);
    wrapper.setProps({});

    const authWrappers = wrapper.find('div.feature-list').find('AuthWrapper');
    expect(authWrappers.at(0).find('a#insights')).toHaveLength(1);
    expect(authWrappers.at(0).childAt(0).props().title).not.toBe('Please login');

    expect(wrapper.find('p#projectId').text().includes('5d005488-afb6-4a0c-852a-f471153a04b5')).toBeTruthy();
    const repoInfoLinks = wrapper.find('RepoInfo').find('Link');
    expect(repoInfoLinks.length).toBe(5);

    expect(repoInfoLinks.at(0).props().to).toBe('/mlreef/sign-language-classifier/-/commits/master');
    expect(repoInfoLinks.at(1).props().to).toBe('/mlreef/sign-language-classifier/-/branches');
    expect(repoInfoLinks.at(2).props().to).toBe('/mlreef/sign-language-classifier/-/merge_requests');
    expect(repoInfoLinks.at(3).props().to).toBe('/mlreef/sign-language-classifier/-/visualizations');
    expect(repoInfoLinks.at(4).props().to).toBe('/mlreef/sign-language-classifier/-/datasets');

    expect(wrapper.find('RepoInfo').find('.stat-no').at(1).text()).toBe('6');
    expect(wrapper.find('FilesTable').find('tr').length).toBeGreaterThan(0);
  });

  test('assert that fetch for visitors function is called', async () => {
    const wrapper = setup(false);
    await sleep(500);
    wrapper.setProps({});
    const authWrappers = wrapper.find('div.feature-list').find('AuthWrapper');

    expect(authWrappers.at(0).find('a#insights')).toHaveLength(1);
    expect(authWrappers.at(0).childAt(0).props().title).toBe('Please login');

    const repoInfoAuthWrapper = wrapper.find('RepoInfo').find('AuthWrapper');

    expect(repoInfoAuthWrapper.at(0).find('p.visualizations-count')).toHaveLength(1);
    expect(repoInfoAuthWrapper.at(0).childAt(0).props().title).toBe('Please login');

    expect(repoInfoAuthWrapper.at(1).find('p.datasets-count')).toHaveLength(1);
    expect(repoInfoAuthWrapper.at(1).childAt(0).props().title).toBe('Please login');

    const repoFeaturesAuthWrapper = wrapper.find('RepoFeatures').find('AuthWrapper');

    expect(repoFeaturesAuthWrapper.at(1).find('a').text()).toBe('Data Ops');
    expect(repoFeaturesAuthWrapper.at(1).childAt(0).props().title).toBe('Please login');

    expect(repoFeaturesAuthWrapper.at(2).find('a').text()).toBe('Data Visualization');
    expect(repoFeaturesAuthWrapper.at(2).childAt(0).props().title).toBe('Please login');
  }); 

  afterEach(() => {
    global.fetch.mockClear();
  });
});

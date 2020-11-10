import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { UnconnectedPublishingView } from 'components/views/PublishingView/PublishingView';
import { storeFactory } from 'functions/testUtils';
import { branchesMock, projectsArrayMock } from 'testData';

global.ResizeObserver = () => ({ observe: () => {} });

const setup = () => {
  const match = {
    params: { namespace: 'namespace', slug: 'some-slug' },
  };
  return mount(
    <MemoryRouter>
      <Provider store={storeFactory()}>
        <UnconnectedPublishingView
          match={match}
          project={projectsArrayMock.projects.selectedProject}
          branches={branchesMock}
          history={{ push: () => {} }}
        />
      </Provider>
    </MemoryRouter>,
  );
};

describe('PublishingView tests', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that comp renders and contains the basic comps', () => {
    expect(wrapper.find('MBreadcrumb')).toHaveLength(1);
    const liLinks = wrapper.find('li.m-breadcrumb-list-item');
    expect(liLinks).toHaveLength(3);
    const linkprops = liLinks.at(1).childAt(0).props();
    expect(linkprops.to).toBe('/namespace/some-slug');
    expect(linkprops.children).toBe('some-slug');

    expect(wrapper.find('MSimpleTabs')).toHaveLength(1);
    expect(wrapper.find('ul.simple-tabs-menu').children()).toHaveLength(3);
    expect(wrapper.find('MBranchSelector')).toHaveLength(1);
    expect(wrapper.find('div.m-file-explorer-files')).toHaveLength(1);
    expect(wrapper.find('SelectBaseEnv')).toHaveLength(1);
    expect(wrapper.find('MBricksWall')).toHaveLength(1);
    expect(wrapper.find('PublishingViewPublishModel')).toHaveLength(1);
    expect(wrapper.find('.m-vertical-steps-step')).toHaveLength(6);
    expect(wrapper.find('MCheckBoxGroup')).toHaveLength(2);
    expect(wrapper.find('MCheckBox[name="acceptance-termns-checkbox"]')).toHaveLength(1);
  });
});

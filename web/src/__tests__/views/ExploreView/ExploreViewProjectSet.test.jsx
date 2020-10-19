import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { projectsArrayMock, userProfileMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import ExploreViewProjectSet from 'components/views/ExploreView/ExploreViewProjectSet';

const projects = projectsArrayMock.projects.all;
const store = storeFactory({
  user: userProfileMock,
});

describe('ExploreViewProjectSet functionality', () => {
  global.ResizeObserver = () => ({ observe: jest.fn() });
  test('assert only loading gif is showed while starting', () => {
    const wrapper = mount(
      <MemoryRouter>
        <ExploreViewProjectSet store={store} started={false} projects={projects} />
      </MemoryRouter>,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(0);
    expect(wrapper.find('.loading-image')).toHaveLength(1);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(0);
  });

  test('assert only empty icon is showed for no project', () => {
    const wrapper = mount(
      <MemoryRouter>
        <ExploreViewProjectSet store={store} started projects={[]} />
      </MemoryRouter>,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(0);
    expect(wrapper.find('.loading-image')).toHaveLength(0);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(1);
  });

  test('assert MProjectCard is showed', () => {
    const wrapper = mount(
      <MemoryRouter>
        <ExploreViewProjectSet store={store} started projects={projects} />
      </MemoryRouter>,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(1);
    expect(wrapper.find('.loading-image')).toHaveLength(0);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(0);
  });
});

describe('ExploreViewProjectSet appareance', () => {
  test('assert that snapshot matches', () => {
    const snapshot = renderer.create(
      <MemoryRouter>
        <ExploreViewProjectSet store={store} started projects={projects} />
      </MemoryRouter>,
    )
      .toJSON();

    expect(snapshot).toMatchSnapshot();
  });
});

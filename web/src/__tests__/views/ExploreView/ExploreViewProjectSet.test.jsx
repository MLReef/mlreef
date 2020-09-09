import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { projectsArrayMock } from 'testData';
import ExploreViewProjectSet from 'components/views/ExploreView/ExploreViewProjectSet';

const projects = projectsArrayMock.projects.all;

describe('ExploreViewProjectSet functionality', () => {
  global.ResizeObserver = () => ({ observe: jest.fn() });
  test('assert only loading gif is showed while starting', () => {
    const wrapper = mount(
      <ExploreViewProjectSet started={false} projects={projects} />,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(0);
    expect(wrapper.find('.loading-image')).toHaveLength(1);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(0);
  });

  test('assert only empty icon is showed for no project', () => {
    const wrapper = mount(
      <ExploreViewProjectSet started projects={[]} />,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(0);
    expect(wrapper.find('.loading-image')).toHaveLength(0);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(1);
  });

  test('assert MProjectCard is showed', () => {
    const wrapper = mount(
      <ExploreViewProjectSet started projects={projects} />,
    );

    expect(wrapper.find('MProjectCard')).toHaveLength(1);
    expect(wrapper.find('.loading-image')).toHaveLength(0);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(0);
  });
});

describe('ExploreViewProjectSet appareance', () => {
  test('assert that snapshot matches', () => {
    const snapshot = renderer.create(<ExploreViewProjectSet started projects={projects} />)
      .toJSON();

    expect(snapshot).toMatchSnapshot();
  });
});

import React from 'react';
import { mount } from 'enzyme';
import EmptyProject from 'components/projectView/emptyProject';
import { projectsArrayMock } from 'testData';
import { MemoryRouter } from 'react-router-dom';

const { projects: { selectedProject: project } } = projectsArrayMock;

const setup = () => mount(
  <MemoryRouter>
    <EmptyProject
      httpUrlToRepo={project.httpUrlToRepo}
      namespace={project.namespace}
      slug={project.slug}
    />
  </MemoryRouter>,
);

describe('', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('test elements presence', () => {
    const emptyProjProps = wrapper.find('EmptyProject').props();

    expect(emptyProjProps.httpUrlToRepo).toBe(project.httpUrlToRepo);
    expect(emptyProjProps.namespace).toBe(project.namespace);
    expect(emptyProjProps.slug).toBe(project.slug);
    const links = wrapper.find('Link');

    expect(links.at(0).props().to).toBe(`/${project.namespace}/${project.slug}/master/upload-file/path/`);
    expect(links.at(1).props().to).toBe(`/${project.namespace}/${project.slug}/-/tree/file/new`);
  });
});

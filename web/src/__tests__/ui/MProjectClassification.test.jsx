import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { ML_PROJECT } from 'dataTypes';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import { projectsArrayMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import ArrowButton from 'components/arrow-button/arrowButton';

const setup = () => mount(
  <MemoryRouter>
    <Provider store={storeFactory()}>
      <MProjectClassification
        classification={ML_PROJECT}
        userProjects={[]}
        starredProjects={[]}
        allProjects={projectsArrayMock.projects.all.map((p) => parseToCamelCase(p))}
        history={{ push: () => {}, location: { hash: '#Personal' }}}
      />
    </Provider>
  </MemoryRouter>,
);

global.ResizeObserver = () => ({ observe: jest.fn() });

test('test basic html elements', () => {
  const wrapper = setup();
  const project = projectsArrayMock.projects.all[0];
  expect(wrapper.find('MBricksWall')).toHaveLength(1);
  const projectCard = wrapper.find('MProjectCard');
  expect(projectCard).toHaveLength(1);

  expect(projectCard.find('Link.project-card-link').at(0).props().to).toBe(`/${project.gitlabNamespace}/${project.slug}`);
  const cardProps = projectCard.at(0).props();
  expect(cardProps.slug).toBe(project.slug);
  expect(cardProps.title).toBe(project.name);
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that exploring filter buttons change styles when clicked and receive the right params', () => {
    const personalBtn = wrapper.find(`#${ML_PROJECT}-personal-btn`);
    const starredBtn = wrapper.find(`#${ML_PROJECT}-starred-btn`);
    const exploreBtn = wrapper.find(`#${ML_PROJECT}-explore-btn`);
    const mockedFunc = jest.fn();
    const darkClass = 'btn-basic-dark';
    wrapper.instance().handleProjectFilterBtn = mockedFunc;
    personalBtn.simulate('click', {});
    expect(personalBtn.hasClass(darkClass)).toBe(true);

    starredBtn.simulate('click', {});
    expect(personalBtn.hasClass(darkClass)).toBe(true);

    exploreBtn.simulate('click', {});
    expect(exploreBtn.hasClass(darkClass)).toBe(true);
  });

  test('assert that side filter collapse buttons work', () => {
    const buttons = wrapper.find(ArrowButton);
    expect(wrapper.find('MCheckBox[name="ml-project dataTypes"]').length > 0).toBe(true);
    const arrBtnDataTypes = buttons.at(0);
    arrBtnDataTypes.find('button').simulate('click', {});
    expect(wrapper.find('MCheckBox[name="ml-project dataTypes"]').length).toBe(0);

    expect(wrapper.find('MCheckBox[name="ml-project framework"]').length > 0).toBe(true);
    const arrBtnFramework = buttons.at(1);
    arrBtnFramework.find('button').simulate('click', {});
    expect(wrapper.find('MCheckBox[name="ml-project framework"]').length).toBe(0);

    expect(wrapper.find('MCheckBox[name="ml-project modelTypes"]').length > 0).toBe(true);
    const arrBtnModelType = buttons.at(2);
    arrBtnModelType.find('button').simulate('click', {});
    expect(wrapper.find('MCheckBox[name="ml-project modelTypes"]').length).toBe(0);

    expect(wrapper.find('MCheckBox[name="ml-project mlCategories"]').length > 0).toBe(true);
    const arrBtnMlCat = buttons.at(3);
    arrBtnMlCat.find('button').simulate('click', {});
    expect(wrapper.find('MCheckBox[name="ml-project mlCategories"]').length).toBe(0);
  });
});

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
import { PROJECT_DATA_TYPES } from 'domain/project/ProjectDataTypes';

const {
  IMAGE, TEXT, AUDIO, VIDEO, TABULAR, NUMBER, BINARY, MODEL, TIME_SERIES, HIERARCHICAL,
} = PROJECT_DATA_TYPES;

const setup = () => mount(
  <MemoryRouter>
    <Provider store={storeFactory({ projects: projectsArrayMock.projects })}>
      <MProjectClassification
        classification={ML_PROJECT}
        dataTypes={[
          { label: TEXT, checked: false },
          { label: IMAGE, checked: false },
          { label: AUDIO, checked: false },
          { label: HIERARCHICAL, checked: false },
          { label: VIDEO, checked: false },
          { label: TABULAR, checked: false },
          { label: TIME_SERIES, checked: false },
          { label: NUMBER, checked: false },
          { label: BINARY, checked: false },
          { label: MODEL, checked: false },
        ]}
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
    const buttons = wrapper.find('#filter-div').children();
    const personalBtn = buttons.at(0);
    const starredBtn = buttons.at(1);
    const exploreBtn = buttons.at(2);
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
    expect(wrapper.find('MCheckBox').length > 0).toBe(true);
    const arrBtnDataTypes = buttons.at(0);
    arrBtnDataTypes.find('button').simulate('click', {});
    expect(wrapper.find('MCheckBox[name="ml-project dataTypes"]').length).toBe(0);
  });
});

import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { ML_PROJECT } from 'dataTypes';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import { projectsArrayMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import ArrowButton from 'components/arrow-button/arrowButton';

const setup = () => shallow(
  <MProjectClassification
    classification={ML_PROJECT}
    userProjects={[]}
    starredProjects={[]}
    allProjects={projectsArrayMock.projects.all.map((p) => parseToCamelCase(p))}
    history={{ push: () => {}, location: { hash: '#Personal'}}}
  />,
);

global.ResizeObserver = () => ({ observe: jest.fn() });

test('test html elements', () => {
  const tree = renderer.create(
    <Provider store={storeFactory()}>
      <MemoryRouter>
        <MProjectClassification
          classification={ML_PROJECT}
          userProjects={[]}
          starredProjects={[]}
          allProjects={projectsArrayMock.projects.all.map((p) => parseToCamelCase(p))}
          history={{ push: () => {}, location: { hash: '#Personal' }}}
        />
      </MemoryRouter>
    </Provider>
  )
  .toJSON();
  expect(tree).toMatchSnapshot();
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
    expect(mockedFunc).toHaveBeenCalledWith({}, '#personal');
    expect(personalBtn.hasClass(darkClass)).toBe(true);

    starredBtn.simulate('click', {});
    expect(mockedFunc).toHaveBeenCalledWith({}, '#starred');
    expect(personalBtn.hasClass(darkClass)).toBe(true);

    exploreBtn.simulate('click', {});
    expect(mockedFunc).toHaveBeenCalledWith({}, '#explore');
    expect(exploreBtn.hasClass(darkClass)).toBe(true);
  });

  test('assert that side filter collapse buttons work', () => {
    const arrBtnDataTypes = wrapper.find('ArrowButton').at(0);
    arrBtnDataTypes.dive().find('button').simulate('click', {});
    expect(wrapper.state().isDataTypesVisible).toBe(false);
    const arrBtnFramework = wrapper.find(ArrowButton).at(1);
    arrBtnFramework.dive().find('button').simulate('click', {});
    expect(wrapper.state().isFrameworksVisible).toBe(false);
    const arrBtnModelType = wrapper.find(ArrowButton).at(2);
    arrBtnModelType.dive().find('button').simulate('click', {});
    expect(wrapper.state().isModelTypesVisible).toBe(false);
    const arrBtnMlCat = wrapper.find(ArrowButton).at(3);
    arrBtnMlCat.dive().find('button').simulate('click', {});
    expect(wrapper.state().isMlCategoriesVisible).toBe(false);
  });
});

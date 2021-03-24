import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { projectsArrayMock } from 'testData';
import MyProjects from 'components/myProjects/myProjects';
import { storeFactory } from 'functions/testUtils';

global.ResizeObserver = () => ({ observe: jest.fn() });

const setup = (pushMock) => {
  const store = storeFactory({
    projects: {
      paginationInfo: { last: true },
      sorting: 'ALL',
      all: projectsArrayMock.projects.all,
      isLoading: false,
    },
  });
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <MyProjects
          location={{
            hash: '#personal',
          }}
          match={{
            params: {
              classification: 'ml-project',
            },
            path: '/dashboard/ml-project',
          }}
          history={{
            push: pushMock,
            location: {
              hash: '#personal',
              pathname: '/dashboard/ml-project',
            },
          }}
        />
      </MemoryRouter>
    </Provider>,
  );
};

describe('test basic HTML elements presence', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });
  test('basic render', () => {
    const tabs = wrapper.find('ul.m-tabs_menu_container').children();
    expect(tabs).toHaveLength(4);

    const projectSections = wrapper.find('MTabsSection');
    expect(projectSections).toHaveLength(4);

    const filterDivs = wrapper.find('#filter-div');
    expect(filterDivs).toHaveLength(4);

    filterDivs.forEach((div) => {
      expect(div.find('button')).toHaveLength(3);
    });

    const projectSects = wrapper.find('ProjectSet');
    expect(projectSects).toHaveLength(4);

    const dtypesFilters = wrapper.find('.m-project-classification-filters-dtypes');
    expect(dtypesFilters).toHaveLength(4);
  });
});

describe('test functionality', () => {
  let wrapper;
  let pushMock;
  beforeEach(() => {
    pushMock = jest.fn();
    wrapper = setup(pushMock);
  });

  test('assert that tab calls data projects endpoint', () => {
    wrapper.find('#tab-ml-project').childAt(0).simulate('click');
    expect(pushMock.mock.calls[0][0]).toBe('/dashboard/ml-project#personal');
  });

  test('assert that tab calls data projects endpoint', () => {
    wrapper.find('#tab-model').childAt(0).simulate('click');
    expect(pushMock.mock.calls[0][0]).toBe('/dashboard/model#personal');
  });

  test('assert that tab calls data projects endpoint', () => {
    wrapper.find('#tab-data-operation').childAt(0).simulate('click');
    expect(pushMock.mock.calls[0][0]).toBe('/dashboard/data-operation#personal');
  });

  test('assert that tab calls data projects endpoint', () => {
    wrapper.find('#tab-data-visualization').childAt(0).simulate('click');
    expect(pushMock.mock.calls[0][0]).toBe('/dashboard/data-visualization#personal');
  });

  test('assert that datatypes events are handled correclty', () => {
    jest.spyOn(global, 'fetch');
    const filters = wrapper.find('.m-project-classification-filters').find('.m-checkbox');

    filters.at(0)
      .simulate('click');

    filters.at(4)
      .simulate('click');

    const body = JSON.parse(global.fetch.mock.calls[1][0]._bodyText);

    expect(body.input_data_types_or[0]).toBe('TEXT');
    expect(body.input_data_types_or[1]).toBe('VIDEO');
  });

  afterEach(() => {
    pushMock.mockClear();
  });
});

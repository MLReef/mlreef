import React from 'react';
import { shallow } from 'enzyme';
import { projectsArrayMock, experimentsClassifiedMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import ExperimentsOverview, { buttons } from 'components/experiments-overview/ExperimentOverview';
import actions from 'components/experiments-overview/ExperimentActions';

const mockPush = jest.fn();

const setup = (sortesExperimentsMock = experimentsClassifiedMock) => {
  actions.getAndSortExperimentsInfo = jest
    .fn(() => new Promise((resolve) => resolve(sortesExperimentsMock)));
  const store = storeFactory({ projects: projectsArrayMock.projects });
  const wrapper = shallow(
    <ExperimentsOverview
      store={store}
      history={{ push: mockPush }}
    />,
  );
  const afterDive = wrapper.dive().dive();

  return afterDive;
};

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that top section button callbacks work', () => {
    wrapper.setProps({});
    buttons.map((btn) => btn.toLowerCase()).forEach((id) => {
      const mockedEv = { target: { id } };
      wrapper.find(`button#${id}`).simulate('click', mockedEv);
      if (id === 'all' || id === 'failed') {
        const experimentCard = wrapper.find('ExperimentCard');
        expect(experimentCard).toHaveLength(1);
      }
    });
  });

  test('assert that new experiment is called with the component function', () => {
    const { projects: { selectedProject: { namespace, slug } } } = projectsArrayMock;
    wrapper.find('#new-experiment').simulate('click');
    expect(mockPush.mock.calls.length).toBe(1);
    expect(mockPush).toHaveBeenCalledWith(`/${namespace}/${slug}/-/experiments/new`);
    mockPush.mockClear();
  });

  test('assert that filters work', () => {
    const handleButtonsClickMock = jest.fn();
    wrapper.instance().handleButtonsClick = handleButtonsClickMock;
    const id = 'failed';
    const mockedEv = { target: { id } };
    wrapper.find(`button#${id}`).simulate('click', mockedEv);
    expect(wrapper.find('ExperimentCard')).toHaveLength(1);
  });
});

describe('test utility edge cases', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup([{ values: [] }]);
  });
  test('assert that new experiment is rendered when there are no experiment', () => {
    const { projects: { selectedProject: { namespace, slug } } } = projectsArrayMock;
    wrapper.find('#new-experiment').simulate('click');
    expect(mockPush.mock.calls.length).toBe(1);
    expect(mockPush).toHaveBeenCalledWith(`/${namespace}/${slug}/-/experiments/new`);
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { projectsArrayMock, experimentsClassifiedMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import ExperimentsOverview from 'components/experiments-overview/ExperimentOverview';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

const mockPush = jest.fn();

const setup = () => {
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

/* describe('test presence of elements in DOM', () => {
  test('compare with the latest snapshot of the empty view', () => {
    const store = storeFactory({ projects: projectsArrayMock.projects });
    const component = renderer
      .create(
        <Provider store={store}>
          <MemoryRouter key="rerere">
            <ExperimentsOverview history={{ push: mockPush }} />
          </MemoryRouter>
        </Provider>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
}); */

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
    wrapper.setState({ experiments: experimentsClassifiedMock, all: experimentsClassifiedMock });
  });

  test('assert that top section button callbacks', () => {
    const handleButtonsClickMock = jest.fn();
    wrapper.instance().handleButtonsClick = handleButtonsClickMock;
    const ids = [
      'all',
      'running',
      'success',
      'failed',
      'canceled',
    ];
    ids.forEach((id) => {
      const mockedEv = { target: { id } };
      wrapper.find(`button#${id}`).simulate('click', mockedEv);
      expect(handleButtonsClickMock.mock.calls.length).toBe(1);
      expect(handleButtonsClickMock).toHaveBeenCalledWith(mockedEv);
      handleButtonsClickMock.mockClear();
    });
  });

  test('assert that new experiment is called with the component function', () => {
    const { projects: { selectedProject: { namespace, slug } } } = projectsArrayMock;
    wrapper.find('#new-experiment').dive().find('button').simulate('click');
    expect(mockPush.mock.calls.length).toBe(1);
    expect(mockPush).toHaveBeenCalledWith(`/${namespace}/${slug}/-/experiments/new`);
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

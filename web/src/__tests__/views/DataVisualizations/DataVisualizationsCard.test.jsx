import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { storeFactory } from 'functions/testUtils';
import { mount } from 'enzyme';
import DataVisualizationCard from 'components/views/DataVisualization/dataVisualizationCard';
import classifiedMockedVisualizations from './testData';

const fireModal = jest.fn();

const fetchVisualizations = jest.fn();

test('assert that snapshot matches', () => {
  const store = storeFactory({});
  const snapShot = renderer.create(
    <Provider store={store}>
      <Router>
        <DataVisualizationCard
          classification={classifiedMockedVisualizations[0]}
          namespace="mlreef"
          slug="project-slug"
          key={classifiedMockedVisualizations[0].status}
          fireModal={fireModal}
          callback={fetchVisualizations}
        />
      </Router>
    </Provider>,
  ).toJSON();
  expect(snapShot).toMatchSnapshot();
});

const setup = (index = 0) => {
  const store = storeFactory({});
  const testWrapper = mount(
    <Provider store={store}>
      <Router>
        <DataVisualizationCard
          classification={classifiedMockedVisualizations[index]}
          namespace="mlreef"
          slug="project-slug"
          key={classifiedMockedVisualizations[index].status}
          fireModal={fireModal}
          callback={fetchVisualizations}
        />
      </Router>
    </Provider>,
  );

  return testWrapper;
};

describe('assert basic UI text elements are rendered', () => {
  let wrapper;

  test('pipeline info is displayed', () => {
    wrapper = setup();
    expect(wrapper.find('img').prop('alt')).toEqual('running');
    expect(wrapper.find('.title-div').text()).toBe('In progress');
    expect(wrapper.find('Link').find('a').text()).toBe('fresh-seal-18012021225907-2');
    expect(wrapper.find('a').at(1).text()).toBe('mlreef');
  });

  test('assert that firemodal is called with running', () => {
    wrapper = setup(0);
    wrapper.find('button.btn-danger').simulate('click');
    expect(fireModal).toHaveBeenCalled();
    expect(fireModal.mock.calls[0][0].title.includes('Abort')).toBeTruthy();
  });

  test('assert that firemodal is called with running', () => {
    wrapper = setup(3);
    wrapper.find('button.btn-danger').simulate('click');
    expect(fireModal).toHaveBeenCalled();
    expect(fireModal.mock.calls[0][0].title.includes('Delete')).toBeTruthy();
  });

  afterEach(() => {
    fireModal.mockClear();
  });
});

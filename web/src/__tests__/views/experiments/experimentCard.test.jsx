import React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import Experiment from 'domain/experiments/Experiment';
import { plainToClass } from 'class-transformer';
import { experimentMock } from 'testData';
import { storeFactory } from 'functions/testUtils';

import ExperimentSummary from '../../../components/experiments-overview/ExperimentSummary';

const store = storeFactory({
});

const setup = () => shallow(
  <Provider store={store}>
    <ExperimentSummary
      experiment={plainToClass(Experiment, experimentMock)}
      projectId={123456}
      defaultBranch="master"
    />
  </Provider>,
);

describe('functionality tests', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that after clicking dropdown button the chart is rendered', () => {
    const mockEvent = { currentTarget: { classList: { contains: () => {} } } };
    const expWrapper = wrapper.find('ExperimentSummary').dive();
    const btn = expWrapper.find('ArrowButton')
      .first()
      .dive()
      .find(`button#ArrowButton-${experimentMock.slug}`);

    btn.simulate('click', mockEvent);
    expect(expWrapper.find('.data-summary')).toHaveLength(1);
  });
});

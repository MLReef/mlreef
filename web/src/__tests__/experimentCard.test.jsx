/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import ExperimentCard from '../components/experiments-overview/experimentCard';
import { checkProps } from '../functions/testUtils';

Enzyme.configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true,
});

const params = {
  projectId: 12395599,
  currentState: 'failed',
  experiments: [
    {
      currentState: 'failed',
      descTitle: 'experiment/e07a6540',
      userName: 'MLReef Demo',
      percentProgress: '100',
      eta: '0',
      modelTitle: 'Resnet 50',
      timeCreatedAgo: '2019-10-30T09:15:57.000+00:00',
      averageParams: [],
      data: {},
    },
  ],
};

const setup = () => mount(
  <ExperimentCard
    params={params}
    setSelectedExperiment={() => {}}
  />,
);

test('errors should not be thrown when props are valid', () => {
  const expectedProps = {
    params,
    setSelectedExperiment() {},
  };
  const ExpCard = setup();
  checkProps(ExpCard, expectedProps);
});

describe('validate functionality after click on arrow button', () => {
  test('showChart boolean in the state should be changed to true', () => {
    const experimentCard = setup();
    experimentCard.find('button#ArrowButton-0').simulate('click');
    expect(experimentCard.instance().state.showChart).toBe(true);
  });
  test('chart should be rendered', () => {
    const experimentCard = setup();
    experimentCard.find('button#ArrowButton-0').simulate('click');
    expect(experimentCard.find('.chart-container')).toHaveLength(1);
  });
});

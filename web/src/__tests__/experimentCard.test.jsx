/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import SummarizedDataAndChartComp from '../components/experiments-overview/summarizedDataAndChartComp';
import { checkProps } from '../functions/testUtils';

Enzyme.configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true,
});

const params = {
  projectId: 12395599,
  experiment: {
    currentState: 'failed',
    descTitle: 'experiment/e07a6540',
    userName: 'MLReef Demo',
    percentProgress: '100',
    eta: '0',
    modelTitle: 'Resnet 50',
    timeCreatedAgo: '2019-10-30T09:15:57.000+00:00',
  },
};

const setup = () => mount(
  <SummarizedDataAndChartComp experiment={params.experiment} projectId={params.projectId} />,
);

test('errors should not be thrown when props are valid', () => {
  const summarizedDataAndChartComp = setup();
  checkProps(summarizedDataAndChartComp, params);
});

test('assert that after clicking dropdown button the chart is rendered', () => {
  const wrapper = setup();
  wrapper.find('button#ArrowButton-e07a6540').simulate('click');
  expect(wrapper.find('.data-summary')).toHaveLength(1);
});

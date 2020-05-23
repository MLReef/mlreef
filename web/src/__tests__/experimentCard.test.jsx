import 'babel-polyfill';
import React from 'react';
import { shallow } from 'enzyme';
import ArrowButton from 'components/arrow-button/arrowButton';
import SummarizedDataAndChartComp from '../components/experiments-overview/summarizedDataAndChartComp';

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

const setup = () => shallow(
  <SummarizedDataAndChartComp
    experiment={params.experiment}
    projectId={params.projectId}
    defaultBranch="master"
    userParameters={[]}
    today={new Date()}
  />,
);

test('assert that after clicking dropdown button the chart is rendered', () => {
  const wrapper = setup();
  const mockEvent = { currentTarget: { classList: { contains: () => {} } } };
  const btn = wrapper.find(ArrowButton).dive().find('button#ArrowButton-e07a6540');
  btn.simulate('click', mockEvent);
  expect(wrapper.find('.data-summary')).toHaveLength(1);
});

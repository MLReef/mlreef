import 'babel-polyfill';
import React from 'react';
import { shallow } from 'enzyme';
import ArrowButton from 'components/arrow-button/arrowButton';
import SummarizedDataAndChartComp from '../components/experiments-overview/summarizedDataAndChartComp';
import Experiment from 'domain/experiments/Experiment';
import { plainToClass } from 'class-transformer';
import { experimentMock } from 'testData';

const setup = () => shallow(
  <SummarizedDataAndChartComp
    experiment={plainToClass(Experiment, experimentMock)}
  />,
);

describe('functionality tests', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that after clicking dropdown button the chart is rendered', () => {
    const mockEvent = { currentTarget: { classList: { contains: () => {} } } };
    const btn = wrapper.find(ArrowButton).dive().find(`button#ArrowButton-${experimentMock.slug}`);
    btn.simulate('click', mockEvent);
    expect(wrapper.find('.data-summary')).toHaveLength(1);
  });
});

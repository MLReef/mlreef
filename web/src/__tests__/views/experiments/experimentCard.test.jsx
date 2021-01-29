import React from 'react';
import { shallow, mount } from 'enzyme';
import Experiment from 'domain/experiments/Experiment';
import { plainToClass } from 'class-transformer';
import { experimentMock, projectsArrayMock } from 'testData';
import { storeFactory } from 'functions/testUtils';

import ExperimentSummary from '../../../components/experiments-overview/ExperimentSummary';
import { Provider } from 'react-redux';

const store = storeFactory({
  user: { username: 'mlreef', auth: true },
  projects: projectsArrayMock.projects,
});

const setup = () => mount(
  <Provider store={store}>
    <ExperimentSummary
      experiment={experimentMock}
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
    wrapper.setProps({});
    const mockEvent = { currentTarget: { classList: { contains: () => {} } } };
    wrapper.find(`button#ArrowButton-${experimentMock.slug}`).simulate('click', mockEvent);
    const dataSummarySection = wrapper.find('.data-summary');
    expect(dataSummarySection).toHaveLength(1);

    const contentChilren = dataSummarySection.find('div.content').children();
    expect(contentChilren.at(0).text().includes('Performace achieved from last epoch:'));

    expect(contentChilren.at(1).text().includes('acc: 0.6274')).toBe(true);
    expect(contentChilren.at(2).text().includes('val_acc: 0.6576')).toBe(true);
    expect(contentChilren.at(3).text().includes('loss: 4.2268')).toBe(true);
    expect(contentChilren.at(4).text().includes('val_loss: 103.7')).toBe(true);
  });
});

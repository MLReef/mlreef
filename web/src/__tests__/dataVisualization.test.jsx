/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import { DataVisualizationOverview } from '../components/data-visualization/dataVisualizationOverview';
import { projectsArrayMock, mockDataInstancesList } from '../testData';
import { RUNNING, FAILED, SUCCESS, EXPIRED } from '../dataTypes';
import DataVisualizationCard from '../components/data-visualization/dataVisualizationCard';

Enzyme.configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true,
});

const setupOverview = () => shallow(
  <DataVisualizationOverview projects={projectsArrayMock.projects}/>
);

describe('initial features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setupOverview();
  });
  test('assert that the overview contains required initial elements', () => {
    expect(wrapper.find('Instruction').length).toBe(1);
    expect(wrapper.find('#buttons-container').children().length).toBe(4);
    expect(wrapper.find('DataVisualizationCard').length).toBe(mockDataInstancesList.length);
  });
});

describe('functional tests', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setupOverview();
  });

  test('assert that cards are filtered by "in progress" status', () => {
    const inProgressCards = mockDataInstancesList.filter(instance => instance.status === RUNNING);
    const progressBtn = wrapper.find('#progress');
    const event = { target: progressBtn };
    progressBtn.simulate('click', event);
    expect(wrapper.find('DataVisualizationCard')).toHaveLength(inProgressCards.length);
  });

  test('assert that cards are filtered by "active" status', () => {
    const activeCards = mockDataInstancesList.filter(instance => instance.status === SUCCESS || instance.status === FAILED);
    const activeBtn = wrapper.find('#active');
    const event = { target: activeBtn };
    activeBtn.simulate('click', event);
    expect(wrapper.find('DataVisualizationCard')).toHaveLength(activeCards.length);
  });

  test('assert that cards are filtered by "expired" status', () => {
    const expiredCards = mockDataInstancesList.filter(instance => instance.status === EXPIRED);
    const expiredBtn = wrapper.find('#expired');
    const event = { target: expiredBtn };
    expiredBtn.simulate('click', event);
    expect(wrapper.find('DataVisualizationCard')).toHaveLength(expiredCards.length);
  });

});

/* ------------------ The next tests are only for DataVisualizationCards -------------------- */

const setupCard = (classification) => shallow(
  <DataVisualizationCard 
    classification={classification}
  />
);

const extractText = (node) => node.text().trim().toLowerCase();

describe('initial features', () => {
  test('assert that cards contain relevant information', () => {
    const classification = mockDataInstancesList.filter(ins => ins.status === RUNNING)[0];
    const wrapper = setupCard(classification);
    const firstDataIns = classification.values[0];
    const generalInfo = wrapper.find('.general-information').at(0);
    expect(wrapper.find('.title-div').text().toLowerCase().includes("in progress")).toBe(true);
    expect(generalInfo.text().includes(`${firstDataIns.name}`)).toBe(true);
    expect(generalInfo.text().includes(`${firstDataIns.creator}`)).toBe(true);
    expect(wrapper.find('.detailed-information-1').at(0).text().includes(`${firstDataIns.completedPercentage}% completed`)).toBe(true);
    expect(wrapper.find('.detailed-information-2').at(0).text().includes(`${firstDataIns.filesChanged} files`)).toBe(true);
  });

  test('assert that the "In progress" section has the right buttons', () => {
    const classification = mockDataInstancesList.filter(ins => ins.status === RUNNING)[0];
    const wrapper = setupCard(classification);
    const btnTitles = ['view pipeline','abort'];
    const btns = wrapper.find('#buttons-div').children();
    expect(extractText(btns.at(0))).toBe(btnTitles[0]);
    expect(extractText(btns.at(1))).toBe(btnTitles[1]);
  });

  test('assert that the "active" section has the right buttons', () => {
    const classification = mockDataInstancesList.filter(ins => ins.status === SUCCESS)[0];
    const wrapper = setupCard(classification);
    const btnTitles = ['view pipeline','x', '<dropdown />'];
    const btns = wrapper.find('#buttons-div').children();
    expect(extractText(btns.at(0))).toBe(btnTitles[0]);
    expect(extractText(btns.at(1))).toBe(btnTitles[1]);
    expect(extractText(btns.at(2))).toBe(btnTitles[2]);
  });

  test('assert that the "expired" section has the right buttons', () => {
    const classification = mockDataInstancesList.filter(ins => ins.status === EXPIRED)[0];
    const wrapper = setupCard(classification);
    const btnTitles = ['view pipeline'];
    const btns = wrapper.find('#buttons-div').children();
    expect(extractText(btns.at(0))).toBe(btnTitles[0]);
  });
});

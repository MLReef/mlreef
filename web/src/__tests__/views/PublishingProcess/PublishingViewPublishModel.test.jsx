import React from 'react';
import { mount } from 'enzyme';
import { environments, modelOptions } from 'components/views/PublishingView/info2';
import PublishingViewPublishModel from 'components/views/PublishingView/PublishingViewPublishModel';
import { filesMock } from 'testData';

const dispatch = jest.fn();

const scriptSelected = filesMock[3];

const selectedEnv = environments[0];

const setup = () => mount(
  <PublishingViewPublishModel
    entryPointFile={scriptSelected}
    selectedBranch="master"
    selectedEnvironment={selectedEnv.name}
    model={modelOptions[1]}
    category={1}
    isRequirementsFileExisting
    dispatch={dispatch}
  />,
);

describe('test UI html elements prensence and funtionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that basic redering works', () => {
    // first step
    const step1InfoContent = wrapper.find('.m-vertical-steps-step-content').at(0).childAt(1);
    expect(step1InfoContent.childAt(0).text().includes(scriptSelected.name)).toBe(true);
    expect(step1InfoContent.childAt(1).text().includes('master')).toBe(true);

    // second step
    const step2InfoContent = wrapper.find('.m-vertical-steps-step-content').at(1).childAt(1);
    expect(step2InfoContent.text().includes(selectedEnv.name)).toBe(true);

    // third step
    const thirdStepMarker = wrapper.find('.m-vertical-steps-step').at(2).childAt(0).childAt(0);
    expect(thirdStepMarker.hasClass('done')).toBe(true);
  });

  test('assert that models can be changed', () => {
    wrapper
      .find('MCheckBoxGroup')
      .at(0)
      .find('MCheckBox')
      .at(1)
      .simulate('click');

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MODEL', payload: modelOptions[1] });
  });

  test('assert that categories can be changed', () => {
    wrapper
      .find('MCheckBoxGroup')
      .at(1)
      .find('MCheckBox')
      .at(1)
      .simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ML_CATEGORY', payload: 2 });
  });

  test('assert that terms acceptance can be changed', () => {
    wrapper
      .find('MCheckBox[name="acceptance-termns-checkbox"]')
      .simulate('click');
    const acceptanceTerms = dispatch.mock.calls[0][0];
    expect(acceptanceTerms.type).toBe('SET_TERMS_ACCEPTED');
    // check that a number is persisted in acceptance terms date
    expect(Number(acceptanceTerms.payload)).toBeDefined();
  });

  afterEach(() => {
    dispatch.mockClear();
  });
});

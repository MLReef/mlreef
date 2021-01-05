import React from 'react';
import { shallow } from 'enzyme';
import EnvironmentCard, { processRequirementsFile } from 'components/views/PublishingView/EnvironmentCard/EnvironmentCard';
import { environments } from 'components/views/PublishingView/info2';

const environment = environments[0];

const setup = (dispatch) => shallow(
  <EnvironmentCard dispatch={dispatch} environment={environment} />,
);

describe('test EnvironmentCard elements presence and logic', () => {
  let wrapper;
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn();
    wrapper = setup(dispatch);
  });
  test('assert that Env card has a title and requirements', () => {
    expect(wrapper.find('p.card-title')).toHaveLength(1);
    const ulRequirements = wrapper.find('ul');
    expect(ulRequirements).toHaveLength(1);
    const requirementElements = ulRequirements.children();
    const parsedRequirementsFile = processRequirementsFile(environment.requirements);
    expect(requirementElements)
      .toHaveLength(parsedRequirementsFile.length);
    requirementElements.forEach((liNode, index) => {
      expect(liNode.childAt(0).text()).toBe(parsedRequirementsFile[index]);
    });
  });
  test('assert that Env card has a title and requirements', () => {
    wrapper.find('div.environment-card').simulate('click');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ENVIRONMENT', payload: environment });
  });
});

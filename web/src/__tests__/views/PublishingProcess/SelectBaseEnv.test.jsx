import React from 'react';
import { shallow } from 'enzyme';
import { environments } from 'components/views/PublishingView/info2';
import SelectBaseEnv from 'components/views/PublishingView/SelectBaseEnv/SelectBaseEnv';

const push = jest.fn();

const setup = (dataProcessorType) => shallow(
  <SelectBaseEnv
    operationType={dataProcessorType}
    namespace="namespace"
    slug="slug"
    selectedBranch="selectedBranch"
    environments={environments}
    selectedEnv={environments[0]}
    dispatch={() => {}}
    history={{ push }}
  />,
);

describe('html elements presence and ', () => {
  let wrapper;
  let dataProcessorType = 'model';
  test('"continue button" routes to model', () => {
    wrapper = setup(dataProcessorType);
    const continueBtn = wrapper.find('button');
    expect(continueBtn.props().disabled).toBe(false);
    continueBtn.simulate('click');
    expect(push).toHaveBeenCalledWith(`/namespace/slug/-/publishing/branch/selectedBranch/#publish-${dataProcessorType}`);
  });

  test('"continue button" routes to operation', () => {
    dataProcessorType = 'operation';
    wrapper = setup(dataProcessorType);
    const continueBtn = wrapper.find('button');
    expect(continueBtn.props().disabled).toBe(false);
    continueBtn.simulate('click');
    expect(push).toHaveBeenCalledWith(`/namespace/slug/-/publishing/branch/selectedBranch/#publish-${dataProcessorType}`);
  });

  test('"continue button" routes to visualization', () => {
    dataProcessorType = 'visualization';
    wrapper = setup(dataProcessorType);
    const continueBtn = wrapper.find('button');
    expect(continueBtn.props().disabled).toBe(false);
    continueBtn.simulate('click');
    expect(push).toHaveBeenCalledWith(`/namespace/slug/-/publishing/branch/selectedBranch/#publish-${dataProcessorType}`);
  });
});

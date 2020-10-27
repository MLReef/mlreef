import React from 'react';
import { shallow } from 'enzyme';
import { environments } from 'components/views/PublishingView/info2';
import SelectBaseEnv from 'components/views/PublishingView/SelectBaseEnv/SelectBaseEnv';

const push = jest.fn();

const setup = () => shallow(
  <SelectBaseEnv
    namespace="namespace"
    slug="slug"
    environments={environments}
    selectedEnv={environments[0]}
    dispatch={() => {}}
    history={{ push }}
  />,
);

describe('html elements presence and ', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('"continue button" is enabled and triggers an event', () => {
    const continueBtn = wrapper.find('button');
    expect(continueBtn.props().disabled).toBe(false);
    continueBtn.simulate('click');
    expect(push).toHaveBeenCalledWith('/namespace/slug/-/publishing/#publish-model');
  });
});

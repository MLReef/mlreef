import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MCard from 'components/ui/MCard';
import ExecutePipelineModal from 'components/execute-pipeline-modal/executePipeLineModal';
import { storeFactory } from '../functions/testUtils';
import PipelineView from '../components/pipeline-view/pipelineView';

import {
  branchesMock,
  projectsArrayMock,
} from '../testData';
import { dataPipeLines } from '../dataTypes';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock,
  });
  const wrapper = shallow(<PipelineView store={store} />, { attachTo: document.body });

  return wrapper.dive().dive();
};

describe('test execute button event', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that execute modal does not render when no operation is selected', () => {
    wrapper.dive().find(MCard).first().dive()
      .find('#execute-button')
      .simulate('click');
    expect(wrapper.dive().find(ExecutePipelineModal).dive().find('.modal.show')).toHaveLength(0);
  });
  test('assert that execute modal does not render when no folder has been selected', () => {
    wrapper.instance().setState({ dataOperationsSelected: [dataPipeLines[0]] });
    wrapper.dive().find(MCard).first().dive()
      .find('#execute-button')
      .simulate('click');
    expect(wrapper.dive().find(ExecutePipelineModal).dive().find('.modal')).toHaveLength(1);
  });
});

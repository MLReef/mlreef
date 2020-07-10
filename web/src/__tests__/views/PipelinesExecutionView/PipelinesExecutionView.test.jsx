import React from 'react';
import { shallow } from 'enzyme';
import { projectsArrayMock, branchesMock, dataPipeLines } from 'testData';
import { storeFactory } from 'functions/testUtils';
import 'babel-polyfill';
import WithPipelinesExecution from 'components/views/PipelinesExecutionView';

const setup = () => {
  const match = { params: { typePipelines: 'new-data-pipeline' } };
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock,
    processors: { operations: dataPipeLines },
  });
  const wrapper = shallow(
    <WithPipelinesExecution match={match} store={store} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test the most basic rendering', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that execute modal does not render when no operation is selected', () => {
    wrapper.find('MCard').first().dive()
      .find('#execute-button')
      .simulate('click');
    expect(wrapper.find('ExecutePipelineModal').dive().find('.modal.show')).toHaveLength(0);
  });

  test('assert that function can copy a processor and its internalProcessorId is not repeated', () => {
    wrapper.setState({ processorsSelected: [dataPipeLines[0]] });
    wrapper.instance().copyProcessor(0);
    const { processorsSelected } = wrapper.state();
    let repetitionsCounter = 0;
    for (let i = 0; i < processorsSelected.length; i += 1) {
      for (let j = i + 1; j < processorsSelected.length; j += 1) {
        if (
          processorsSelected[i].internalProcessorId === processorsSelected[j].internalProcessorId
        ) {
          repetitionsCounter += 1;
        }
      }
    }
    expect(repetitionsCounter).toBe(0);
    expect(processorsSelected).toHaveLength(2);
  });

  test('assert that function can remove the right processor', () => {
    const posToDelete = 2;
    wrapper.setState({ processorsSelected: dataPipeLines });
    const { processorsSelected } = wrapper.state();
    const { internalProcessorId: idPos } = processorsSelected[posToDelete];
    wrapper.instance().deleteProcessor(posToDelete);
    const { processorsSelected: processorsSelectedAfterDelete } = wrapper.state();
    expect(
      processorsSelectedAfterDelete.filter((pS) => pS.internalProcessorId === idPos)
    )
      .toHaveLength(0);
    expect(processorsSelectedAfterDelete).toHaveLength(dataPipeLines.length - 1);
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import DataInstanceDetails from 'components/data-instance/dataInstanceDetails';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock, branchesMock } from '../testData';

const pushMock = jest.fn();

const history = { push: pushMock }

const match = {
  params: {
    namespace: 'my-namespace',
    slug: 'the-project-name',
    dataId: '1df0c510-fec4-4fd3-bbc9-d911fbbc496e',
    path: '',
  },
};

const store = storeFactory({
  project: projectsArrayMock.projects.selectedProject,
  branches: branchesMock,
});

const setup = () => {
  const testWrapper = shallow(
    <DataInstanceDetails store={store} match={match} history={history}/>,
  );

  return testWrapper.dive().dive();
};

describe('Data instance details contains basic UI elements', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it('renders pipeline information coorectly', () => {
    expect(wrapper.find('.content > .content-row')).toHaveLength(5);
  });

  it('asserts that pipeline handling buttons are present', () => {
    expect(wrapper.find('button')).toHaveLength(2);
  });

  it('asserts that pipeline view button redirects to FunctionalExecutionPipeline', () => {
    wrapper.find('.pipeline-view-btn').simulate('click');
    expect(pushMock).toHaveBeenCalled();
  });

  it('asserts that files table is shown', () => {
    expect(wrapper.find('.file-properties')).toHaveLength(1);
  });
});

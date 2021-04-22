import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import DataInstancesCard from 'components/views/Datainstances/DataInstancesCard';
import { FAILED, RUNNING } from 'dataTypes';

const fireModal = jest.fn();

const props = {
  name: 'data-pipeline/dear-nessie-4112020-1',
  namespace: 'mlreef',
  slug: 'mlreef-slug',
  currentState: 'failed',
  instances: [
    {
      backendInstanceId: 'be307d64-3237-49f8-898b-46831f99aabc',
      backendProjectId: '5d005488-afb6-4a0c-852a-f471153a04b5',
      commitId: '57ce6ced1e790ee0a164680a9be46aeba33f1316',
      currentState: 'failed',
      descTitle: 'data-pipeline/dear-nessie-4112020-1',
      id: 16,
      pipelineBackendId: 'e3397d9c-6f0f-4607-b41b-fe27720ff8ac',
      projId: 20,
      timeCreatedAgo: '4 hour(s)',
      userName: 'mlreef',
    },
  ],
  fireModal,
};

test('assert that snapshot matches', () => {
  const snapShot = renderer.create(
    <Router>
      <DataInstancesCard
        key={props.name}
        name={props.name}
        namespace={props.namespace}
        slug={props.slug}
        params={{
          currentState: props.currentState,
          instances: props.instances,
        }}
        fireModal={props.fireModal}
      />
    </Router>,
  ).toJSON();
  expect(snapShot).toMatchSnapshot();
});

const setup = (currentState) => {
  props.currentState = currentState;
  props.instances[0].currentState = currentState;
  const testWrapper = mount(
    <Router>
      <DataInstancesCard
        key={props.name}
        name={props.name}
        namespace={props.namespace}
        slug={props.slug}
        params={{
          currentState: props.currentState,
          instances: props.instances,
        }}
        fireModal={props.fireModal}
      />
    </Router>,
  );

  return testWrapper;
};

describe('assert basic UI text elements are rendered', () => {
  let wrapper;

  test('pipeline info is displayed', () => {
    wrapper = setup(FAILED);
    expect(wrapper.find('img').prop('alt')).toEqual('failed');
    expect(wrapper.find('.title-div').text()).toBe('Failed');
    expect(wrapper.find('Link').find('a').text()).toBe('dear-nessie-4112020-1');
    expect(wrapper.find('a').at(1).text()).toBe('mlreef');
  });

  test('assert that firemodal is called with failed', () => {
    wrapper = setup(FAILED);
    wrapper.find('button.btn-danger').simulate('click');
    expect(fireModal).toHaveBeenCalled();
    expect(fireModal.mock.calls[0][0].title.includes('Delete')).toBeTruthy();
  });

  test('assert that firemodal is called', () => {
    wrapper = setup(RUNNING);
    wrapper.find('button.btn-danger').simulate('click');
    expect(fireModal).toHaveBeenCalled();
    expect(fireModal.mock.calls[0][0].title.includes('Abort')).toBeTruthy();
  });

  afterEach(() => {
    fireModal.mockClear();
  });
});

import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter as Router } from 'react-router-dom';
import { shallow } from 'enzyme';
import DataInstancesCard from 'components/views/Datainstances/DataInstancesCard';

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
  fireModal: jest.fn(),
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

const setup = () => {
  const testWrapper = shallow(
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
    />,
  );

  return testWrapper;
};

describe('assert basic UI text elements are rendered', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });
  test('pipeline info is displayed', () => {
    expect(wrapper.find('img').prop('alt')).toEqual('failed');
    expect(wrapper.find('.title-div').text()).toBe('Failed');
    expect(wrapper.find('Link').children().text()).toBe('dear-nessie-4112020-1');
    expect(wrapper.find('a').text()).toBe('mlreef');
  });

  test('assert that pipeline functinal buttons are rendered', () => {
    expect(wrapper.find('.buttons-div').children()).toHaveLength(2);
  });
});

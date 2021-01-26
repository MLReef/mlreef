import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DetailSummary from 'components/ExperimentDetails/MenuOptions/DetailSummary';
import { RUNNING } from 'dataTypes';

const setPreconfiguredOPerationsMock = jest.fn();

const mockPush = jest.fn();

const history = { push: mockPush };

const mockParameters = [{
  name: 'output-path', value: '.', type: 'STRING', required: true, description: 'path to output metrics and model',
}];

const pipelineInfoMock = {
  id: 13, ref: 'experiment/smooth-anchovy_1782020', commitSha: '43cdfcdc8acd4db6c20b159320f4de85467815db', createdAt: '2020-08-17T21:38:23.077Z', updatedAt: '2020-08-17T21:38:23.21Z',
};

const dataOperatorExecuted = {
  slug: 'commons-resnet-50',
  parameters: [{
    name: 'output-path', value: '.', type: 'STRING', required: true, description: 'path to output metrics and model',
  }, {
    name: 'height', value: '89', type: 'INTEGER', required: true, description: 'height of images (int)',
  }, {
    name: 'width', value: '89', type: 'INTEGER', required: true, description: 'width of images (int)',
  }, {
    name: 'epochs', value: '89', type: 'INTEGER', required: true, description: 'number of epochs for training',
  }, {
    name: 'use-pretrained', value: 'true', type: 'BOOLEAN', required: false, description: 'use pretrained ResNet50 weights (bool)',
  }, {
    name: 'input-path', value: '.', type: 'STRING', required: true, description: 'path to directory of images',
  }],
  id: 'aae109e2-d360-42d0-998e-e519cbce982c',
  name: 'Resnet50',
};

const inputFilesMock = [{ location: 'README.md', location_type: 'PATH' }];

const setup = () => shallow(
  <DetailSummary
    projectNamespace="a-namespace"
    projectSlug="A-testing-project"
    currentState={RUNNING.toLowerCase()}
    parameters={mockParameters}
    pipelineInfo={pipelineInfoMock}
    dataOperatorsExecuted={dataOperatorExecuted}
    inputFiles={inputFilesMock}
    setPreconfiguredOPerations={setPreconfiguredOPerationsMock}
    history={history}
    projectId={1}
    experimentName="An exp"
  />,
);

describe('test presence of elements in DOM', () => {
  test('compare with the latest snapshot', () => {
    const component = renderer
      .create(
        <MemoryRouter key="rerere">
          <DetailSummary
            projectNamespace="a-namespace"
            projectSlug="A-testing-project"
            currentState={RUNNING.toLowerCase()}
            parameters={mockParameters}
            pipelineInfo={pipelineInfoMock}
            dataOperatorsExecuted={dataOperatorExecuted}
            inputFiles={inputFilesMock}
            setPreconfiguredOPerations={setPreconfiguredOPerationsMock}
            history={history}
            projectId={1}
            experimentName="An exp"
          />
        </MemoryRouter>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that the view pipeline button works properly', () => {
    wrapper.find('button#view-pipeline-btn').simulate('click');
    expect(setPreconfiguredOPerationsMock).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
  });
});

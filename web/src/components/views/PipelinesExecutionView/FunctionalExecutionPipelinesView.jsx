import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from 'actions/userActions';
import cx from 'classnames';
import './PipelinesExecutionView.scss';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import { string, shape } from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import ExecutePipelineModal from './ExecutePipelineModal';
import SelectDataPipelineModal from './SelectDataPipelineModal';
import Navbar from '../../navbar/navbar';
import ProjectContainer from '../../projectContainer';
import Instruction from '../../instruction/instruction';
import FilesSelector from '../../layout/FilesSelector';
import MCard from '../../ui/MCard';
import ProcessorsList from './processorsList';
import {
  dataPipelineInstructionData,
  experimentInstructionData,
  dataVisualizationInstuctionData,
} from './dataModel';
import Provider, { DataPipelinesContext } from './DataPipelineHooks/DataPipelinesProvider';
import DragDropZone from './DragNDropZone';
import { setProcessors } from './DataPipelineHooks/DataPipelinesReducer';
import { SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL } from './DataPipelineHooks/actions';

const ExecuteButton = () => {
  const [{ isFormValid }, dispatch] = useContext(DataPipelinesContext);
  const [isDisabled, setIsDisabled] = useState(isFormValid);
  useEffect(() => {
    setIsDisabled(!isFormValid)
  }, [isFormValid]);
  return (
    <button
      disabled={isDisabled}
      id="execute-button"
      key="pipeline-execute"
      type="button"
      onClick={() => {
        dispatch({ 
          type: SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
          isShowingExecutePipelineModal: true,
        });
      }}
      className="btn btn-primary btn-sm border-none"
    >
      Execute
    </button>
  );
};

const FunctionalExecutionPipelinesView = (props) => {
  const {
    selectedProject: project,
    match: { path, params: { typePipelines, namespace, slug } },
    processors,
    preconfiguredOperations,
    actions,
  } = props;

  const isExperiment = path === '/:namespace/:slug/-/experiments/new'
    || typePipelines === 'new-experiment';

  const isDataset = path === '/:namespace/:slug/-/datasets/new'
    || typePipelines === 'new-data-pipeline';

  let activeFeature = 'data';
  let instructionDataModel;
  let pipelinesTypeExecutionTitle;
  let operationTypeToExecute;
  let operatorsTitle;
  let prefix = 'Op.';
  let breadCrumbPerPipeline = 'Datasets';
  let breadCrumbRoute = 'datasets';
  let processorColor = 'var(--dark)';
  if (isExperiment) {
    activeFeature = 'experiments';
    breadCrumbRoute = 'experiments';
    breadCrumbPerPipeline = 'Experiments';
    instructionDataModel = experimentInstructionData;
    pipelinesTypeExecutionTitle = 'Experiment';
    operationTypeToExecute = ALGORITHM;
    operatorsTitle = 'Select a model:';
    prefix = 'Algo.';
    processorColor = 'rgb(233, 148, 68)';
  } else if (isDataset) {
    instructionDataModel = dataPipelineInstructionData;
    pipelinesTypeExecutionTitle = 'Data pre-processing pipeline';
    operationTypeToExecute = OPERATION;
    operatorsTitle = 'Select a data operation';
    processorColor = 'rgb(210, 81, 157)';
  } else {
    breadCrumbRoute = 'visualizations';
    instructionDataModel = dataVisualizationInstuctionData;
    pipelinesTypeExecutionTitle = 'Data visualization';
    operationTypeToExecute = VISUALIZATION;
    operatorsTitle = 'Select a data visualization';
    processorColor = 'rgb(115, 93, 168)';
    breadCrumbPerPipeline = 'Visualizations';
  }

  // Will be useful in redirecting to dashboard.
  // const exploreAllOperationCards = () => {
  //   if (operationTypeToExecute === ALGORITHM) history.push('/');
  //   else if (operationTypeToExecute === OPERATION) history.push('/');
  //   else history.push('/');
  // };

  const pipelineExploreButtons = [
    <button
      key={`explore-${operationTypeToExecute}`}
      className="p-1"
      type="button"
      onClick={() => {}}
    >
      Explore all
    </button>,
  ];

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: `${breadCrumbPerPipeline}`,
      href: `/${namespace}/${slug}/-/${breadCrumbRoute}`,
    },
    {
      name: 'New',
    },
  ];

  return (
    <Provider currentProcessors={setProcessors(processors, operationTypeToExecute)}>
      <SelectDataPipelineModal />
      <ExecutePipelineModal
        type={operationTypeToExecute}
        project={project}
      />
      <Navbar />
      <ProjectContainer
        breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
        activeFeature={activeFeature}
      />
      <Instruction
        id={instructionDataModel.id}
        titleText={instructionDataModel.titleText}
        paragraph={instructionDataModel.paragraph}
      />
      <div
        className={cx('pipe-line-execution-container d-flex', {
          'data-pipeline': isDataset,
        })}
      >
        <MCard
          className="pipe-line-execution"
          title={pipelinesTypeExecutionTitle}
          buttons={[
            <ExecuteButton key="execute-button" />,
          ]}
        >
          <MCard.Section>
            <FilesSelector
              instructions={(
                <p>
                  Start by selecting your data file(s) you want to include
                  <br />
                  in your
                  {' '}
                  {pipelinesTypeExecutionTitle}
                </p>
                )}
            />
          </MCard.Section>

          <MCard.Section>
            <DragDropZone
              prefix={prefix}
              initialDataOperators={preconfiguredOperations?.dataOperatorsExecuted}
              actions={actions}
            />
          </MCard.Section>
        </MCard>

        <MCard
          className="pipe-line-execution tasks-list"
          buttons={pipelineExploreButtons}
          cardHeaderStyle={processorColor}
          title={operatorsTitle}
        >
          <MCard.Section cardContentStyle={processorColor}>
            <ProcessorsList />
          </MCard.Section>
        </MCard>
      </div>
    </Provider>
  );
};

FunctionalExecutionPipelinesView.defaultProps = {
  preconfiguredOperations: {},
};

FunctionalExecutionPipelinesView.propTypes = {
  selectedProject: shape({
    project: shape({}),
  }).isRequired,
  match: shape({
    path: string.isRequired,
    params: shape({
      typePipelines: string,
    }).isRequired,
  }).isRequired,
  processors: shape({}).isRequired,
  preconfiguredOperations: shape({}),
  actions: shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
    processors: state.processors,
    preconfiguredOperations: state.user.preconfiguredOperations,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FunctionalExecutionPipelinesView);

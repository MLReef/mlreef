import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from 'actions/userActions';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import './PipelinesExecutionView.scss';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { string, shape, arrayOf } from 'prop-types';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
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

const projectInstance = new ProjectGeneralInfoApi();

const ExecuteButton = () => {
  const [{
    isFormValid,
    filesSelectedInModal,
    processorsSelected,
  }, dispatch] = useContext(DataPipelinesContext);
  const [isDisabled, setIsDisabled] = useState(isFormValid);
  useEffect(() => {
    setIsDisabled(!isFormValid);
  }, [isFormValid]);
  return (
    <button
      id="execute-button"
      style={isDisabled ? { backgroundColor: '#F6F6F6', border: '1px solid #b2b2b2', color: '#2dbe91' } : {}}
      key="pipeline-execute"
      type="button"
      onClick={() => {
        if (isDisabled) {
          if (filesSelectedInModal.length === 0) {
            toastr.info('Error in files', 'Select first the input files in the Select data modal');
          }
          if (processorsSelected.length === 0) {
            toastr.info('Error in operators', 'Select operators in order to execute on your input files');
          }
          return;
        }
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
  if (isExperiment) {
    activeFeature = 'experiments';
    breadCrumbRoute = 'experiments';
    breadCrumbPerPipeline = 'Experiments';
    instructionDataModel = experimentInstructionData;
    pipelinesTypeExecutionTitle = 'Experiment';
    operationTypeToExecute = ALGORITHM;
    operatorsTitle = 'Select a model:';
    prefix = 'Algo.';
  } else if (isDataset) {
    instructionDataModel = dataPipelineInstructionData;
    pipelinesTypeExecutionTitle = 'Data pre-processing pipeline';
    operationTypeToExecute = OPERATION;
    operatorsTitle = 'Select a data operation';
  } else {
    breadCrumbRoute = 'visualizations';
    instructionDataModel = dataVisualizationInstuctionData;
    pipelinesTypeExecutionTitle = 'Data visualization';
    operationTypeToExecute = VISUALIZATION;
    operatorsTitle = 'Select a data visualization';
    breadCrumbPerPipeline = 'Visualizations';
  }

  const [processorsAndProjects, setProcessorsAndProjects] = useState([]);

  const processorsForCurrentView = setProcessors(
    processors,
    operationTypeToExecute,
  );

  useEffect(() => {
    Promise.all(
      processorsForCurrentView
        .map((proc) => projectInstance.getCodeProjectById(proc.codeProjectId)),
    )
      .then((projects) => projects.map((proj) => {
        const processor = processorsForCurrentView
          .filter((proc) => proc.codeProjectId === proj.id)[0];
        const {
          gitlab_namespace: nameSpace,
          slug: projSlug,
          input_data_types: inputDataTypes,
          stars_count: stars,
        } = proj;
        return {
          ...processor,
          nameSpace,
          slug: projSlug,
          inputDataTypes,
          stars,
        };
      }))
      .then(setProcessorsAndProjects);
    // eslint-disable-next-line
  }, [processors]);

  if (processorsAndProjects.length === 0) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

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
    <Provider currentProcessors={processorsAndProjects}>
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
          title={operatorsTitle}
        >
          <MCard.Section>
            <ProcessorsList operationTypeToExecute={operationTypeToExecute?.toLowerCase()} />
          </MCard.Section>
        </MCard>
      </div>
    </Provider>
  );
};

FunctionalExecutionPipelinesView.defaultProps = {
  preconfiguredOperations: {},
  processors: [],
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
  processors: arrayOf(shape({})),
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

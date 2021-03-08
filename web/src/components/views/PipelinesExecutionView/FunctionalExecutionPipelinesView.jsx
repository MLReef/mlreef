import React, { useContext, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from 'store/actions/userActions';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import './PipelinesExecutionView.scss';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import { string, shape } from 'prop-types';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import { generateBreadCrumbs } from 'functions/helpers';
import hooks from 'customHooks/useSelectedProject';
import useLoading from 'customHooks/useLoading';
import DataPiplineApi from 'apis/DataPipelineApi';
import ExperimentsApi from 'apis/experimentApi';
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
import { SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL } from './DataPipelineHooks/actions';
import { addInformationToProcessors, fetchProcessorsPaginatedByType } from './DataPipelineHooks/DataPipelinesReducer';

const dataPipelineApi = new DataPiplineApi();

const experimentsApi = new ExperimentsApi();

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
    match: {
      path,
      params: {
        typePipelines,
        namespace,
        slug,
        dataId,
      },
    },
    actions,
  } = props;
  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);
  const [dataOperatorsExecuted, setDataOperatorsExecuted] = useState([]);
  const [initialInformation, setInitialInformation] = useState({ initialFiles: [] });

  const isExperiment = path.includes('/experiments/')
  || typePipelines === 'new-experiment';

  const isDataset = path.includes('/datasets/')
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

  const fetchProcessors = () => fetchProcessorsPaginatedByType(operationTypeToExecute)
    .then(addInformationToProcessors)
    .then(setProcessorsAndProjects);

  const decideEndpoint = () => isExperiment
    ? experimentsApi.getExperimentDetails(selectedProject.id, dataId)
    : dataPipelineApi.getBackendPipelineById(dataId);

  const fetchInitialInfo = () => decideEndpoint().then((res) => {
    setDataOperatorsExecuted(
      addInformationToProcessors(isExperiment ? [res.processing] : res.data_operations),
    );
    const pipeJobInfo = isExperiment
      ? res.pipeline_job_info
      : res.instances[0]?.pipeline_job_info;

    setInitialInformation({
      initialFiles: res?.input_files,
      initialBranch: pipeJobInfo?.ref,
      initialCommit: pipeJobInfo?.commit_sha,
    });
  });

  const [isProcessorsFetching, executeFetchProcessors] = useLoading(fetchProcessors);
  const [isFetchingInitialInfo, executeFetchInitInfo] = useLoading(
    dataId
      ? fetchInitialInfo
      : async () => {},
  );

  useEffect(() => {
    if (selectedProject.id) {
      executeFetchProcessors();
      executeFetchInitInfo();
    }
  }, [selectedProject.id, operationTypeToExecute]);

  if (isFetching || isProcessorsFetching || isFetchingInitialInfo) {
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
    <Provider currentProcessors={processorsAndProjects} initialInformation={initialInformation}>
      <SelectDataPipelineModal />
      <ExecutePipelineModal
        type={operationTypeToExecute}
        project={selectedProject}
      />
      <Navbar />
      <ProjectContainer
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
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
              isExperiment={isExperiment}
              prefix={prefix}
              initialDataOperators={dataOperatorsExecuted}
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

FunctionalExecutionPipelinesView.propTypes = {
  match: shape({
    path: string.isRequired,
    params: shape({
      typePipelines: string,
    }).isRequired,
  }).isRequired,
  actions: shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
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

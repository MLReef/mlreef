import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
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
import { addInformationToProcessors } from './DataPipelineHooks/DataPipelinesReducer';
import ProcessorFilters from './ProcessorFilters';

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
        namespace,
        slug,
        dataId,
      },
    },
  } = props;
  const isExperiment = path.includes('/experiments/');

  const isDataset = path.includes('/datasets/');

  let activeFeature = 'data';
  let instructionDataModel = experimentInstructionData;
  let pipelinesTypeExecutionTitle;
  let operationTypeToExecute = ALGORITHM;
  let operatorsTitle = 'Select a model';
  let breadCrumbPerPipeline = 'Experiments';
  if (isExperiment) {
    activeFeature = 'experiments';
    pipelinesTypeExecutionTitle = 'Experiment';
  } else if (isDataset) {
    breadCrumbPerPipeline = 'Datasets';
    instructionDataModel = dataPipelineInstructionData;
    pipelinesTypeExecutionTitle = 'Data pre-processing pipeline';
    operationTypeToExecute = OPERATION;
    operatorsTitle = 'Select a data operation';
  } else {
    breadCrumbPerPipeline = 'Visualizations';
    instructionDataModel = dataVisualizationInstuctionData;
    pipelinesTypeExecutionTitle = 'Data visualization';
    operationTypeToExecute = VISUALIZATION;
    operatorsTitle = 'Select a data visualization';
  }
  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);
  const [initialInformation, setInitialInformation] = useState({ initialFiles: [] });

  const endpointCall = useCallback(() => isExperiment
    ? experimentsApi.getExperimentDetails(selectedProject.id, dataId)
    : dataPipelineApi.getBackendPipelineById(dataId), [isExperiment, selectedProject.id, dataId]);

  const fetchInitialInfo = useCallback(() => endpointCall().then((res) => {
    const pipeJobInfo = isExperiment
      ? res.pipeline_job_info
      : res.instances[0]?.pipeline_job_info;

    setInitialInformation({
      initialFiles: res?.input_files,
      initialBranch: pipeJobInfo?.ref,
      initialCommit: pipeJobInfo?.commit_sha,
      dataOperatorsExecuted: addInformationToProcessors(
        isExperiment ? [res.processing] : res.data_operations,
      ),
    });
  }).catch((err) => toastr.error('Error', err.message)), [endpointCall]);

  const customCrumbs = useMemo(() => [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: `${breadCrumbPerPipeline.toLowerCase()}`,
      href: `/${namespace}/${slug}/-/${breadCrumbPerPipeline.toLowerCase()}`,
    },
    {
      name: 'New',
    },
  ], [namespace, slug, breadCrumbPerPipeline]);

  const [isFetchingInitialInfo, executeFetchInitInfo] = useLoading(fetchInitialInfo);

  useEffect(() => {
    if (dataId && selectedProject.id) executeFetchInitInfo();
  }, [selectedProject.id]);

  if (isFetching || isFetchingInitialInfo) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <Provider initialInformation={initialInformation} dataId={dataId}>
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
                  First, select a data input path (folder or file)
                  you want your
                  {' '}
                  {pipelinesTypeExecutionTitle}
                  {' '}
                  to be trained on
                </p>
                )}
            />
          </MCard.Section>

          <MCard.Section>
            <DragDropZone
              isExperiment={isExperiment}
            />
          </MCard.Section>
        </MCard>

        <MCard
          className="pipe-line-execution tasks-list"
          title={operatorsTitle}
        >
          <MCard.Section>
            <div className="data-operations">
              <ProcessorFilters
                namespace={namespace}
                operationTypeToExecute={operationTypeToExecute?.toLowerCase()}
              />
              <ProcessorsList
                operationTypeToExecute={operationTypeToExecute?.toLowerCase()}
              />
            </div>
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
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(FunctionalExecutionPipelinesView);

import React, {
  useCallback, useEffect, useState,
} from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import './PipelinesExecutionView.scss';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import { string, shape } from 'prop-types';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import hooks from 'customHooks/useSelectedProject';
import useLoading from 'customHooks/useLoading';
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
import Provider from './DataPipelineHooks/DataPipelinesProvider';
import DragDropZone from './DragNDropZone';
import ProcessorFilters from './ProcessorFilters';
import { fetchInitialInfo } from './DataPipelineHooks/DataPipelinesReducerAndFunctions';
import ExecuteButton from './ExecuteButton';

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

  const fetchInitialInfoCB = useCallback(() => fetchInitialInfo(
    selectedProject.id, dataId, isExperiment,
  ).then(setInitialInformation)
    .catch((err) => toastr.error('Error', err.message)),
  [selectedProject.id, dataId, isExperiment]);

  const customCrumbs = [
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
  ];

  const [isFetchingInitialInfo, executeFetchInitInfo] = useLoading(fetchInitialInfoCB);

  useEffect(() => {
    if (dataId && selectedProject.id) executeFetchInitInfo();
  }, [dataId, selectedProject.id]);

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
        activeFeature={activeFeature}
        breadcrumbs={customCrumbs}
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
            <DragDropZone isExperiment={isExperiment} />
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
                namespace={namespace}
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

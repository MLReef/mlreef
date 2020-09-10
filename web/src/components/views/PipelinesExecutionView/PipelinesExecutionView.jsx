import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as userActions from 'actions/userActions';
import {
  shape, string, arrayOf, func,
} from 'prop-types';
import './pipelineView.css';
import { toastr } from 'react-redux-toastr';
import arrayMove from 'array-move';
import UUIDV1 from 'uuid/v1';
import plus from 'images/plus_01.svg';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import SortableProcessorsList from 'components/views/PipelinesExecutionView/SortableDataProcessorsList';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import SelectDataPipelineModal from './SelectDataPipelineModal';
import validateInput from '../../../functions/validations';
import ExecutePipelineModal from './ExecutePipelineModal';
import Navbar from '../../navbar/navbar';
import ProjectContainer from '../../projectContainer';
import Instruction from '../../instruction/instruction';
import FilesSelector from '../../layout/FilesSelector';
import MCard from '../../ui/MCard';
import ProcessorFilters from './ProcessorFilters';
import ProcessorsList from './processorsList';
import {
  dataPipelineInstructionData,
  experimentInstructionData,
  dataVisualizationInstuctionData,
} from './dataModel';

class PipelinesExecutionView extends Component {
  isExperiment = false

  isDataset = false

  isVisualization = false

  constructor(props) {
    super(props);
    const {
      selectedProject, branches, processors,
    } = this.props;
    const { match: { path, params: { typePipelines } } } = this.props;
    let currentProcessors;

    this.isExperiment = path === '/:namespace/:slug/-/experiments/new'
      || typePipelines === 'new-experiment';

    this.isDataset = path === '/:namespace/:slug/-/datasets/new'
      || typePipelines === 'new-data-pipeline';

    this.isVisualization = path === '/:namespace/:slug/-/visualization/new'
      || typePipelines === 'new-data-visualisation';

    if (this.isDataset) {
      currentProcessors = processors.operations;
    } else if (this.isExperiment) {
      currentProcessors = processors.algorithms;
    } else {
      currentProcessors = processors.visualizations;
    }
    currentProcessors = currentProcessors.map((cP) => parseToCamelCase({
      ...cP, internalProcessorId: UUIDV1(),
    }));
    this.state = {
      branchSelected: null,
      project: selectedProject,
      processorDataSelected: null,
      isShowingExecutePipelineModal: false,
      currentProcessors,
      showSelectFilesModal: false,
      processorsSelected: [],
      filesSelectedInModal: [],
      branches,
      initialFiles: null,
    };
    this.drop = this.drop.bind(this);
    this.allowDrop = this.allowDrop.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.selectDataClick = this.selectDataClick.bind(this);
    this.handleModalAccept = this.handleModalAccept.bind(this);
    this.handleExecuteBtn = this.handleExecuteBtn.bind(this);
    this.toggleExecutePipeLineModal = this.toggleExecutePipeLineModal.bind(this);
    this.copyProcessor = this.copyProcessor.bind(this);
    this.deleteProcessor = this.deleteProcessor.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);
  }

  componentDidMount() {
    this.setPreconfiguredOperations();
  }

  setPreconfiguredOperations() {
    const { preconfiguredOperations, actions } = this.props;

    const { currentProcessors } = this.state;
    if (!preconfiguredOperations) {
      return;
    }
    const processorsSelected = preconfiguredOperations
      .dataOperatorsExecuted
      .map((executedOperation) => {
        const filteredProcessor = currentProcessors.filter((cP) => cP.slug === executedOperation.slug)[0];
        const newParametersArray = filteredProcessor?.parameters?.map((param) => {
          const filteredParams = executedOperation.parameters?.filter((executedParam) => param.name === executedParam.name);
          if (filteredParams.length === 0) return { ...param };
          return {
            ...param,
            value: filteredParams[0].value,
          };
        });
        return { ...filteredProcessor, parameters: newParametersArray };
      });
    this.setState({ processorsSelected, initialFiles: preconfiguredOperations.inputFiles });
    actions.setPreconfiguredOPerations(null);
  }

  onSortEnd = ({ oldIndex, newIndex }) => this.setState(({ processorsSelected }) => ({
    processorsSelected: arrayMove(processorsSelected, oldIndex, newIndex),
  }));

  drop = (e) => e.preventDefault();

  allowDrop = (e) => {
    const dropZone = document.elementFromPoint(e.clientX, e.clientY);
    if (dropZone.id !== 'drop-zone') return;

    const { processorDataSelected, processorsSelected } = this.state;
    const isProcessorAlreadySelected = processorsSelected
      .filter((
        procSelected,
      ) => JSON.stringify(procSelected) === JSON.stringify(processorDataSelected))
      .length > 0;

    if (!isProcessorAlreadySelected) {
      const newProcessorsSelected = [...processorsSelected, processorDataSelected];
      this.setState({ processorsSelected: newProcessorsSelected });
    }

    e.preventDefault();
  };

  selectDataClick = () => {
    const { showSelectFilesModal } = this.state;
    this.setState({ showSelectFilesModal: !showSelectFilesModal });
  };

  handleModalAccept = (filesSelected, branchSelected) => {
    const { showSelectFilesModal } = this.state;
    this.setState({
      branchSelected,
      filesSelectedInModal: filesSelected,
      showSelectFilesModal: !showSelectFilesModal,
    });
  };

  handleExecuteBtn = () => this.toggleExecutePipeLineModal();

  toggleExecuteModal = () => this.setState(() => ({
    isShowingExecutePipelineModal: false,
  }));

  deleteProcessor(indexOfProcessor) {
    const { processorsSelected } = this.state;
    const newProcessorsArray = [...processorsSelected];

    newProcessorsArray.splice(indexOfProcessor, 1);

    this.setState({ processorsSelected: newProcessorsArray });
  }

  handleDragStart(e, processorData) {
    this.setState({ processorDataSelected: processorData });
    const dt = e.dataTransfer;
    dt.setData('text/plain', e.currentTarget.id);
    dt.effectAllowed = 'move';
  }

  toggleExecutePipeLineModal() {
    const {
      processorsSelected,
      filesSelectedInModal,
    } = this.state;
    if (processorsSelected.length === 0) {
      toastr.error('Form', 'You have not selected operations to execute');
      return;
    }
    if (filesSelectedInModal.length === 0) {
      toastr.error('Form', 'Please select data to execute your pipeline');
      return;
    }
    let inputValuesAndDataModels;
    let errorCounter = 0;
    const dataOperationsHtmlElms = Array.prototype.slice.call(
      document.getElementById('data-operations-selected-container').childNodes,
    );
    const dataOperationsSelectedUpdate = processorsSelected.map((dataOperation, index) => {
      const dataOperationsHtmlElm = dataOperationsHtmlElms[index];
      const dataOpInputs = Array.prototype.slice.call(dataOperationsHtmlElm.getElementsByTagName('input'));
      inputValuesAndDataModels = [];
      const dataOpUpdated = dataOperation;
      dataOpInputs.forEach((input, inputIndex) => {
        let inputDataModel = null;
        inputDataModel = dataOpUpdated.parameters[inputIndex];
        if (validateInput(input.value, inputDataModel.type, inputDataModel.required)) {
          if (input.value !== '') { // fields can be valid but empty because not required...Do not delete
            const { name } = inputDataModel;
            inputDataModel.hasErrors = false;
            dataOpUpdated.parameters[inputIndex] = inputDataModel;
            inputValuesAndDataModels.push({
              name,
              value: input.value,
            });
          }
        } else {
          errorCounter += 1;
          inputDataModel.hasErrors = true;
          dataOpUpdated.parameters[inputIndex] = inputDataModel;
        }
      });
      return { ...dataOpUpdated, inputValuesAndDataModels };
    });
    this.setState({
      isShowingExecutePipelineModal: errorCounter === 0,
      processorsSelected: dataOperationsSelectedUpdate,
    });
    if (errorCounter > 0) {
      toastr.error('Form', 'Data you have entered is invalid');
    }
  }

  copyProcessor(indexOfProcessor) {
    const { processorsSelected } = this.state;
    const copiedProcessor = { ...processorsSelected[indexOfProcessor], internalProcessorId: UUIDV1() };
    const newProcessorsArray = [...processorsSelected, copiedProcessor];
    this.setState({ processorsSelected: newProcessorsArray });
  }

  render = () => {
    const {
      project,
      branches,
      branchSelected,
      processorsSelected,
      filesSelectedInModal,
      currentProcessors,
      showSelectFilesModal,
      isShowingExecutePipelineModal,
      initialFiles,
    } = this.state;
    let activeFeature = 'data';
    let instructionDataModel;
    let pipelinesTypeExecutionTitle;
    let operationTypeToExecute;
    let operatorsTitle;
    let prefix = 'Op.';
    if (this.isExperiment) {
      activeFeature = 'experiments';
      instructionDataModel = experimentInstructionData;
      pipelinesTypeExecutionTitle = 'Experiment';
      operationTypeToExecute = ALGORITHM;
      operatorsTitle = 'Select a model:';
      prefix = 'Algo.';
    } else if (this.isDataset) {
      activeFeature = 'data';
      instructionDataModel = dataPipelineInstructionData;
      pipelinesTypeExecutionTitle = 'Data pre-processing pipeline';
      operationTypeToExecute = OPERATION;
      operatorsTitle = 'Select a data operation';
    } else {
      activeFeature = 'data';
      instructionDataModel = dataVisualizationInstuctionData;
      pipelinesTypeExecutionTitle = 'Data visualization';
      operationTypeToExecute = VISUALIZATION;
      operatorsTitle = 'Select a data visualization';
    }
    return (
      <div className="pipe-line-view">
        <SelectDataPipelineModal
          project={project}
          branches={branches}
          selectDataClick={this.selectDataClick}
          show={showSelectFilesModal}
          filesSelectedInModal={this.filesSelectedInModal}
          handleModalAccept={this.handleModalAccept}
          initialFiles={initialFiles}
        />
        <ExecutePipelineModal
          type={operationTypeToExecute}
          isShowing={isShowingExecutePipelineModal}
          toggle={this.toggleExecuteModal}
          execute={this.toggleExecutePipeLineModal}
          processorsSelected={processorsSelected}
          filesSelectedInModal={filesSelectedInModal}
          httpUrlToRepo={project.httpUrlToRepo}
          projectNamespace={project.namespace}
          projectSlug={project.slug}
          backendId={project.id}
          branchSelected={branchSelected}
        />
        <Navbar />
        <ProjectContainer activeFeature={activeFeature} />
        <Instruction
          id={instructionDataModel.id}
          titleText={instructionDataModel.titleText}
          paragraph={instructionDataModel.paragraph}
        />
        <div
          className={cx('pipe-line-execution-container flexible-div', {
            'data-pipeline': this.isDataset,
          })}
        >
          <MCard
            className="pipe-line-execution"
            title={pipelinesTypeExecutionTitle}
            buttons={[
              <button
                id="execute-button"
                key="pipeline-execute"
                type="button"
                onClick={this.handleExecuteBtn}
                className="btn btn-primary btn-sm border-none"
              >
                Execute
              </button>,
            ]}
          >
            <MCard.Section>
              <FilesSelector
                files={initialFiles || filesSelectedInModal}
                instructions={(
                  <p>
                    Start by selecting your data file(s) you want to include
                    <br />
                    in your
                    {' '}
                    {pipelinesTypeExecutionTitle}
                  </p>
                )}
                handleSelectData={this.selectDataClick}
              />
            </MCard.Section>

            <MCard.Section>
              <SortableProcessorsList
                prefix={prefix}
                items={processorsSelected}
                onSortEnd={this.onSortEnd}
                copyProcessor={this.copyProcessor}
                deleteProcessor={this.deleteProcessor}
                filesSelectedInModal={filesSelectedInModal}
              />

              <div id="drop-zone" onDrop={this.drop} onDragOver={this.allowDrop}>
                <p style={{ marginLeft: '10px', fontWeight: 600 }}>{`${prefix}${processorsSelected.length + 1}:`}</p>
                <img src={plus} alt="" style={{ height: '80px', marginLeft: '60px' }} />
                <p style={{
                  margin: '0', padding: '0', width: '100%', textAlign: 'center',
                }}
                >
                  Drag and drop an operator from the right
                  <br />
                  list
                </p>
              </div>
            </MCard.Section>
          </MCard>

          <MCard className="pipe-line-execution tasks-list" title={operatorsTitle}>
            <MCard.Section>
              <ProcessorFilters show={false} />
              <ProcessorsList
                handleDragStart={this.handleDragStart}
                filesSelectedInModal={filesSelectedInModal}
                processors={currentProcessors}
              />
            </MCard.Section>
          </MCard>
        </div>
      </div>
    );
  }
}

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

PipelinesExecutionView.propTypes = {
  match: shape({
    params: shape({
      typePipelines: string,
    }),
  }).isRequired,
  processors: shape({
    algorithms: arrayOf(shape({})),
    operations: arrayOf(shape({})),
  }).isRequired,
  selectedProject: shape({}).isRequired,
  branches: arrayOf(shape({})).isRequired,
  actions: shape({ setPreconfiguredOPerations: func.isRequired }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(PipelinesExecutionView);

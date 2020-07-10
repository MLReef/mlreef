import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shape, string, arrayOf } from 'prop-types';
import $ from 'jquery';
import './pipelineView.css';
import { toastr } from 'react-redux-toastr';
import arrayMove from 'array-move';
import UUIDV1 from 'uuid/v1';
import plus from 'images/plus_01.svg';
import { OPERATION, ALGORITHM, VISUALISATION } from 'dataTypes';
import SortableProcessorsList from 'components/views/PipelinesExecutionView/SortableDataProcessorsList';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import SelectDataPipelineModal from './SelectDataPipelineModal';
import { showErrorsInTheOperationsSelected } from '../../../functions/pipeLinesHelpers';
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
  constructor(props) {
    super(props);
    const {
      selectedProject, branches, processors,
    } = this.props;
    const { match: { params: { typePipelines } } } = this.props;
    let currentProcessors;
    if (typePipelines === 'new-data-pipeline') {
      currentProcessors = processors.operations;
    } else if (typePipelines === 'new-experiment') {
      currentProcessors = processors.algorithms;
    } else {
      currentProcessors = [];
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
      initialFiles: [],
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
    const { currentProcessors } = this.state;
    this.setPreconfiguredOperations(currentProcessors);
  }

  setPreconfiguredOperations() {
    let configuredOperations = sessionStorage.getItem('configuredOperations');
    if (!configuredOperations) {
      return;
    }
    const { currentProcessors } = this.state;
    configuredOperations = JSON.parse(configuredOperations);
    const processorsSelected = configuredOperations.dataOperatorsExecuted.map((op) => {
      const filteredProcessor = currentProcessors.filter((cP) => cP.slug === op.slug)[0];
      const newParametersArray = filteredProcessor.parameters.map((param, paramIndex) => (
        { ...param, value: op.parameters[paramIndex].value }
      ));
      return { ...filteredProcessor, parameters: newParametersArray };
    });
    this.setState({ processorsSelected, initialFiles: configuredOperations.inputFiles });
    sessionStorage.removeItem('configuredOperations');
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

  handleDragStart(e, processorData) {
    this.setState({ processorDataSelected: processorData });
    const dt = e.dataTransfer;
    dt.setData('text/plain', e.currentTarget.id);
    dt.effectAllowed = 'move';
  }

  toggleExecutePipeLineModal() {
    const {
      processorsSelected,
      isShowingExecutePipelineModal,
      filesSelectedInModal,
    } = this.state;
    if (processorsSelected.length === 0) {
      toastr.error('Form', 'You have not selected operations to execute');
      return;
    }
    if (filesSelectedInModal.length === 0) {
      toastr.error('Form', 'You have not selected a directory to execute operations on');
      return;
    }
    let inputValuesAndDataModels;
    let errorCounter = 0;
    const dataOperationsHtmlElms = $('#data-operations-selected-container > span > div');
    const dataOperationsSelectedUpdate = processorsSelected.map((dataOperation, index) => {
      const dataOperationsHtmlElm = dataOperationsHtmlElms[index];
      const dataOpInputs = Array.prototype.slice.call(dataOperationsHtmlElm.getElementsByTagName('input'));
      inputValuesAndDataModels = [];
      dataOpInputs.forEach((input, inputIndex) => {
        let inputDataModel = null;
        inputDataModel = dataOperation.parameters[inputIndex];
        if (validateInput(input.value, inputDataModel.dataType, inputDataModel.required)) {
          if (input.value !== '') { // fields can be valid but empty because not required...Do not delete
            const { name } = inputDataModel;
            inputValuesAndDataModels.push({
              name,
              value: input.value,
            });
          }
        } else {
          errorCounter += 1;
          showErrorsInTheOperationsSelected(input, inputDataModel, dataOperationsHtmlElm);
        }
      });
      return { ...dataOperation, inputValuesAndDataModels };
    });
    if (errorCounter === 0) {
      this.setState({
        isShowingExecutePipelineModal: !isShowingExecutePipelineModal,
        processorsSelected: dataOperationsSelectedUpdate,
      });
    } else {
      toastr.error('Form', 'Data you have entered is invalid');
    }
  }

  copyProcessor(indexOfProcessor) {
    const { processorsSelected } = this.state;
    const copiedProcessor = { ...processorsSelected[indexOfProcessor], internalProcessorId: UUIDV1() };
    const newProcessorsArray = [...processorsSelected, copiedProcessor];
    this.setState({ processorsSelected: newProcessorsArray });
  }

  deleteProcessor(indexOfProcessor) {
    const { processorsSelected } = this.state;
    const newProcessorsArray = [...processorsSelected];

    newProcessorsArray.splice(indexOfProcessor, 1);

    this.setState({ processorsSelected: newProcessorsArray });
  }

  render = () => {
    const { match: { params: { typePipelines } } } = this.props;
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
    if (typePipelines === 'new-experiment') {
      activeFeature = 'experiments';
      instructionDataModel = experimentInstructionData;
      pipelinesTypeExecutionTitle = 'Experiment';
      operationTypeToExecute = ALGORITHM;
      operatorsTitle = 'Select a model:';
      prefix = 'Algo.';
    } else if (typePipelines === 'new-data-pipeline') {
      activeFeature = 'data';
      instructionDataModel = dataPipelineInstructionData;
      pipelinesTypeExecutionTitle = 'Data pipeline';
      operationTypeToExecute = OPERATION;
      operatorsTitle = 'Select a data operation';
    } else {
      activeFeature = 'data';
      instructionDataModel = dataVisualizationInstuctionData;
      pipelinesTypeExecutionTitle = 'Data visualization';
      operationTypeToExecute = VISUALISATION;
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
          toggle={this.toggleExecutePipeLineModal}
          processorsSelected={processorsSelected}
          filesSelectedInModal={filesSelectedInModal}
          httpUrlToRepo={project.httpUrlToRepo}
          projectId={project.gitlabId}
          backendId={project.backendId}
          branchSelected={branchSelected}
        />
        <Navbar />
        <ProjectContainer activeFeature={activeFeature} />
        <Instruction
          id={instructionDataModel.id}
          titleText={instructionDataModel.titleText}
          paragraph={instructionDataModel.paragraph}
        />
        <div className="pipe-line-execution-container flexible-div">
          <MCard
            className="pipe-line-execution"
            title={pipelinesTypeExecutionTitle}
            buttons={[
              <button key="pipeline-load" type="button" className="btn btn-basic-primary btn-sm">
                Load
              </button>,
              <button key="pipeline-save" type="button" className="btn btn-basic-primary btn-sm d-none">
                Save
              </button>,
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
                files={filesSelectedInModal}
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
  };
}

PipelinesExecutionView.propTypes = {
  match: shape({
    params: shape({
      typePipelines: string.isRequired,
    }),
  }).isRequired,
  processors: shape({
    algorithms: arrayOf(shape({})),
    opeartions: arrayOf(shape({})),
  }).isRequired,
  selectedProject: shape({}).isRequired,
  branches: arrayOf(shape({})).isRequired,
};

export default connect(mapStateToProps)(PipelinesExecutionView);

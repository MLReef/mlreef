import React, { Component } from 'react';
import $ from 'jquery';
import { toastr } from 'react-redux-toastr';
import arrayMove from 'array-move';
import minus from '../images/minus.svg';
import plus from '../images/plus_01.svg';
import { validateInput } from '../functions/validations';
import { showErrorsInTheOperationsSelected } from '../functions/pipeLinesHelpers';

const withPipelineExecution = (
  WrappedComponent,
  operationsToExecute,
) => class extends Component {
  constructor(props) {
    super(props);
    const { selectedProject, branches } = this.props;
    this.state = {
      branchSelected: null,
      project: selectedProject,
      checkBoxOwnDataOperations: false,
      checkBoxStarredDataOperations: false,
      idCardSelected: null,
      showFilters: false,
      showForm: false,
      isShowingExecutePipelineModal: false,
      dataOperations: operationsToExecute,
      showSelectFilesModal: false,
      dataOperationsSelected: [],
      filesSelectedInModal: [],
      branches,
    };

    this.handleCheckMarkClick = this.handleCheckMarkClick.bind(this);
    this.setPreconfiguredOperations = this.setPreconfiguredOperations.bind(this);
    this.drop = this.drop.bind(this);
    this.allowDrop = this.allowDrop.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.selectDataClick = this.selectDataClick.bind(this);
    this.handleModalAccept = this.handleModalAccept.bind(this);
    this.copyDataOperationEvent = this.copyDataOperationEvent.bind(this);
    this.deleteDataOperationEvent = this.deleteDataOperationEvent.bind(this);
    this.handleExecuteBtn = this.handleExecuteBtn.bind(this);
    this.toggleExecutePipeLineModal = this.toggleExecutePipeLineModal.bind(this);
  }

  componentDidMount() {
    const showFiltersButton = document.getElementById('show-filters-button');
    if (showFiltersButton) {
      showFiltersButton.style.width = '80%';
    }
  }

  setPreconfiguredOperations(operationTemplates) {
    let items;
    const configuredOperations = sessionStorage.getItem('configuredOperations');
    if (configuredOperations) {
      const parsedConfiguredOps = JSON.parse(configuredOperations);
      // The next operation is necessary to create a new object
      // and be able to create a new conf file
      const parsedOperationTemplates = JSON.parse(JSON.stringify(operationTemplates));
      items = parsedConfiguredOps.map((confOp) => {
        // filter the operation executed to get its template
        const newOperationSelected = parsedOperationTemplates
          .filter(
            (dataPipe) => confOp.name === dataPipe.command,
          )[0];
        // get params entered by user to execute operation
        let directory = confOp.params.filter((param) => param.name === 'images-path')[0].value;
        directory = directory.substr(0, directory.length - 1);
        this.setState({ filesSelectedInModal: [{ path: directory }] });
        confOp.params.forEach((configuredParam) => {
          const typesOfParams = Object.keys(newOperationSelected.params);
          typesOfParams.forEach((type) => {
            const paramArr = newOperationSelected.params[type]
              .filter(
                (sp) => sp.commandName === configuredParam.name,
              );
            if (paramArr.length > 0) {
              const param = paramArr[0];
              const paramIndex = newOperationSelected.params[type].indexOf(param);
              param.value = configuredParam.value;
              newOperationSelected.params[type][paramIndex] = param;
            }
          });
        });
        return newOperationSelected;
      });
      this.setState({ dataOperationsSelected: items });
      sessionStorage.removeItem('configuredOperations');
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => this.setState(({ dataOperationsSelected }) => ({
    dataOperationsSelected: arrayMove(dataOperationsSelected, oldIndex, newIndex),
  }));

  drop = (e) => e.preventDefault();

  createDivToContainOperationSelected = (index) => {
    const array = this.state.dataOperationsSelected;
    const dataCardSelected = JSON.stringify(this.state.dataOperations[index]);
    if (array
      .filter(
        (arr) => JSON.stringify(arr) === dataCardSelected,
      )
      .length === 0
    ) {
      const dataOperationCopy = this.state.dataOperations[index];
      dataOperationCopy.copyDataOperationEvent = this.copyDataOperationEvent;
      dataOperationCopy.deleteDataOperationEvent = this.deleteDataOperationEvent;
      array.push(dataOperationCopy);
      this.setState({ dataOperationsSelected: array });
    }
  };

  copyDataOperationEvent(e) {
    const array = this.state.dataOperationsSelected;
    const value = { ...array[parseInt(e.target.id.split('-')[3]) - 1] };

    value.index = this.state.dataOperationsSelected.length - 1;
    array.push(value);

    this.setState({ dataOperationsSelected: array });
  }

  deleteDataOperationEvent(e) {
    const array = this.state.dataOperationsSelected;
    array.splice(parseInt(e.target.id.split('-')[3]) - 1, 1);

    this.setState({ dataOperationsSelected: array });
  }

  allowDrop = (e) => {
    const dropZone = document.elementFromPoint(e.clientX, e.clientY);
    if (dropZone.id === 'drop-zone') {
      const index = this.state.idCardSelected.substr(21, this.state.idCardSelected.length);
      const cardSelected = document.getElementById(this.state.idCardSelected);
      if (cardSelected) {
        this.createDivToContainOperationSelected(index, e);
      }
    }

    e.preventDefault();
  };

  hideInstruction = () => document.getElementById('instruction-pipe-line').classList.add('invisible');

  showFilters = () => {
    const filters = document.getElementById('filters');
    const showFilters = !this.state.showFilters;
    this.setState({ showFilters });
    const filtersBtn = document.getElementById('show-filters-button');
    if (showFilters) {
      filtersBtn.src = minus;
      filters.classList.remove('invisible');
      filtersBtn.style.width = '40%';
    } else {
      filtersBtn.src = plus;
      filtersBtn.style.width = '80%';
      filters.classList.add('invisible');
    }
  };

  handleDragStart(e) {
    const newState = { ...this.state };
    newState.idCardSelected = e.currentTarget.id;
    this.setState(newState);
    const dt = e.dataTransfer;
    dt.setData('text/plain', e.currentTarget.id);
    dt.effectAllowed = 'move';
  }

  selectDataClick = () => {
    this.setState({ showSelectFilesModal: !this.state.showSelectFilesModal });
  };

  whenDataCardArrowButtonIsPressed = (e, params) => {
    const desc = document.getElementById(`description-data-operation-item-${params.index}`);
    const parentDropZoneContainerId = document.getElementById(`data-operations-item-${params.index}`).parentNode.id;
    const newState = this.state.dataOperations[params.index];
    const dataOpForm = document.getElementById(`data-operation-form-${params.index}`);

    if (parentDropZoneContainerId === 'data-operations-list') {
      newState.showDescription = !newState.showDescription;

      this.state.dataOperations[params.index].showDescription
        ? desc.style.display = 'unset'
        : desc.style.display = 'none';
    } else {
      newState.showForm = !newState.showForm;

      this.state.dataOperations[params.index].showForm
        ? dataOpForm.style.display = 'unset'
        : dataOpForm.style.display = 'none';
    }
    this.setState(newState);
  };

  showAdvancedOptionsDivDataPipeline = (e, params) => {
    const newState = this.state.dataOperations[params.index];
    const advancedOptsDiv = document.getElementById(`advanced-opts-div-${params.index}`);

    newState.showAdvancedOptsDivDataPipeline = !newState.showAdvancedOptsDivDataPipeline;

    newState.showAdvancedOptsDivDataPipeline
      ? advancedOptsDiv.style.display = 'unset'
      : advancedOptsDiv.style.display = 'none';

    this.setState({ newState });
  };

  handleModalAccept = (e, filesSelected, branchSelected) => {
    const { showSelectFilesModal } = this.state;
    this.setState({
      branchSelected,
      filesSelectedInModal: filesSelected,
      showSelectFilesModal: !showSelectFilesModal,
    });
    document.getElementsByTagName('body').item(0).style.overflow = 'scroll';
  };

  handleExecuteBtn = () => this.toggleExecutePipeLineModal();

  // eslint-disable-next-line class-methods-use-this
  replaceParam(newOperationSelected, templateParam, paramConfigured, typeOfParam) {
    if (templateParam && templateParam.length > 0) {
      const index = newOperationSelected.params[typeOfParam].indexOf(templateParam[0]);
      templateParam[0].value = paramConfigured.value;
      newOperationSelected.params[typeOfParam][index] = templateParam[0];
    }

    return newOperationSelected;
  }

  handleCheckMarkClick(e) {
    const newState = this.state;
    newState[e.currentTarget.id] = !this.state[e.currentTarget.id];

    const span = e.currentTarget.nextSibling;
    newState[e.currentTarget.id]
      ? span.classList.add('pipe-line-active')
      : span.classList.remove('pipe-line-active');

    this.setState(newState);
  }

  toggleExecutePipeLineModal() {
    const {
      dataOperationsSelected,
      isShowingExecutePipelineModal,
      filesSelectedInModal,
    } = this.state;
    if (dataOperationsSelected.length === 0) {
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
    const dataOperationsSelectedUpdate = dataOperationsSelected.map((dataOperation, index) => {
      const dataOperationsHtmlElm = dataOperationsHtmlElms[index];
      const dataOpInputs = Array.prototype.slice.call(dataOperationsHtmlElm.getElementsByTagName('input'));
      let advancedParamsCounter = 0;
      inputValuesAndDataModels = [];
      dataOpInputs.forEach((input, inputIndex) => {
        let inputDataModel = null;
        if (input.id.startsWith('ad-')) {
          inputDataModel = dataOperation.params.advanced[advancedParamsCounter];
          advancedParamsCounter += 1;
        } else {
          inputDataModel = dataOperation.params.standard[inputIndex];
        }
        if (validateInput(input.value, inputDataModel.dataType, inputDataModel.required)) {
          if (input.value !== '') {
            inputValuesAndDataModels.push({
              id: input.id,
              value: input.value,
              inputDataModel,
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
        dataOperationsSelected: dataOperationsSelectedUpdate,
      });
    } else {
      toastr.error('Form', 'Data you have entered is invalid');
    }
  }

  render = () => {
    const {
      project,
      branches,
      branchSelected,
      dataOperationsSelected,
      filesSelectedInModal,
      dataOperations,
      showSelectFilesModal,
      isShowingExecutePipelineModal,
      inputValuesAndDataModels,
    } = this.state;
    return (
      <WrappedComponent
        project={project}
        branches={branches}
        branchSelected={branchSelected}
        dataOperationsSelected={dataOperationsSelected}
        filesSelectedInModal={filesSelectedInModal}
        dataOperations={dataOperations}
        showSelectFilesModal={showSelectFilesModal}
        isShowingExecutePipelineModal={isShowingExecutePipelineModal}
        inputValuesAndDataModels={inputValuesAndDataModels}
        onSortEnd={this.onSortEnd}
        handleCheckMarkClick={this.handleCheckMarkClick}
        drop={this.drop}
        createDivToContainOperationSelected={this.createDivToContainOperationSelected}
        copyDataOperationEvent={this.copyDataOperationEvent}
        deleteDataOperationEvent={this.deleteDataOperationEvent}
        allowDrop={this.allowDrop}
        hideInstruction={this.hideInstruction}
        showFilters={this.showFilters}
        handleDragStart={this.handleDragStart}
        selectDataClick={this.selectDataClick}
        whenDataCardArrowButtonIsPressed={this.whenDataCardArrowButtonIsPressed}
        showAdvancedOptionsDivDataPipeline={this.showAdvancedOptionsDivDataPipeline}
        handleModalAccept={this.handleModalAccept}
        handleExecuteBtn={this.handleExecuteBtn}
        toggleExecutePipeLineModal={this.toggleExecutePipeLineModal}
        setPreconfiguredOperations={this.setPreconfiguredOperations}
      />
    );
  }
};

export default withPipelineExecution;

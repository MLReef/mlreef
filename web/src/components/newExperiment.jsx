import React from 'react';
import { connect } from 'react-redux';
import plus from '../images/plus_01.svg';
import './pipeline-view/pipelineView.css';
import Navbar from './navbar/navbar';
import Input from './input/input';
import ProjectContainer from './projectContainer';
import SortableDataOperationsList from './pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from './select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from './pipeline-view/dataOperationsList';
import Instruction from './instruction/instruction';
import ExecutePipelineModal from './execute-pipeline-modal/executePipeLineModal';
import withPipelineExecution from './withPipelinesExecution';
import { experiments, Adjectives, Nouns } from '../dataTypes';

const NewExperiment = ({
  project,
  dataOperations,
  showSelectFilesModal,
  branches,
  files,
  selectDataClick,
  filesSelectedInModal,
  handleModalAccept,
  isShowingExecutePipelineModal,
  toggleExecutePipeLineModal,
  dataOperationsSelected,
  branchSelected,
  handleExecuteBtn,
  onSortEnd,
  drop,
  allowDrop,
  showFilters,
  checkBoxOwnDataOperations,
  handleCheckMarkClick,
  checkBoxStarredDataOperations,
  handleDragStart,
  whenDataCardArrowButtonIsPressed,
}) => {
  const items = dataOperationsSelected;
  const operationsSelected = items.length + 1;
  const randomFirstName = Math.floor(Math.random()*Adjectives.length);
  const randomLastName = Math.floor(Math.random()*Nouns.length);
  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const dateString = date + "" + (month + 1) + "" + year;
  const uniqueName = Adjectives[randomFirstName] + "-" + Nouns[randomLastName] + "_" + dateString;

  const branchName = `experiment/${uniqueName}`;
  const dataInstanceName = `experiment/${uniqueName}`;
  const jobName = 'model-experiment';
  const groupName = project.namespace.name;
  return (
    <div className="pipe-line-view">
      <SelectDataPipelineModal
        project={project}
        branches={branches}
        files={files}
        selectDataClick={selectDataClick}
        show={showSelectFilesModal}
        filesSelectedInModal={filesSelectedInModal}
        handleModalAccept={handleModalAccept}
      />
      <ExecutePipelineModal
        isShowing={isShowingExecutePipelineModal}
        amountFilesSelected={filesSelectedInModal.length}
        toggle={toggleExecutePipeLineModal}
        dataOperationsSelected={dataOperationsSelected}
        filesSelectedInModal={filesSelectedInModal}
        http_url_to_repo={project.http_url_to_repo}
        projectId={project.id}
        branchName={branchName}
        dataInstanceName={dataInstanceName}
        jobName={jobName}
        branchSelected={branchSelected}
      />
      <Navbar />
      <ProjectContainer
        project={project}
        activeFeature="experiments"
        folders={[groupName, project.name, 'Data', 'Experiments']}
      />
      <Instruction
        id="NewExperiment"
        titleText="How to create a new experiment:"
        paragraph={
                    `First, select your data you want to do your experiment on. Then select one or multiple algorithms from the right. 
                        If needed, you can adapt the parameters of your algorithm directly`
                }
      />
      <div className="pipe-line-execution-container px-3 flexible-div">
        <div className="pipe-line-execution">
          <div className="header flexible-div">
            <div className="header-left-items flexible-div">
              <div>
                <p>Experiment</p>
              </div>
            </div>
            <button
              id="execute-button"
              onClick={handleExecuteBtn}
              className="btn btn-primary ml-auto mr-3"
            >
              Execute
            </button>
          </div>
          {filesSelectedInModal.length === 0 && (
          <div id="upload-files-options" className="upload-file">
            <p className="instruction">
              Start by selecting your data file(s) you want to include
              {' '}
              <br />
              {' '}
              in your experiments.
            </p>
            <p id="data">
                            Data:
            </p>

            <div className="data-button-container flexible-div">
              <button
                className="btn btn-primary"
                id="select-data-btn"
                onClick={selectDataClick}
              >
                Select data
              </button>
            </div>
          </div>
          )}

          {filesSelectedInModal.length > 0 && (
          <div id="text-after-files-selected" className="upload-file" style={{ display: 'flex' }}>
            <div style={{ width: '50%' }}>
              <p style={{ margin: '6% 0% 6% 2%' }}>
                <b>
                  Data:&nbsp;&nbsp;
                  {filesSelectedInModal.length}
                  {' '}
                  file(s) selected
                </b>
              </p>
            </div>
            <div style={{
              width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginRight: '2%',
            }}
            >
              <button
                type="button"
                style={{ backgroundColor: 'white', border: 'none' }}
                onClick={() => { selectDataClick(); }}
              >
                <b>
                  select data
                </b>
              </button>
            </div>
          </div>
          )}

          <SortableDataOperationsList items={items} onSortEnd={onSortEnd} />
          <div id="drop-zone" onDrop={drop} onDragOver={allowDrop}>
            <p style={{ marginLeft: '10px', fontWeight: 600 }}>{`Algo.${operationsSelected}:`}</p>
            <img src={plus} alt="" style={{ height: '80px', marginLeft: '60px' }} />
            <p style={{
              margin: '0', padding: '0', width: '100%', textAlign: 'center',
            }}
            >
              Drag and drop an algorithm from the right into your
              <br />
              experiment pipeline
              {/* or
              <b>create a new one</b> */}
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select a model:</p>
          </div>
          <div className="content">
            {/* <div className="filter-div flexible-div">
              <Input name="selectDataOp" id="selectDataOp" placeholder="Search a data operation" />
              <div className="search button pipe-line-active flexible-div" onClick={(e) => showFilters(e)}>
                <img id="show-filters-button" src={plus} alt="" />
              </div>
            </div> */}

            <div id="filters" className="invisible">

              <select className="data-operations-select round-border-button">
                <option>All data types</option>
                <option>Images data</option>
                <option>Text data</option>
                <option>Tabular data</option>
              </select>

              <div className="checkbox-zone">
                <label className="customized-checkbox">
                  Only own algorithms
                  <input
                    type="checkbox"
                    value={checkBoxOwnDataOperations}
                    onChange={handleCheckMarkClick}
                    id="checkBoxOwnDataOperations"
                  />
                  <span className="checkmark" />
                </label>
                <label className="customized-checkbox">
                  Only starred algorithms
                  <input
                    type="checkbox"
                    value={checkBoxStarredDataOperations}
                    onChange={handleCheckMarkClick}
                    id="checkBoxStarredDataOperations"
                  />
                  <span className="checkmark" />
                </label>
              </div>
              <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars" />
            </div>

            <DataOperationsList
              handleDragStart={handleDragStart}
              whenDataCardArrowButtonIsPressed={whenDataCardArrowButtonIsPressed}
              dataOperations={dataOperations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(withPipelineExecution(NewExperiment, experiments));

import React from 'react';
import { connect } from 'react-redux';
import uuidv1 from 'uuid/v1';
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
import { experiments } from '../dataTypes';

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
  const uuidCodeForBranch = (uuidv1()).split('-')[0];
  const branchName = `experiment/${uuidCodeForBranch}`;
  const dataInstanceName = `experiment/${uuidCodeForBranch}`;
  const jobName = 'model-experiment';
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
      <ProjectContainer project={project} activeFeature="experiments" folders={['Group Name', project.name, 'Data', 'Pipeline']} />
      <Instruction
        titleText="How to create a new experiment:"
        paragraph={
                    `First, select your data you want to do your experiment on. Then select one or multiple algorithms from the right. 
                        If needed, you can adapt the parameters of your algorithm directly`
                }
      />
      <div className="pipe-line-execution-container flexible-div">
        <div className="pipe-line-execution">
          <div className="header flexible-div">
            <div className="header-left-items flexible-div">
              <div>
                <p>Experiment:</p>
              </div>
              <Input name="DataPipelineID" id="renaming-pipeline" placeholder="EX_Project_1" />
            </div>
            <div
              className="header-right-items flexible-div"
              onClick={handleExecuteBtn}
            >
              <div id="execute-button" className="header-button round-border-button right-item flexible-div">
                Execute
              </div>
              <div className="header-button round-border-button right-item flexible-div">
                Save
              </div>
              <div className="header-button round-border-button right-item flexible-div">
                Load
              </div>
            </div>
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
              <div
                id="select-data-btn"
                onClick={selectDataClick}
              >
                Select data
              </div>
            </div>
          </div>
          )}

          {filesSelectedInModal.length > 0 && (
          <div id="text-after-files-selected" className="upload-file" style={{ display: 'none' }}>
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
              experiment pipeline or
              <b>create a new one</b>
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select an algorithm from list:</p>
          </div>
          <div className="content">
            <div className="filter-div flexible-div">
              <Input name="selectDataOp" id="selectDataOp" placeholder="Search a data operation" />
              <div className="search button pipe-line-active flexible-div" onClick={(e) => showFilters(e)}>
                <img id="show-filters-button" src={plus} alt="" />
              </div>
            </div>

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

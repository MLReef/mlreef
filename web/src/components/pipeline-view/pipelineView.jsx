import React from 'react';
import { connect } from 'react-redux';
import {
  shape, arrayOf, func, string, bool, number,
} from 'prop-types';
import plus from '../../images/plus_01.svg';
import './pipelineView.css';
import Navbar from '../navbar/navbar';
import Input from '../input/input';
import ProjectContainer from '../projectContainer';
import SortableDataOperationsList from './sortableDataOperationList';
import SelectDataPipelineModal from '../select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from './dataOperationsList';
import Instruction from '../instruction/instruction';
import ExecutePipelineModal from '../execute-pipeline-modal/executePipeLineModal';
import withPipelineExecution from '../withPipelinesExecution';
import { dataPipeLines } from '../../dataTypes';
import { randomNameGenerator } from '../../functions/pipeLinesHelpers';

const PipeLineView = ({
  project,
  dataOperations,
  showSelectFilesModal,
  dataOperationsSelected,
  branches,
  selectDataClick,
  filesSelectedInModal,
  handleModalAccept,
  isShowingExecutePipelineModal,
  toggleExecutePipeLineModal,
  branchSelected,
  handleExecuteBtn,
  onSortEnd,
  drop,
  allowDrop,
  handleCheckMarkClick,
  handleDragStart,
  whenDataCardArrowButtonIsPressed,
  setPreconfiguredOperations,
}) => {
  const items = dataOperationsSelected;
  setPreconfiguredOperations(dataPipeLines);
  const uniqueName = randomNameGenerator();
  const branchName = `data-pipeline/${uniqueName}`;
  const dataInstanceName = `data-pipeline/${uniqueName}`;
  const jobName = 'data-pipeline';
  const operationsSelected = items.length + 1;
  const groupName = project.namespace.name;
  return (
    <div className="pipe-line-view">
      <SelectDataPipelineModal
        project={project}
        branches={branches}
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
      <ProjectContainer project={project} activeFeature="data" folders={[groupName, project.name, 'Data', 'Pipeline']} />
      <Instruction
        id="PipeLineView"
        titleText="How to create a data processing pipeline:"
        paragraph={
          `First, select your data you want to process. Then select one or multiple data operations from the right. 
              The result of a data pipeline is a data instance, which you can use directly to train a model or merge it into a branch.`
        }
      />
      <div className="pipe-line-execution-container flexible-div">
        <div className="pipe-line-execution">
          <div className="header flexible-div">
            <div className="header-left-items flexible-div">
              <div>
                <p>Data Pipeline</p>
              </div>
            </div>
            <div className="header-right-items flexible-div">
              <div id="execute-button" className="header-button round-border-button right-item flexible-div" onClick={handleExecuteBtn}>
                Execute
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
                in your data processing pipeline.
              </p>
              <p id="data">
                Data:
              </p>

              <div className="data-button-container flexible-div">
                <div id="select-data-btn" onClick={selectDataClick}>
                  Select data
                </div>
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
              <button style={{ backgroundColor: 'white', border: 'none' }} onClick={() => { selectDataClick(); }}><b> select data </b></button>
            </div>
          </div>
          )}
          <SortableDataOperationsList items={items} onSortEnd={onSortEnd} />
          <div id="drop-zone" onDrop={drop} onDragOver={allowDrop}>
            <p style={{ marginLeft: '10px', fontWeight: 600 }}>{`Op.${operationsSelected}:`}</p>
            <img src={plus} alt="" style={{ height: '80px', marginLeft: '60px' }} />
            <p style={{
              margin: '0', padding: '0', width: '100%', textAlign: 'center',
            }}
            >
              Drag and drop a data operation from the right
              <br />
              pipeline
              {/* or
              <b>create a new one</b> */}
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select a data operations:</p>
          </div>
          <div className="content">
            {/* <div className="filter-div flexible-div">
              <Input name="selectDataOp" id="selectDataOp" placeholder="Search a data operation" />
              <div
                className="search button pipe-line-active flexible-div"
                onClick={(e) => showFilters(e)}
              >
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
                    Only own data operations
                  <input
                    type="checkbox"
                    onChange={handleCheckMarkClick}
                    id="checkBoxOwnDataOperations"
                  />
                  <span className="checkmark" />
                </label>
                <label className="customized-checkbox">
                    Only starred data operations
                  <input
                    type="checkbox"
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

PipeLineView.propTypes = {
  project: shape({
    http_url_to_repo: string.isRequired,
    id: number.isRequired,
    name: string.isRequired,
  }).isRequired,
  branches: arrayOf(shape({
  })).isRequired,
  dataOperations: arrayOf(shape({})).isRequired,
  branchSelected: string,
  dataOperationsSelected: arrayOf(shape({})),
  filesSelectedInModal: arrayOf(shape({})),
  showSelectFilesModal: bool.isRequired,
  selectDataClick: func.isRequired,
  handleModalAccept: func.isRequired,
  onSortEnd: func.isRequired,
  handleDragStart: func.isRequired,
  whenDataCardArrowButtonIsPressed: func.isRequired,
  handleCheckMarkClick: func.isRequired,
  allowDrop: func.isRequired,
  drop: func.isRequired,
  isShowingExecutePipelineModal: bool.isRequired,
  toggleExecutePipeLineModal: func.isRequired,
  handleExecuteBtn: func.isRequired,
  setPreconfiguredOperations: func.isRequired,
};

PipeLineView.defaultProps = {
  branchSelected: '',
  dataOperationsSelected: [],
  filesSelectedInModal: [],
};

export default connect(mapStateToProps)(withPipelineExecution(PipeLineView, dataPipeLines));

import React from 'react';
import { connect } from 'react-redux';
import {
  shape, arrayOf, func, bool, number, string,
} from 'prop-types';
import plus from '../../images/plus_01.svg';
import '../pipeline-view/pipelineView.css';
import Navbar from '../navbar/navbar';
import Input from '../input/input';
import ProjectContainer from '../projectContainer';
import { dataVisualizations } from '../../dataTypes';
import SortableDataOperationsList from '../pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from '../select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from '../pipeline-view/dataOperationsList';
import Instruction from '../instruction/instruction';
import withPipelinesExecution from '../withPipelinesExecution';
import ExecutePipelineModal from '../execute-pipeline-modal/executePipeLineModal';
import { randomNameGenerator } from '../../functions/pipeLinesHelpers';

const EmptyDataVisualization = ({ ...props }) => {
  const {
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
  } = props;
  setPreconfiguredOperations(dataVisualizations);
  const items = dataOperationsSelected;
  let operationsSelected = items.length;
  const groupName = project.namespace.name;
  operationsSelected += 1;
  const uniqueName = randomNameGenerator();
  const branchName = `data-visualization/${uniqueName}`;
  const dataInstanceName = `data-visualization/${uniqueName}`;
  const jobName = 'data-visualization';
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
      <ProjectContainer project={project} activeFeature="data" folders={[groupName, project.name, 'Data', 'Visualization']} />
      <Instruction
        id="EmptyDataVisualization"
        titleText="How to create a data visualization:"
        paragraph={
          `First, select your data you want to analyze. Then select one or multiple data visualizations from the right. 
              After execution each visualization will be displayed in a new window.`
        }
      />
      <div className="pipe-line-execution-container flexible-div">
        <div className="pipe-line-execution">
          <div className="header flexible-div">
            <div className="header-left-items flexible-div">
              <div>
                <p>Visualization</p>
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
              in your data visualization.
            </p>
            <p id="data">
              Data:
            </p>

            <div className="data-button-container flexible-div">
              <div
                role="button"
                tabIndex="0"
                id="select-data-btn"
                onClick={selectDataClick}
                onKeyDown={selectDataClick}
              >
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
              <button
                type="button"
                style={{ backgroundColor: 'white', border: 'none' }}
                onClick={() => { selectDataClick(); }}
              >
                <b> select data </b>
              </button>
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
              Drag and drop a data visualization from the right
              <br />
              pipeline
              {/* or
              <b>create a new one</b> */}
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select a visualization:</p>
          </div>
          <div className="content">
            {/* <div className="filter-div flexible-div">
              <Input name="selectDataOp" id="selectDataOp" placeholder="Search a visualization" />
              <div
                role="button"
                tabIndex="0"
                className="search button pipe-line-active flexible-div"
                onClick={(e) => showFilters(e)}
                onKeyDown={(e) => showFilters(e)}
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
                <label
                  className="customized-checkbox"
                  htmlFor="checkBoxOwnDataOperations"
                >
                  Only own data operations
                  <input
                    type="checkbox"
                    onChange={handleCheckMarkClick}
                    id="checkBoxOwnDataOperations"
                  />
                  <span className="checkmark" />
                </label>
                <label
                  className="customized-checkbox"
                  htmlFor="checkBoxStarredDataOperations"
                >
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

EmptyDataVisualization.propTypes = {
  project: shape({
    namespace: shape({
      name: string.isRequired,
    }).isRequired,
    http_url_to_repo: string.isRequired,
    id: number.isRequired,
    name: string.isRequired,
  }).isRequired,
  branches: arrayOf(shape({})).isRequired,
  dataOperations: arrayOf(shape({})).isRequired,
  branchSelected: string,
  dataOperationsSelected: arrayOf(shape({})),
  filesSelectedInModal: arrayOf(shape({})),
  showSelectFilesModal: bool.isRequired,
  selectDataClick: func.isRequired,
  handleModalAccept: func.isRequired,
  onSortEnd: func.isRequired,
  showFilters: func.isRequired,
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


EmptyDataVisualization.defaultProps = {
  branchSelected: '',
  dataOperationsSelected: [],
  filesSelectedInModal: [],
};


function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
  };
}

export default connect(
  mapStateToProps,
)(
  withPipelinesExecution(EmptyDataVisualization, dataVisualizations),
);

import React from 'react';
import { shape, arrayOf, func } from 'prop-types';
import plus from '../../images/plus_01.svg';
import '../pipeline-view/pipelineView.css';
import Navbar from '../navbar/navbar';
import Input from '../input/input';
import ProjectContainer from '../projectContainer';
import { dataVisualizations } from '../../dataTypes';
import { SortableDataOperationsList } from '../pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from '../select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from '../pipeline-view/dataOperationsList';
import Instruction from '../instruction/instruction';
import withPipelinesExecution from '../withPipelinesExecution';

const EmptyDataVisualization = ({ ...props }) => {
  const { project } = props;
  const { dataOperations } = props;
  const { branches } = props;
  const { files } = props;
  const { dataOperationsSelected } = props;
  const { filesSelectedInModal } = props;
  const items = dataOperationsSelected;
  let operationsSelected = items.length;
  operationsSelected += 1;
  /*
    next props are functions
  */
  const { showSelectFilesModal } = props;
  const { selectDataClick } = props;
  const { handleModalAccept } = props;
  const { onSortEnd } = props;
  const { showFilters } = props;
  const { handleDragStart } = props;
  const { whenDataCardArrowButtonIsPressed } = props;
  const { checkBoxOwnDataOperations } = props;
  const { checkBoxStarredDataOperations } = props;
  const { handleCheckMarkClick } = props;
  const { drop } = props;
  const { allowDrop } = props;
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
      <Navbar />
      <ProjectContainer project={project} activeFeature="data" folders={['Group Name', project.name, 'Data', 'Visualization']} />
      <Instruction
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
                <p>Visualization:</p>
              </div>
              <Input name="DataPipelineID" id="renaming-pipeline" placeholder="ProjectName" />
            </div>
            <div className="header-right-items flexible-div">
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
                <b> select data </b>
              </button>
            </div>
          </div>

          <SortableDataOperationsList items={items} onSortEnd={onSortEnd} />
          <div id="drop-zone" onDrop={drop} onDragOver={allowDrop}>
            <p style={{ marginLeft: '10px', fontWeight: 600 }}>{`Op.${operationsSelected}:`}</p>
            <img src={plus} alt="" style={{ height: '80px', marginLeft: '60px' }} />
            <p style={{
              margin: '0', padding: '0', width: '100%', textAlign: 'center',
            }}
            >
                            Drag and drop a data visualization from the right into your
              <br />
pipeline or
              <b>create a new one</b>
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select a visualization(s) from list:</p>
          </div>
          <div className="content">
            <div className="filter-div flexible-div">
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
            </div>

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
                    value={checkBoxOwnDataOperations}
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

EmptyDataVisualization.propTypes = {
  project: shape.isRequired,
  branches: arrayOf.isRequired,
  files: arrayOf.isRequired,
  dataOperations: arrayOf.isRequired,
  dataOperationsSelected: arrayOf.isRequired,
  filesSelectedInModal: arrayOf.isRequired,
  showSelectFilesModal: func.isRequired,
  selectDataClick: func.isRequired,
  handleModalAccept: func.isRequired,
  onSortEnd: func.isRequired,
  showFilters: func.isRequired,
  handleDragStart: func.isRequired,
  whenDataCardArrowButtonIsPressed: func.isRequired,
  checkBoxOwnDataOperations: func.isRequired,
  checkBoxStarredDataOperations: func.isRequired,
  handleCheckMarkClick: func.isRequired,
  allowDrop: func.isRequired,
  drop: func.isRequired,
};

export default withPipelinesExecution(EmptyDataVisualization, dataVisualizations);

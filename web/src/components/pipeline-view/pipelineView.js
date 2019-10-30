import React from 'react';
import plus from '../../images/plus_01.svg';
import './pipelineView.css';
import Navbar from '../navbar/navbar';
import Input from '../input/input';
import ProjectContainer from '../projectContainer';
import { SortableDataOperationsList } from './sortableDataOperationList';
import SelectDataPipelineModal from '../select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from './dataOperationsList';
import { Instruction } from '../instruction/instruction';
import ExecutePipelineModal from '../execute-pipeline-modal/executePipeLineModal';
import withPipelineExecution from '../withPipelinesExecution';
import { dataPipeLines } from '../../dataTypes';
import uuidv1 from 'uuid/v1';

const PipeLineView = ({ ...props }) => {
  const { project } = props;
  const { dataOperations } = props;
  const { showSelectFilesModal } = props;
  const items = props.dataOperationsSelected;
  let operationsSelected = items.length;
  operationsSelected++;
  const uuidCodeForBranch = (uuidv1()).split('-')[0];
  const branchName = `data-pipeline/${uuidCodeForBranch}`;
  const dataInstanceName = `data-instance/${uuidCodeForBranch}`;
  const jobName = 'data-pipeline';
  return (
    <div className="pipe-line-view">
      <SelectDataPipelineModal
        project={props.project}
        branches={props.branches}
        files={props.files}
        selectDataClick={props.selectDataClick}
        show={showSelectFilesModal}
        filesSelectedInModal={props.filesSelectedInModal}
        handleModalAccept={props.handleModalAccept}
      />
      <ExecutePipelineModal
        isShowing={props.isShowingExecutePipelineModal}
        amountFilesSelected={props.filesSelectedInModal.length}
        toggle={props.toggleExecutePipeLineModal}
        dataOperationsSelected={props.dataOperationsSelected}
        filesSelectedInModal={props.filesSelectedInModal}
        http_url_to_repo={project.http_url_to_repo}
        projectId={project.id}
        branchName={branchName}
        dataInstanceName={dataInstanceName}
        jobName={jobName}
        branchSelected={props.branchSelected}
      />
      <Navbar />
      <ProjectContainer project={project} activeFeature="data" folders={['Group Name', project.name, 'Data', 'Pipeline']} />
      <Instruction
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
                <p>Data Pipeline:</p>
              </div>
              <Input name="DataPipelineID" id="renaming-pipeline" placeholder="Rename data pipeline..." />
            </div>
            <div className="header-right-items flexible-div">
              <div id="execute-button" className="header-button round-border-button right-item flexible-div" onClick={props.handleExecuteBtn}>
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
in your data processing pipeline.
            </p>
            <p id="data">
                            Data:
            </p>

            <div className="data-button-container flexible-div">
              <div id="select-data-btn" onClick={props.selectDataClick}>
                                Select data
              </div>
            </div>
          </div>

          <div id="text-after-files-selected" className="upload-file" style={{ display: 'none' }}>
            <div style={{ width: '50%' }}>
              <p style={{ margin: '6% 0% 6% 2%' }}>
                <b>
Data:&nbsp;&nbsp;
                  {props.filesSelectedInModal.length}
                  {' '}
file(s) selected
                </b>
              </p>
            </div>
            <div style={{
              width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginRight: '2%',
            }}
            >
              <button style={{ backgroundColor: 'white', border: 'none' }} onClick={() => { props.selectDataClick(); }}><b> select data </b></button>
            </div>
          </div>

          <SortableDataOperationsList items={items} onSortEnd={props.onSortEnd} />
          <div id="drop-zone" onDrop={props.drop} onDragOver={props.allowDrop}>
            <p style={{ marginLeft: '10px', fontWeight: 600 }}>{`Op.${operationsSelected}:`}</p>
            <img src={plus} alt="" style={{ height: '80px', marginLeft: '60px' }} />
            <p style={{
              margin: '0', padding: '0', width: '100%', textAlign: 'center',
            }}
            >
                            Drag and drop a data operation from the right into your
              <br />
pipeline or
              <b>create a new one</b>
            </p>
          </div>

        </div>

        <div className="pipe-line-execution tasks-list">
          <div className="header">
            <p>Select a data operations from list:</p>
          </div>
          <div className="content">
            <div className="filter-div flexible-div">
              <Input name="selectDataOp" id="selectDataOp" placeholder="Search a data operation" />
              <div className="search button pipe-line-active flexible-div" onClick={(e) => props.showFilters(e)}>
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
                                    Only own data operations
                  <input
                    type="checkbox"
                    value={props.checkBoxOwnDataOperations}
                    onChange={props.handleCheckMarkClick}
                    id="checkBoxOwnDataOperations"
                  />
                  <span className="checkmark" />
                </label>
                <label className="customized-checkbox">
                                    Only starred data operations
                  <input
                    type="checkbox"
                    value={props.checkBoxStarredDataOperations}
                    onChange={props.handleCheckMarkClick}
                    id="checkBoxStarredDataOperations"
                  />
                  <span className="checkmark" />
                </label>
              </div>
              <Input name="minOfStart" id="minOfStart" placeholder="Minimum of stars" />
            </div>

            <DataOperationsList
              handleDragStart={props.handleDragStart}
              whenDataCardArrowButtonIsPressed={props.whenDataCardArrowButtonIsPressed}
              dataOperations={dataOperations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withPipelineExecution(PipeLineView, dataPipeLines);

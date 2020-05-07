import React from 'react';
import { connect } from 'react-redux';
import {
  shape, arrayOf, func, string, bool, number,
} from 'prop-types';
import FilesSelector from 'components/layout/FilesSelector';
import MCard from 'components/ui/MCard';
import DataOperationFilters from 'components/layout/DataOperationFilters';
import { OPERATION } from 'dataTypes';
import plus from '../../images/plus_01.svg';
import './pipelineView.css';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import SortableDataOperationsList from './sortableDataOperationList';
import SelectDataPipelineModal from '../select-data-pipeline/selectDataPipelineModal';
import { DataOperationsList } from './dataOperationsList';
import Instruction from '../instruction/instruction';
import ExecutePipelineModal from '../execute-pipeline-modal/executePipeLineModal';
import withPipelineExecution from '../withPipelinesExecution';
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
  setPreconfiguredOperations(dataOperations);
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
        type={OPERATION}
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
      <ProjectContainer activeFeature="data" folders={[groupName, project.name, 'Data', 'Pipeline']} />
      <Instruction
        id="PipeLineView"
        titleText="How to create a data processing pipeline:"
        paragraph={
          `First, select your data you want to process. Then select one or multiple data operations from the right.
              The result of a data pipeline is a data instance, which you can use directly to train a model or merge it into a branch.`
        }
      />
      <div className="pipe-line-execution-container flexible-div">
        <MCard
          className="pipe-line-execution"
          title="Data Pipeline"
          buttons={[
            <button key="pipeline-load" type="button" className="btn btn-basic-primary btn-sm">
              Load
            </button>,
            <button key="pipeline-save" type="button" className="btn btn-basic-primary btn-sm">
              Save
            </button>,
            <button
              id="execute-button"
              key="pipeline-execute"
              type="button"
              onClick={handleExecuteBtn}
              className="btn btn-primary btn-sm border-none"
            >
              Execute
            </button>,
          ]}
        >
          <MCard.Section>
            <FilesSelector files={filesSelectedInModal} handleSelectData={selectDataClick} />
          </MCard.Section>

          <MCard.Section>
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
          </MCard.Section>
        </MCard>

        <MCard className="pipe-line-execution tasks-list" title="Select a data operation:">
          <MCard.Section>
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

            <DataOperationFilters show={false} handleCheckMarkClick={handleCheckMarkClick} />

            <DataOperationsList
              handleDragStart={handleDragStart}
              whenDataCardArrowButtonIsPressed={whenDataCardArrowButtonIsPressed}
              dataOperations={dataOperations}
            />
          </MCard.Section>
        </MCard>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches,
    processors: state.processors.operations,
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

export default connect(mapStateToProps)(withPipelineExecution(PipeLineView));

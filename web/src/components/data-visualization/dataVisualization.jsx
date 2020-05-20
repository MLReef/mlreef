import React from 'react';
import { connect } from 'react-redux';
import {
  shape, arrayOf, func, bool, number, string,
} from 'prop-types';
import '../pipeline-view/pipelineView.css';
import MCard from 'components/ui/MCard';
import FilesSelector from 'components/layout/FilesSelector';
import DataOperationFilters from 'components/layout/DataOperationFilters';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import { dataVisualizations } from '../../dataTypes';
import SortableDataOperationsList from '../pipeline-view/sortableDataOperationList';
import SelectDataPipelineModal from '../ui/MSelectDataPipeline/selectDataPipelineModal';
import { DataOperationsList } from '../pipeline-view/dataOperationsList';
import Instruction from '../instruction/instruction';
import withPipelinesExecution from '../withPipelinesExecution';
import ExecutePipelineModal from '../execute-pipeline-modal/executePipeLineModal';
import { randomNameGenerator } from '../../functions/pipeLinesHelpers';
import plus from '../../images/plus_01.svg';

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
        httpUrlToRepo={project.http_url_to_repo}
        projectId={project.id}
        branchName={branchName}
        dataInstanceName={dataInstanceName}
        jobName={jobName}
        branchSelected={branchSelected}
      />
      <Navbar />
      <ProjectContainer activeFeature="data" folders={[groupName, project.name, 'Data', 'Visualization']} />
      <Instruction
        id="EmptyDataVisualization"
        titleText="How to create a data visualization:"
        paragraph={
          `First, select your data you want to analyze. Then select one or multiple data visualizations from the right.
              After execution each visualization will be displayed in a new window.`
        }
      />

      <div className="pipe-line-execution-container flexible-div px-3">
        <MCard
          className="pipe-line-execution"
          title="Visualization"
          buttons={[
            <button key="loading" type="button" className="btn btn-basic-primary btn-sm">
              Load
            </button>,
            <button key="save" type="button" className="btn btn-basic-primary btn-sm">
              Save
            </button>,
            <button
              key="execute"
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

        <MCard className="pipe-line-execution tasks-list" title="Select a visualization:">
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

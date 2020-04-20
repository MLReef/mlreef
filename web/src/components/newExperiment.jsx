import React from 'react';
import { connect } from 'react-redux';
import MCard from 'components/ui/MCard';
import FilesSelector from 'components/layout/FilesSelector';
import DataOperationFilters from 'components/layout/DataOperationFilters';
import plus from '../images/plus_01.svg';
import './pipeline-view/pipelineView.css';
import Navbar from './navbar/navbar';
// import Input from './input/input';
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
      <div className="pipe-line-execution-container flexible-div">
        <MCard
          className="pipe-line-execution"
          title="Experiment"
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
            <FilesSelector
              files={filesSelectedInModal}
              handleSelectData={selectDataClick}
              instructions={(
                <p>
                  Start by selecting your data file(s) you want to include
                  <br />
                  in your experiments.
                </p>
              )}
            />
          </MCard.Section>

          <MCard.Section>
            <SortableDataOperationsList items={items} onSortEnd={onSortEnd} prefix="Algo." />

            <div id="drop-zone" onDrop={drop} onDragOver={allowDrop}>
              <p style={{ marginLeft: '10px', fontWeight: 600 }}>
                {`Algo.${operationsSelected}:`}
              </p>
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
          </MCard.Section>
        </MCard>

        <MCard className="pipe-line-execution tasks-list" title="Select a model:">
          <MCard.Section>
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
  };
}

export default connect(mapStateToProps)(withPipelineExecution(NewExperiment, experiments));

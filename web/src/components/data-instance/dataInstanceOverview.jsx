import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape, objectOf, func, string,
} from 'prop-types';
import DataPipelineApi from 'apis/DataPipelineApi';
import BranchesApi from 'apis/BranchesApi';
import MModal from 'components/ui/MModal';
import { generateBreadCrumbs } from 'functions/helpers';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceOverview.css';
import Instruction from '../instruction/instruction';
import { getTimeCreatedAgo, parseToCamelCase } from '../../functions/dataParserHelpers';
import DataInstancesDeleteModal from '../DeleteDataInstance/DeleteDatainstance';
import GitlabPipelinesApi from '../../apis/GitlabPipelinesApi.ts';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';
import { getBranchesList } from '../../actions/branchesActions';
import { setPreconfiguredOPerations } from '../../actions/userActions';
import { classifyPipeLines, getPipelineIcon } from '../../functions/pipeLinesHelpers';

const gitPipelinesApi = new GitlabPipelinesApi();
const brApi = new BranchesApi();
const dataPipelineApi = new DataPipelineApi();

const getStatusForDataInstance = (status) => {
  let mappedStatus = status;
  switch (status) {
    case RUNNING:
      mappedStatus = 'In progress';
      break;
    case SUCCESS:
      mappedStatus = 'Active';
      break;
    case CANCELED:
      mappedStatus = 'Aborted';
      break;
    case PENDING:
      mappedStatus = 'In progress';
      break;
    default:
      break;
  }

  return mappedStatus;
};

export const InstanceCard = ({ ...props }) => {
  const {
    params,
    history,
    namespace,
    slug,
    setPreconfiguredOPerations,
    updateData,
  } = props;
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [instanceClicked, setInstanceClicked] = useState(null);

  function goToPipelineView(instance) {
    if (!instance) return;
    const configuredOperations = {
      branch: instance.descTitle,
      commit: instance.commitId,
      dataOperatorsExecuted: instance.dataOperations,
      inputFiles: instance.inputFiles,
      pipelineBackendId: instance.pipelineBackendId,
    };
    setPreconfiguredOPerations(configuredOperations);
    history.push(`/${namespace}/${slug}/-/datasets/new`);
  }

  function getButtonsDiv(instance) {
    let buttons;
    const { currentState } = instance;
    if (currentState === RUNNING || currentState === PENDING) {
      buttons = [
        <button
          type="button"
          key="abort-button"
          className="btn btn-danger border-solid my-auto"
          style={{ width: 'max-content' }}
        >
          Abort
        </button>,
      ];
    } else if (
      currentState === SUCCESS
    ) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => goToPipelineView(instance)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          onClick={
            () => {
              setIsDeleteModalVisible(true);
              setInstanceClicked(instance);
            }
          }
          className="btn btn-danger btn-icon my-auto"
        >
          <i className="fa fa-times" />
        </button>,
      ];
    } else if (currentState === FAILED
      || currentState === CANCELED) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="btn btn-outline-dark my-auto mr-1"
          onClick={() => goToPipelineView(instance)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          className="btn btn-danger btn-icon my-auto"
          onClick={() => {
            setIsDeleteModalVisible(true);
            setInstanceClicked(instance);
          }}
        >
          <i className="fa fa-times" />
        </button>,
      ];
    }

    return (
      <div className="buttons-div d-flex">{buttons}</div>
    );
  }
  return (
    <div className="pipeline-card">
      <MModal>
        <DataInstancesDeleteModal
          callBack={updateData}
          instanceToDelete={instanceClicked}
          isModalVisible={isDeleteModalVisible}
          setIsVisible={setIsDeleteModalVisible}
        />
      </MModal>
      <div className="header">
        <div className="title-div">
          <p><b>{getStatusForDataInstance(params.currentState)}</b></p>
        </div>
      </div>

      {params.instances.map((instance) => {
        const {
          id: dataId, pipelineBackendId, userName, currentState,
        } = instance;
        const dataInstanceName = instance.descTitle;
        const uniqueName = dataInstanceName.split('/')[1];
        const modelDiv = 'inherit';
        let progressVisibility = 'inherit';
        if (currentState === 'Expired') { progressVisibility = 'hidden'; }
        return (
          <div key={`instance-comp-id-${instance.id}`} className="card-content">
            <div id="data-ins-summary-data" className="summary-data" data-key={`${instance.descTitle}`}>
              <img style={{ alignSelf: 'center' }} src={getPipelineIcon(currentState)} width="30" height="30" alt={currentState} />
              <div className="project-desc-experiment">
                <Link to={`/${namespace}/${slug}/-/datasets/${pipelineBackendId}`}>
                  <b>{uniqueName}</b>
                </Link>
                <p className="m-0 mt-1">
                  Created by
                  {' '}
                  <a href={`/${userName}`}>
                    <b>
                      {userName}
                    </b>
                  </a>
                  <br />
                  {instance.timeCreatedAgo}
                  {' '}
                  ago
                </p>
              </div>
              <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                <p><b>Usage: ---</b></p>
              </div>
              <div className="project-desc-experiment d-flex" style={{ visibility: modelDiv }}>
                <p style={{ flex: '1' }}>
                  Id:
                  {' '}
                  {dataId}
                </p>
                { getButtonsDiv(instance) }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

class DataInstanceOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: {},
      all: [],
      dataInstances: [],
    };

    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    this.updateData();
  }

  updateData() {
    const { getBranches, projects: { selectedProject: { gid } } } = this.props;
    getBranches(gid);
    this.fetchPipelines();
  }

  fetchPipelines() {
    let project;
    let filteredbranches = [];
    let gid;
    const { projects, projects: { selectedProject: { id } } } = this.props;
    if (projects) {
      project = projects.selectedProject;
      gid = project.gid;
    }

    dataPipelineApi.getProjectPipelines(id)
      .then((backendPipelines) => {
        const dataPipelines = backendPipelines.filter((pipe) => pipe.pipeline_type === 'DATA');
        brApi.getBranches(gid).then((branches) => {
          filteredbranches = branches.filter((branch) => branch.name.startsWith('data-pipeline'));
          gitPipelinesApi.getPipesByProjectId(gid)
            .then((res) => {
              const dataInstancesClassified = classifyPipeLines(res, filteredbranches, dataPipelines);
              this.setState({
                project,
                dataInstances: dataInstancesClassified,
                all: dataInstancesClassified,
              });
            });
        });
      })
      .catch(() => toastr.error('Error', 'Error getting the pipelines'));
  }

  handleButtonsClick(e) {
    if (e) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active');
        }
      });
      e.target.classList.add('active');

      const { all } = this.state;
      let filteredInstances = all;
      if (e.target.id === 'InProgress') {
        filteredInstances = all.filter((exp) => exp.status === RUNNING);
      } else if (e.target.id === 'Active') {
        filteredInstances = all.filter((exp) => exp.status === SUCCESS);
      } else if (e.target.id === 'expired') {
        filteredInstances = all.filter((exp) => exp.status === FAILED);
      }
      this.setState({ dataInstances: filteredInstances });
    }
  }

  render() {
    const {
      project,
      dataInstances,
    } = this.state;
    const {
      match: {
        params: { namespace, slug },
      },
      history,
      projects: { selectedProject },
    } = this.props;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Datasets',
        href: `/${namespace}/${slug}/-/datasets`,
      },
    ];

    return (
      <>
        <div>
          <Navbar />
          { project.gid && (
            <ProjectContainer
              activeFeature="data"
              breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
            />
          )}
          <Instruction
            id="DataInstanceOverview"
            titleText="Handling datasets:"
            paragraph={
              `A dataset is the result of an executed data pipeline. You can use this dataset directly as your source of data for an experiment
               or to create another data pipeline. Simply select the dataset in the branch dropdown while selecting your data.`
            }
          />
          <div className="main-content">
            <div id="buttons-container" className="left">
              <button
                id="all"
                type="button"
                className="active btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                All
              </button>
              <button
                id="InProgress"
                type="button"
                className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                In Progress
              </button>
              <button
                id="Active"
                type="button"
                className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Active
              </button>
              <button
                id="expired"
                type="button"
                className="btn btn-switch btn-bg-light btn-bg-lightbtn-label-sm my-auto mr-2"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Expired
              </button>
            </div>
            {dataInstances
              .map((dataInstanceClassification) => {
                const instances = dataInstanceClassification.values.map((val) => {
                  const timediff = getTimeCreatedAgo(val.commit.created_at, new Date());
                  const bpipeline = parseToCamelCase(val.backendPipeline);
                  return {
                    id: val.id,
                    currentState: val.status,
                    descTitle: val.name,
                    userName: val.commit.author_name,
                    commitId: val?.commit.id,
                    timeCreatedAgo: timediff,
                    projId: selectedProject.gid,
                    backendProjectId: selectedProject.id,
                    dataOperations: bpipeline.dataOperations,
                    pipelineBackendId: bpipeline.id,
                    inputFiles: bpipeline.inputFiles,
                  };
                });
                const firstValue = dataInstanceClassification.values[0];
                const InstanceName = firstValue && firstValue.name;

                if (instances.length === 0) {
                  return null;
                }
                return (
                  <InstanceCard
                    key={InstanceName}
                    name={InstanceName}
                    namespace={namespace}
                    slug={slug}
                    history={history}
                    setPreconfiguredOPerations={setPreconfiguredOPerations}
                    params={{
                      currentState: dataInstanceClassification.status,
                      instances,
                    }}
                    updateData={this.updateData}
                  />
                );
              })}
          </div>
          <br />
          <br />
        </div>
      </>
    );
  }
}

DataInstanceOverview.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  projects: shape({
    selectedProject: objectOf(shape).isRequired,
  }).isRequired,
  getBranches: func.isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

function mapActionsToProps(dispatch) {
  return {
    getBranches: bindActionCreators(getBranchesList, dispatch),
    setPreconfiguredOPerations: bindActionCreators(setPreconfiguredOPerations, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceOverview);

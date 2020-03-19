import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
import { toastr } from 'react-redux-toastr';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceOverview.css';
import Instruction from '../instruction/instruction';
import { getTimeCreatedAgo, parseMlreefConfigurationLines } from '../../functions/dataParserHelpers';
import DataInstancesDeleteModal from '../data-instances-delete-and-abort-modal/dataInstancesDeleteNAbortModal';
import pipelinesApi from '../../apis/PipelinesApi';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';
import filesApi from '../../apis/FilesApi';
import { classifyPipeLines } from '../../functions/pipeLinesHelpers';

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
  const { params } = props;
  function handleButtonsClick(e) {
    const branchName = encodeURIComponent(e.currentTarget.parentNode.parentNode.getAttribute('data-key'));
    const pId = props.params.instances[0].projId;
    props.history.push(`/my-projects/${pId}/master/data-instances/${branchName}`);
  }

  function goToPipelineView(e) {
    const pId = props.params.instances[0].projId;
    const branch = e.currentTarget.parentNode.parentNode.getAttribute('data-key');
    filesApi
      .getFileData(
        pId,
        '.mlreef.yml',
        branch,
      )
      .then((fileData) => {
        const dataParsedInLines = Base64.decode(fileData.content).split('\n');
        const configuredOperation = parseMlreefConfigurationLines(dataParsedInLines);
        sessionStorage.setItem('configuredOperations', JSON.stringify(configuredOperation));
        props.history.push(`/my-projects/${pId}/pipe-line`);
      })
      .catch(() => {

      });
  }

  function handleEmptyClick() { }

  function getButtonsDiv(experimentState) {
    let buttons;
    if (experimentState === RUNNING || experimentState === PENDING) {
      buttons = [
        <button
          type="button"
          key="abort-button"
          className="dangerous-red"
          onClick={
            () => props.setIsDeleteModalVisible(true, 'abort')
          }
          style={{ width: 'max-content' }}
        >
          <b> Abort </b>
        </button>,
      ];
    } else if (
      experimentState === SUCCESS
    ) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="non-active-black-border rounded-pipeline-btn"
          onClick={(e) => goToPipelineView(e)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          onClick={
            () => props.setIsDeleteModalVisible(true, 'delete')
          }
          className="dangerous-red"
        >
          <b>
            X
          </b>
        </button>,
      ];
    } else if (experimentState === FAILED
      || experimentState === CANCELED) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="non-active-black-border rounded-pipeline-btn"
          onClick={(e) => goToPipelineView(e)}
        >
          View Pipeline
        </button>,
        <button
          type="button"
          key="delete-button"
          onClick={
            () => props.setIsDeleteModalVisible(true, 'delete')
          }
          className="dangerous-red"
        >
          <b>
            X
          </b>
        </button>,
      ];
    }

    return (
      <div className="buttons-div">{buttons}</div>
    );
  }

  if (params && params.instances) {
    return params.instances.length > 0 ? (
      <div className="pipeline-card">
        <div className="header">
          <div className="title-div">
            <p><b>{getStatusForDataInstance(params.currentState)}</b></p>
          </div>
        </div>

        {params.instances.map((instance, index) => {
          const dataInstanceName = instance.descTitle;
          const uniqueName = dataInstanceName.split('/')[1];
          const modelDiv = 'inherit';
          let progressVisibility = 'inherit';
          if (instance.currentState === 'Expired') { progressVisibility = 'hidden'; }
          return (
            <div key={index} className="card-content">
              <div id="data-ins-summary-data" className="summary-data" data-key={`${instance.descTitle}`}>
                <div className="project-desc-experiment">
                  <p
                    onClick={(e) => {
                      if (instance.currentState === 'Expired') {
                        handleEmptyClick();
                      } else {
                        handleButtonsClick(e);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <b>{uniqueName}</b>
                  </p>
                  <p>
                    Created by
                    {' '}
                    <b>{instance.userName}</b>
                    <br />
                    {instance.timeCreatedAgo}
                    {' '}
                    ago
                  </p>
                </div>
                <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                  <p><b>Usage: ---</b></p>
                  <p>
                    Expires in:
                    {instance.expiration}
                  </p>
                </div>
                <div className="project-desc-experiment" style={{ visibility: modelDiv }}>
                  <p><b>--- files changed</b></p>
                  <p>
                    Id:
                    {' '}
                    {instance.di_id ? instance.di_id : '72fb5m'}
                  </p>
                </div>
                { getButtonsDiv(instance.currentState) }
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      null
    );
  }
};


class DataInstanceOverview extends Component {
  constructor(props) {
    super(props);
    let project;
    let branches;
    let id;
    const { projects } = this.props;
    if (projects) {
      project = props.projects.selectedProject;
      branches = props.branches.filter((branch) => branch.name.startsWith('data-pipeline'));
      id = project.id;
    }
    this.state = {
      all: [],
      isDeleteModalVisible: false,
      dataInstances: [],
      typeOfMessage: null,
    };

    pipelinesApi.getPipesByProjectId(id).then((res) => {
      const dataInstancesClassified = classifyPipeLines(res, branches);
      this.setState({ dataInstances: dataInstancesClassified, all: dataInstancesClassified });
    }).catch(() => toastr.error('Error', 'Error getting the pipelines'));
    this.setIsDeleteModalVisible = this.setIsDeleteModalVisible.bind(this);
  }

  setIsDeleteModalVisible(isDeleteModalVisible, typeOfMessage) {
    this.setState({
      isDeleteModalVisible,
      typeOfMessage,
    });
  }

  handleButtonsClick(e) {
    if (e) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active-border-light-blue');
          childNode.classList.add('non-active-black-border');
        }
      });
      e.target.classList.add('active-border-light-blue');
      e.target.classList.remove('non-active-black-border');

      const { all } = this.state;
      if (e.target.id === 'all') {
        const allInstances = all;
        this.setState({ dataInstances: allInstances });
      } else if (e.target.id === 'InProgress') {
        const completed = all.filter((exp) => exp.status === 'running');
        this.setState({ dataInstances: completed });
      } else if (e.target.id === 'Active') {
        const canceled = all.filter((exp) => exp.status === 'success');
        this.setState({ dataInstances: canceled });
      } else if (e.target.id === 'expired') {
        const failed = all.filter((exp) => exp.status === 'failed');
        this.setState({ dataInstances: failed });
      }
    }
  }

  render() {
    const {
      dataInstances,
      isDeleteModalVisible,
      typeOfMessage,
    } = this.state;
    const { history, projects: { selectedProject } } = this.props;
    let groupName; 
    let name;
    if (selectedProject) {
      groupName = selectedProject.namespace.name;
      name = selectedProject.name;
    }
    return (
      <>
        <DataInstancesDeleteModal
          isModalVisible={isDeleteModalVisible}
          setIsVisible={this.setIsDeleteModalVisible}
          typeOfMessage={typeOfMessage}
        />
        <div>
          <Navbar />
          <ProjectContainer
            project={selectedProject}
            activeFeature="data"
            folders={[groupName, name, 'Data', 'Instances']}
          />
          <Instruction
            id="DataInstanceOverview"
            titleText="Handling Data instances:"
            paragraph={
              `A data instance is the result of an executed data pipeline. You can use this dataset directly as your source of data for an experiment (or another data pipeline). You can also merge the data instance to your master - thus making it the new master data set.
                directly for training or to merge them into a data repository in order to permanently save the changes made.`
            }
          />
          <div className="main-content">
            <br />
            <div id="line" />
            <br />
            <div id="buttons-container">
              <button
                id="all"
                type="button"
                className="non-active-black-border rounded-pipeline-btn"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                All
              </button>
              <button
                id="InProgress"
                type="button"
                className="non-active-black-border rounded-pipeline-btn"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                In Progress
              </button>
              <button
                id="Active"
                type="button"
                className="non-active-black-border rounded-pipeline-btn"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Active
              </button>
              <button
                id="expired"
                type="button"
                className="non-active-black-border rounded-pipeline-btn"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Expired
              </button>
            </div>
            {dataInstances
              .map((dataInstanceClassification, index) => {
                const instances = dataInstanceClassification.values.map((val) => {
                  const timediff = getTimeCreatedAgo(val.commit.created_at);
                  return {
                    currentState: val.status,
                    di_id: val.commit.short_id,
                    descTitle: val.name,
                    userName: val.commit.author_name,
                    timeCreatedAgo: timediff,
                    expiration: timediff,
                    projId: selectedProject.id,
                    modelTitle: 'Resnet-50',
                  };
                });

                return (
                  <InstanceCard
                    key={index}
                    history={history}
                    setIsDeleteModalVisible={this.setIsDeleteModalVisible}
                    params={{
                      currentState: dataInstanceClassification.status,
                      instances,
                    }}
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

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(DataInstanceOverview);

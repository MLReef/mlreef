import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceOverview.css';
import arrowDownWhite01 from '../../images/arrow_down_white_01.svg';
import Instruction from '../instruction/instruction';
import { getTimeCreatedAgo, mlreefLinesToExtractConfiguration } from '../../functions/dataParserHelpers';
import DataInstancesDeleteModal from '../data-instances-delete-and-abort-modal/dataInstancesDeleteNAbortModal';
import pipelinesApi from '../../apis/PipelinesApi';
import {
  SKIPPED,
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';
import filesApi from '../../apis/FilesApi';

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

const InstanceCard = ({ ...props }) => {
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
        const configuredOperation = mlreefLinesToExtractConfiguration(dataParsedInLines);
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
        || experimentState === FAILED
        || experimentState === CANCELED
    ) {
      buttons = [
        <button
          type="button"
          key="experiment-button"
          className="non-active-black-border experiment-button"
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
        <Dropdown key="dropdown-save" />,
      ];
    }

    return (
      <div className="buttons-div">{buttons}</div>
    );
  }

  return params.instances.length > 0 ? (
    <div className="data-instance-card">
      <div className="header">
        <div className="title-div">
          <p><b>{getStatusForDataInstance(params.currentState)}</b></p>
        </div>
      </div>

      {params.instances.map((instance, index) => {
        const modelDiv = 'inherit';
        let progressVisibility = 'inherit';
        if (instance.currentState === 'Expired') { progressVisibility = 'hidden'; }
        return (
          <div key={index} className="card-content">
            <div className="summary-data" data-key={`${instance.descTitle}`}>
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
                  <b>{instance.descTitle}</b>
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
                <p><b>Use: 24GB</b></p>
                <p>
                  Expires in:
                  {instance.expiration}
                </p>
              </div>
              <div className="project-desc-experiment" style={{ visibility: modelDiv }}>
                <p><b>24,051 files changed</b></p>
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
};


class DataInstanceOverview extends Component {
  constructor(props) {
    super(props);
    const project = this.props.projects.selectedProject;
    const branches = props.branches.filter((branch) => branch.name.startsWith('data-pipeline'));
    this.state = {
      project,
      all: [],
      isDeleteModalVisible: false,
      dataInstances: [],
      typeOfMessage: null,
    };

    pipelinesApi.getPipesByProjectId(project.id).then((res) => {
      const pipes = res.filter((pipe) => pipe.status !== SKIPPED);
      const dataInstances = branches.map((branch) => {
        const pipeBranch = pipes.filter((pipe) => pipe.ref === branch.name)[0];
        if (pipeBranch) {
          const dataInstance = {};
          dataInstance.status = pipeBranch.status;
          dataInstance.name = branch.name;
          dataInstance.authorName = branch.author_name;
          dataInstance.commit = branch.commit;
          return dataInstance;
        }

        return null;
      }).filter((dataInstance) => dataInstance !== null);
      const dataInstancesClassified = [
        {
          status: RUNNING,
          values:
          dataInstances
            .filter((dataIns) => dataIns.status === RUNNING
              || dataIns.status === PENDING),
        },
        { status: SUCCESS, values: dataInstances.filter((dataIns) => dataIns.status === SUCCESS) },
        { status: CANCELED, values: dataInstances.filter((dataIns) => dataIns.status === CANCELED) },
        { status: FAILED, values: dataInstances.filter((dataIns) => dataIns.status === FAILED) },
      ];
      this.setState({ dataInstances: dataInstancesClassified, all: dataInstancesClassified });
    });
    this.setIsDeleteModalVisible = this.setIsDeleteModalVisible.bind(this);
  }

  setIsDeleteModalVisible(isDeleteModalVisible, typeOfMessage) {
    this.setState({
      isDeleteModalVisible,
      typeOfMessage,
    });
  }

  handleButtonsClick(e) {
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

  hideInstruction() {
    document.getElementById('instruction-pipe-line').classList.add('invisible');
  }

  render() {
    const { project } = this.state;
    const groupName = project.namespace.name;
    return (
      <>
        <DataInstancesDeleteModal
          isModalVisible={this.state.isDeleteModalVisible}
          setIsVisible={this.setIsDeleteModalVisible}
          typeOfMessage={this.state.typeOfMessage}
        />
        <div>
          <Navbar />
          <ProjectContainer
            project={project}
            activeFeature="data"
            folders={[groupName, project.name, 'Data', 'Instances']}
          />
          <Instruction
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
                className="non-active-black-border experiment-button"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                All
              </button>
              <button
                id="InProgress"
                type="button"
                className="non-active-black-border experiment-button"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                In Progress
              </button>
              <button
                id="Active"
                type="button"
                className="non-active-black-border experiment-button"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Active
              </button>
              <button
                id="expired"
                type="button"
                className="non-active-black-border experiment-button"
                onClick={(e) => this.handleButtonsClick(e)}
              >
                Expired
              </button>
            </div>
            {this.state.dataInstances
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
                    projId: this.state.project.id,
                    modelTitle: 'Resnet-50',
                  };
                });

                return (
                  <InstanceCard
                    key={index}
                    history={this.props.history}
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

function Dropdown() {
  const [state, setState] = React.useState(false);
  const node = React.useRef();

  const handleClickOutside = (e) => {
    if (node.current.contains(e.target)) {
      return;
    }
    setState(false);
  };

  React.useEffect(() => {
    if (state) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setState(!state)}
        ref={node}
        className="light-green-button experiment-button non-active-black-border"
      >
        <span>
          <b style={{ margin: '0 10px 10px 0' }}>
            Save
          </b>
        </span>
        <img className="dropdown-white" src={arrowDownWhite01} alt="" />
      </button>
      {state
        && (
        <div className="save-instance">
          <div
            style={{ marginLeft: '25%', fontSize: '14px' }}
          >
            <p>Save Data Instances</p>
          </div>
          <hr />
          <div className="search-branch">
            <div>
              <p><b>New branch</b></p>
              <p className="dull">Only new data is saved in new branch</p>
            </div>
            <div>
              <p><b>Create Pull Request</b></p>
              <p className="dull">New data and original data coexist in existing branch</p>
            </div>
          </div>
        </div>
        )}
    </>
  );
}

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(DataInstanceOverview);

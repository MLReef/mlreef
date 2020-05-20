import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import { CircularProgress } from '@material-ui/core';
import uuidv1 from 'uuid/v1';
import {
  shape, objectOf, arrayOf, string, func,
} from 'prop-types';
import CustomizedButton from 'components/CustomizedButton';
import ExperimentsApi from 'apis/experimentApi';
import BranchesApi from '../../apis/BranchesApi';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import * as jobsActions from '../../actions/jobsActions';
import pipelinesApi from '../../apis/PipelinesApi';
import ExperimentCard from './experimentCard';
import { classifyExperiments } from '../../functions/pipeLinesHelpers';
import emptyLogo from '../../images/experiments_empty-01.png';

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const { projects: { selectedProject } } = this.props;

    this.state = {
      selectedProject,
      all: [],
      empty: true,
      loading: true,
      experiments: [],
      selectedExperiment: null,
    };

    this.displayEmptyLogo = this.displayEmptyLogo.bind(this);
    this.handleButtonsClick = this.handleButtonsClick.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ loading: false });
    }, 1000);

    const { projects: { selectedProject: { id }, selectedProjectUUID }, actions } = this.props;
    let experiments;
    actions.getJobsListPerProject(id);
    ExperimentsApi.getExperiments(selectedProjectUUID.id)
      .then((res) => {
        experiments = res;
      })
      .catch(() => toastr.error('Error', 'Could not fetch the latest experiments'));
    pipelinesApi.getPipesByProjectId(id).then((res) => {
      BranchesApi.getBranches(id)
        .then((branches) => {
          const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('experiment'));
          const experimentsClassified = classifyExperiments(res, arrayOfBranches, experiments);
          this.setState({ experiments: experimentsClassified, all: experimentsClassified });
          this.displayEmptyLogo();
        })
        .catch(() => toastr.error('Error', 'Something went wrong getting your experiments, Please refresh your page'));
    });
  }

  displayEmptyLogo = () => {
    const { experiments } = this.state;
    experiments.forEach((experimentClassification) => {
      if (experimentClassification.values.length !== 0) {
        this.setState({ empty: false });
      }
    });
  }

  handleButtonsClick(e) {
    e.target.parentNode.childNodes.forEach((childNode) => {
      if (childNode.id !== e.target.id) {
        childNode.classList.remove('active');
      }
    });
    e.target.classList.add('active');

    const { all } = this.state;
    let experiments = all;
    if (e.target.id !== 'all') {
      experiments = all.filter((exp) => exp.status === e.target.id);
    }
    this.setState({ experiments });
  }

  render() {
    const {
      selectedProject, selectedExperiment, experiments, empty, loading,
    } = this.state;
    const { history } = this.props;
    return (
      <div id="experiments-overview-container">
        <>
          <Navbar />
          <ProjectContainer
            activeFeature="experiments"
            viewName="Experiments"
          />
          {loading
            ? (
              <div style={{ display: 'flex' }}>
                <CircularProgress style={{ marginLeft: '50%', marginTop: '5%' }} size={30} />
              </div>
            )
            : (
              <>
                <br />
                <br />
                {empty ? (
                  <div className="main-content">
                    <div className="epmty-experiment-logo">
                      <img src={emptyLogo} width="240" alt="Create an experiment" />
                      <span>You don't have any experiment in your ML project</span>
                      <p>Why not start one?</p>
                      <CustomizedButton
                        id="new-experiment"
                        loading={false}
                        onClickHandler={() => {
                          history.push(`/my-projects/${selectedProject.id}/new-experiment`);
                        }}
                        buttonLabel="Start an experiment"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="main-content">
                    {selectedExperiment === null && (
                    <>
                      <br />
                      <div id="line" />
                      <br />
                    </>
                    )}
                    {selectedExperiment === null && (
                    <div id="buttons-container">
                      <button
                        id="all"
                        type="button"
                        className="btn btn-switch"
                        onClick={this.handleButtonsClick}
                      >
                        All
                      </button>
                      <button
                        id="running"
                        type="button"
                        className="btn btn-switch"
                        onClick={this.handleButtonsClick}
                      >
                        Running
                      </button>
                      <button
                        id="open"
                        type="button"
                        className="btn btn-switch"
                        onClick={this.handleButtonsClick}
                      >
                        Open
                      </button>
                      <button
                        id="completed"
                        type="button"
                        className="btn btn-switch"
                        onClick={this.handleButtonsClick}
                      >
                        Completed
                      </button>
                      <button
                        id="failed"
                        type="button"
                        className="btn btn-switch"
                        onClick={this.handleButtonsClick}
                      >
                        Failed
                      </button>
                      <button
                        id="aborted"
                        type="button"
                        className="btn btn-switch mr-auto"
                        onClick={this.handleButtonsClick}
                      >
                        Aborted
                      </button>
                      <CustomizedButton
                        id="new-experiment"
                        loading={false}
                        onClickHandler={() => {
                          history.push(`/my-projects/${selectedProject.id}/new-experiment`);
                        }}
                        buttonLabel="New experiment"
                      />

                    </div>
                    )}
                    {selectedExperiment === null
                      && experiments.map((experimentClassification) => {
                        const expMapped = experimentClassification.values.map(
                          (experiment) => ({
                            currentState: experiment.status,
                            descTitle: experiment.name,
                            userName: experiment.authorName,
                            modelTitle: experiment.experimentData.processing.name,
                            timeCreatedAgo: experiment.createdAt,
                            experimentData: experiment.experimentData,
                          }),
                        );

                        return (
                          <ExperimentCard
                            key={uuidv1()}
                            params={{
                              projectId: selectedProject.id,
                              defaultBranch: selectedProject.default_branch,
                              currentState: experimentClassification.status,
                              experiments: expMapped,
                            }}
                          />
                        );
                      })}
                  </div>
                )}
                <br />
                <br />
              </>
            )}
        </>
      </div>
    );
  }
}

ExperimentsOverview.propTypes = {
  projects: shape({
    selectedProject: objectOf(shape).isRequired,
    selectedProjectUUID: shape({
      id: string.isRequired,
    }).isRequired,
    jobs: arrayOf(
      shape({
        ref: string.isRequired,
      }).isRequired,
    ).isRequired,
    history: shape({}).isRequired,
    actions: shape({
      getJobsListPerProject: func.isRequired,
    }).isRequired,
  }),
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...jobsActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentsOverview);

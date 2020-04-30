import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { CircularProgress } from '@material-ui/core';
import uuidv1 from 'uuid/v1';
import { shape, objectOf, arrayOf, string } from 'prop-types';
import CustomizedButton from 'components/CustomizedButton';
import BranchesApi from '../../apis/BranchesApi';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import pipelinesApi from '../../apis/PipelinesApi';
import {
  filesForExperimentsDetails,
} from '../../dataTypes';
import ExperimentDetails from '../experiment-details/experimentDetails';
import ExperimentCard from './experimentCard';
import { classifyPipeLines } from '../../functions/pipeLinesHelpers';
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

    this.setSelectedExperiment = this.setSelectedExperiment.bind(this);
    this.displayEmptyLogo = this.displayEmptyLogo.bind(this);
    this.handleButtonsClick = this.handleButtonsClick.bind(this);
  }

  componentDidMount() {
    const { projects: { selectedProject } } = this.props;
    setTimeout(() => {
      this.setState({ loading: false });
    }, 500);
    pipelinesApi.getPipesByProjectId(selectedProject.id).then((res) => {
      BranchesApi.getBranches(selectedProject.id)
        .then((branches) => {
          const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('experiment'));
          const experimentsClassified = classifyPipeLines(res, arrayOfBranches);
          this.setState({ experiments: experimentsClassified, all: experimentsClassified });
          this.displayEmptyLogo();
        })
        .catch(() => toastr.error('Error', 'Something went wrong getting your experiments'));
    });
  }

  setSelectedExperiment(experiment) {
    this.setState({ selectedExperiment: experiment });
  }

  // this is called when user clicks Experiments Tab forcing to shown the list
  forceShowExperimentList = () => {
    this.setState({ selectedExperiment: null });
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
    const { selectedProject, selectedExperiment, experiments, empty, loading } = this.state;
    const { jobs, history } = this.props;
    let experimentJob;
    const firstInd = 0;
    if (selectedExperiment) {
      experimentJob = jobs.filter((job) => job.ref === selectedExperiment.descTitle)[firstInd];
    }
    const groupName = selectedProject.namespace.name;
    return (
      <div id="experiments-overview-container">
        <>
          <Navbar />
          <ProjectContainer
            forceShowExperimentList={this.forceShowExperimentList}
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
                            percentProgress: '100',
                            eta: '0',
                            modelTitle: 'Resnet 50',
                            timeCreatedAgo: experiment.createdAt,
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
                            setSelectedExperiment={this.setSelectedExperiment}
                          />
                        );
                      })}
                    {selectedExperiment
                      && (
                      <ExperimentDetails
                        key={uuidv1()}
                        projectId={selectedProject.id}
                        setNullExperiment={this.setSelectedExperiment}
                        experiment={selectedExperiment}
                        job={experimentJob}
                        parameters={filesForExperimentsDetails}
                      />
                      )}
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
  }).isRequired,
  jobs: arrayOf(
    shape({
      ref: string.isRequired,
    }).isRequired,
  ).isRequired,
  history: shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    projects: state.projects,
  };
}

export default connect(mapStateToProps)(ExperimentsOverview);

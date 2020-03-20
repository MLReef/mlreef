import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import uuidv1 from 'uuid/v1';
import BranchesApi from 'apis/BranchesApi';
import { shape, objectOf } from 'prop-types';
import CustomizedButton from 'components/CustomizedButton';
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

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const { projects: { selectedProject } } = this.props;

    this.state = {
      selectedProject,
      all: [],
      experiments: [],
      selectedExperiment: null,
    };

    this.setSelectedExperiment = this.setSelectedExperiment.bind(this);
  }

  componentDidMount() {
    const { projects: { selectedProject } } = this.props;
    pipelinesApi.getPipesByProjectId(selectedProject.id).then((res) => {
      BranchesApi.getBranches(selectedProject.id)
        .then((branches) => {
          const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('experiment'));
          const experimentsClassified = classifyPipeLines(res, arrayOfBranches);
          this.setState({ experiments: experimentsClassified, all: experimentsClassified });
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

  // this is called when user clicks Experiments Tab forcing to shown the list
  forceShowExperimentList = () => {
    this.setState({ selectedExperiment: null });
  }

  render() {
    const { selectedProject, selectedExperiment, experiments } = this.state;
    const { jobs, history } = this.props;
    let experimentJob;
    const firstInd = 0;
    if (selectedExperiment) {
      experimentJob = jobs.filter((job) => job.ref === selectedExperiment.descTitle)[firstInd];
    }
    const groupName = selectedProject.namespace.name;
    return (
      <div id="experiments-overview-container">
        <Navbar />
        <ProjectContainer
          forceShowExperimentList={this.forceShowExperimentList}
          project={selectedProject}
          activeFeature="experiments"
          folders={[groupName, selectedProject.name, 'Data', 'Experiments']}
        />
        <br />
        <br />
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
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              All
            </button>
            <button
              id="running"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              Running
            </button>
            <button
              id="open"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              Open
            </button>
            <button
              id="completed"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              Completed
            </button>
            <button
              id="failed"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              Failed
            </button>
            <button
              id="aborted"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto"
              onClick={(e) => this.handleButtonsClick(e)}
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
        <br />
        <br />
      </div>
    );
  }
}

ExperimentsOverview.propTypes = {
  projects: shape({
    selectedProject: objectOf(shape).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    projects: state.projects,
  };
}

export default connect(mapStateToProps)(ExperimentsOverview);

/* eslint-disable implicit-arrow-linebreak */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import uuidv1 from 'uuid/v1';
import { shape, arrayOf, objectOf } from 'prop-types';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import pipelinesApi from '../../apis/PipelinesApi';
import {
  SKIPPED,
  filesForExperimentsDetails,
  RUNNING,
  PENDING,
  SUCCESS,
  CANCELED,
  FAILED,
} from '../../dataTypes';
import ExperimentDetails from '../experiment-details/experimentDetails';
import ExperimentCard from './experimentCard';

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const { projects: { selectedProject }, branches } = this.props;

    this.state = {
      selectedProject,
      all: [],
      experiments: [],
      selectedExperiment: null,
    };

    this.setSelectedExperiment = this.setSelectedExperiment.bind(this);
    const arrayOfBranches = branches.filter((branch) => branch.name.startsWith('experiment'));
    pipelinesApi.getPipesByProjectId(selectedProject.id).then((res) => {
      const pipes = res.filter((pipe) => pipe.status !== SKIPPED);
      const experiments = arrayOfBranches.map((branch) => {
        const pipeBranch = pipes.filter((pipe) => pipe.ref === branch.name)[0];
        if (pipeBranch) {
          const experiment = {};
          experiment.status = pipeBranch.status;
          experiment.name = branch.name;
          experiment.authorName = branch.commit.author_name;
          experiment.createdAt = branch.commit.created_at;
          experiment.commit = branch.commit;
          return experiment;
        }

        return null;
      }).filter((experiment) => experiment !== null);
      const experimentsClassified = [
        {
          status: RUNNING,
          values:
          experiments
            .filter((exp) => exp.status === RUNNING
              || exp.status === PENDING),
        },
        { status: SUCCESS, values: experiments.filter((exp) => exp.status === SUCCESS) },
        { status: CANCELED, values: experiments.filter((exp) => exp.status === CANCELED) },
        { status: FAILED, values: experiments.filter((exp) => exp.status === FAILED) },
      ];
      this.setState({ experiments: experimentsClassified, all: experimentsClassified });
    });
  }

  setSelectedExperiment(experiment) {
    this.setState({ selectedExperiment: experiment });
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
      const allExperiments = all;
      this.setState({ experiments: allExperiments });
    } else if (e.target.id === 'completed') {
      const completed = all.filter((exp) => exp.status === 'success');
      this.setState({ experiments: completed });
    } else if (e.target.id === 'aborted') {
      const canceled = all.filter((exp) => exp.status === 'canceled');
      this.setState({ experiments: canceled });
    } else if (e.target.id === 'failed') {
      const failed = all.filter((exp) => exp.status === 'failed');
      this.setState({ experiments: failed });
    } else if (e.target.id === 'running') {
      const running = all.filter((exp) => exp.status === 'running');
      this.setState({ experiments: running });
    } else if (e.target.id === 'open') {
      const open = all.filter((exp) => exp.status === 'open');
      this.setState({ experiments: open });
    }
  }

  render() {
    const { selectedProject, selectedExperiment, experiments } = this.state;
    const { jobs }  = this.props;
    let experimentJob;
    if(selectedExperiment){
      experimentJob = jobs.filter(job => job.ref === selectedExperiment.descTitle)[0];
    }
    const groupName = selectedProject.namespace.name;
    return (
      <div id="experiments-overview-container">
        <Navbar />
        <ProjectContainer
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
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            All
            </button>
            <button
              id="running"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Running
            </button>
            <button
              id="open"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Open
            </button>
            <button
              id="completed"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Completed
            </button>
            <button
              id="failed"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Failed
            </button>
            <button
              id="aborted"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Aborted
            </button>
            <Link
              id="new-experiment"
              to={`/my-projects/${selectedProject.id}/new-experiment`}
              style={{ height: '0.1em' }}
              className="light-green-button experiment-button"
            >
              <b>
                New experiment
              </b>
            </Link>
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
  branches: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(ExperimentsOverview);

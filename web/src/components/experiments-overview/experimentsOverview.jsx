import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  shape,
} from 'prop-types';
import CustomizedButton from 'components/CustomizedButton';
import ExperimentsApi from 'apis/experimentApi';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import * as userActions from '../../actions/userActions';
import ExperimentCard from './experimentCard';
import { classifyExperiments } from '../../functions/pipeLinesHelpers';
import emptyLogo from '../../images/experiments_empty-01.png';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { plainToClass } from 'class-transformer';
import Experiment from 'domain/experiments/Experiment';
import CommitsApi from 'apis/CommitsApi';

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const { projects: { selectedProject } } = this.props;

    this.state = {
      selectedProject,
      all: [],
      empty: true,
      experiments: [],
      selectedExperiment: null,
    };

    this.displayEmptyLogo = this.displayEmptyLogo.bind(this);
    this.handleButtonsClick = this.handleButtonsClick.bind(this);
  }

  componentDidMount() {
    const { projects: { selectedProject: { id, backendId } }, actions } = this.props;
    actions.setIsLoading(true);
    ExperimentsApi.getExperiments(backendId)
      .then((rawExperiments) => rawExperiments.map((exp) => {
        const parsedExp = parseToCamelCase(exp);
        const classExp = plainToClass(Experiment, parseToCamelCase(exp));
        classExp.pipelineJobInfo = parseToCamelCase(parsedExp.pipelineJobInfo);

        return classExp;
      }))
      .then((exps) => exps.map(async (exp) => {
        const commitInfo = await CommitsApi.getCommitDetails(id, exp.pipelineJobInfo?.commitSha);
        exp.authorName = commitInfo.author_name;
        return exp;
      }))
      .then(async (promises) => {
        const experiments = await Promise.all(promises);
        const experimentsClassified = classifyExperiments(experiments);
        this.setState({ experiments: experimentsClassified, all: experimentsClassified });
      })
      .catch(() => toastr.error('Error', 'Could not fetch the latest experiments'))
      .finally(() => {
        this.displayEmptyLogo();
        actions.setIsLoading(false);
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
      selectedProject, selectedExperiment, experiments, empty,
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
                    history.push(`/my-projects/${selectedProject.id}/pipeline-execution/new-experiment`);
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
                    history.push(`/my-projects/${selectedProject.id}/pipeline-execution/new-experiment`);
                  }}
                  buttonLabel="New experiment"
                />

              </div>
              )}
              {selectedExperiment === null && experiments.map((experimentClassification) => (
                <ExperimentCard
                  key={uuidv1()}
                  projectId={selectedProject.id}
                  defaultBranch={selectedProject.defaultBranch}
                  currentState={experimentClassification.status}
                  experiments={experimentClassification.values}
                />
              ))}
            </div>
          )}
          <br />
          <br />

        </>
      </div>
    );
  }
}

ExperimentsOverview.propTypes = {
  projects: shape({
    selectedProject: shape({}).isRequired,
  }).isRequired,
  history: shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentsOverview);

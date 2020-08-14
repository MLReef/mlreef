import React, { Component } from 'react';
import { connect } from 'react-redux';
import { plainToClass } from 'class-transformer';
import Experiment from 'domain/experiments/Experiment';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  shape, string, number, func, arrayOf,
} from 'prop-types';
import CustomizedButton from 'components/CustomizedButton';
import ExperimentsApi from 'apis/experimentApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import CommitsApi from '../../apis/CommitsApi.ts';
import * as jobsActions from '../../actions/jobsActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import * as userActions from '../../actions/userActions';
import ExperimentCard from './experimentCard';
import { classifyExperiments } from '../../functions/pipeLinesHelpers';
import emptyLogo from '../../images/experiments_empty-01.png';

const expApi = new ExperimentsApi();
const commitsApi = new CommitsApi();

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const { projects: { selectedProject } } = this.props;

    this.state = {
      selectedProject,
      all: [{ values: [] }],
      experiments: [{ values: [] }],
      selectedExperiment: null,
    };

    this.handleButtonsClick = this.handleButtonsClick.bind(this);
  }

  componentDidMount() {
    const { projects: { selectedProject: { gid, id } }, actions } = this.props;
    actions.setIsLoading(true);
    actions.getJobsListPerProject(gid);
    expApi.getExperiments(id)
      .then((exps) => exps.map((exp) => parseToCamelCase(exp)))
      .then((rawExperiments) => rawExperiments
        .filter((exp) => exp.pipelineJobInfo !== null)
        .map((exp) => {
          const classExp = plainToClass(Experiment, parseToCamelCase(exp));
          classExp.pipelineJobInfo = parseToCamelCase(exp.pipelineJobInfo);

          return classExp;
        }))
      .then((exps) => exps.map(async (exp) => {
        const commitInfo = await commitsApi.getCommitDetails(gid, exp.pipelineJobInfo?.commitSha);
        exp.authorName = commitInfo.author_name;
        exp.status = commitInfo
          .last_pipeline
          .status?.toUpperCase(); // update with the latest status from Gitlab
        return exp;
      }))
      .then(async (promises) => {
        const experiments = await Promise.all(promises);
        const experimentsClassified = classifyExperiments(experiments);
        this.setState({ experiments: experimentsClassified, all: experimentsClassified });
      })
      .catch(() => toastr.error('Error', 'Could not fetch the latest experiments'))
      .finally(() => actions.setIsLoading(false));
  }

  handleButtonsClick(e) {
    if (e.target.parentNode) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active');
        }
      });
      e.target.classList.add('active');
    }

    const { all } = this.state;
    let experiments = all;
    if (e.target.id !== 'all') {
      experiments = all.filter((exp) => exp.status === e.target.id.toUpperCase());
    }
    this.setState({ experiments });
  }

  render() {
    const {
      selectedProject, selectedExperiment, experiments, all,
    } = this.state;

    const {
      history,
      algorithms,
      projects: { selectedProject: { namespace, slug } }
    } = this.props;

    const areThereExperimentsToShow = all.map((expClass) => expClass.values.length).reduce((a, b) => a + b) !== 0;

    return (
      <div id="experiments-overview-container">
        <>
          <Navbar />
          <ProjectContainer
            activeFeature="experiments"
            viewName="Experiments"
          />
          {areThereExperimentsToShow ? (
            <div className="main-content">
              {selectedExperiment === null && (
                <>
                  <div id="buttons-container">
                    <button
                      id="all"
                      type="button"
                      className="btn btn-switch"
                      onClick={(e) => this.handleButtonsClick(e)} // Tests break when the function call is not explicit
                    >
                      All
                    </button>
                    <button
                      id="running"
                      type="button"
                      className="btn btn-switch"
                      onClick={(e) => this.handleButtonsClick(e)}
                    >
                      Running
                    </button>
                    <button
                      id="success"
                      type="button"
                      className="btn btn-switch"
                      onClick={(e) => this.handleButtonsClick(e)}
                    >
                      Completed
                    </button>
                    <button
                      id="failed"
                      type="button"
                      className="btn btn-switch"
                      onClick={(e) => this.handleButtonsClick(e)}
                    >
                      Failed
                    </button>
                    <button
                      id="canceled"
                      type="button"
                      className="btn btn-switch mr-auto"
                      onClick={(e) => this.handleButtonsClick(e)}
                    >
                      Canceled
                    </button>
                    <CustomizedButton
                      id="new-experiment"
                      className="mr-0"
                      loading={false}
                      onClickHandler={() => history.push(`/${namespace}/${slug}/-/experiments/new`)}
                      buttonLabel="New experiment"
                    />
                  </div>
                </>
              )}
              {selectedExperiment === null && experiments.map((experimentClassification) => experimentClassification.values.length > 0 && (
                <ExperimentCard
                  key={uuidv1()}
                  projectId={selectedProject.gid}
                  defaultBranch={selectedProject.defaultBranch}
                  currentState={experimentClassification.status}
                  experiments={experimentClassification.values}
                  algorithms={algorithms}
                />
              ))}
            </div>
          ) : (
            <div className="main-content">
              <div className="epmty-experiment-logo">
                <img src={emptyLogo} width="240" alt="Create an experiment" />
                <span>You don't have any experiment in your ML project</span>
                <p>Why not start one?</p>
                <CustomizedButton
                  id="new-experiment"
                  loading={false}
                  onClickHandler={() => {
                    history.push(`/${namespace}/${slug}/-/experiments/new`);
                  }}
                  buttonLabel="Start an experiment"
                />
              </div>
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
    selectedProject: shape({
      id: string.isRequired, // mlreef id
      gid: number.isRequired, // gitlab id
    }).isRequired,
  }).isRequired,
  history: shape({}).isRequired,
  actions: shape({
    setIsLoading: func.isRequired,
  }).isRequired,
  algorithms: arrayOf(shape({})).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    algorithms: state.processors.algorithms,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      ...jobsActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentsOverview);

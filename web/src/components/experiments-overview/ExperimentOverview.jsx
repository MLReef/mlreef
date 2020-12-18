import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  shape, string, number, func, arrayOf,
} from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import AuthWrapper from 'components/AuthWrapper';
import * as jobsActions from 'store/actions/jobsActions';
import * as userActions from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import ExperimentCard from './experimentCard';
import emptyLogo from '../../images/experiments_empty-01.png';
import experimentActions from './ExperimentActions';

export const buttons = [
  'All',
  'Running',
  'Completed',
  'Failed',
  'Canceled',
];

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
    experimentActions.getAndSortExperimentsInfo(id, gid)
      .then((experimentsClassified) => this.setState({
        experiments: experimentsClassified,
        all: experimentsClassified,
      }))
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
      experiments = all.filter((exp) => exp.status?.toLowerCase() === e.target.id);
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
      projects: {
        selectedProject: {
          namespace, slug,
        },
      },
    } = this.props;

    const customCrumbs = [
      {
        name: 'Experiments',
        href: `/${namespace}/${slug}/-/experiments`,
      },
    ];

    const areThereExperimentsToShow = all
      .map((expClass) => expClass.values.length).reduce((a, b) => a + b) !== 0;
    return (
      <>
        <Navbar />
        <ProjectContainer
          activeFeature="experiments"
          viewName="Experiments"
          breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
        />
        {areThereExperimentsToShow ? (
          <div className="main-content">
            {selectedExperiment === null && (
            <>
              <div id="buttons-container" className="d-flex">
                {buttons.map((name) => (
                  <button
                    id={name.toLowerCase()}
                    type="button"
                    className="btn btn-switch"
                    onClick={this.handleButtonsClick}
                  >
                    {name}
                  </button>
                ))}
                <AuthWrapper minRole={30} norender>
                  <button
                    id="new-experiment"
                    type="button"
                    className="btn btn-primary"
                    onClick={() => history.push(`/${namespace}/${slug}/-/experiments/new`)}
                  >
                    New experiment
                  </button>
                </AuthWrapper>
              </div>
            </>
            )}
            {selectedExperiment === null && experiments
              .map((experimentClassification) => experimentClassification.values.length > 0 && (
              <ExperimentCard
                projectNamespace={namespace}
                projectSlug={slug}
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
              <AuthWrapper minRole={30}>
                <button
                  id="new-experiment"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => history.push(`/${namespace}/${slug}/-/experiments/new`)}
                  >
                  Start an experiment
                </button>
              </AuthWrapper>
            </div>
          </div>
        )}
        <br />
        <br />

      </>
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

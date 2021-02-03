import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid/v1';
import {
  shape, string, number, func, arrayOf,
} from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
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

const ExperimentsOverview = (props) => {
  const {
    history,
    actions,
    match: { params: { namespace, slug } },
  } = props;

  const [all, setAll] = useState([{ values: [] }]);
  const [experiments, setExperiments] = useState([{ values: [] }]);

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const {
    id,
    gid,
    defaultBranch,
  } = selectedProject;

  useEffect(() => {
    actions.setIsLoading(true);
    if (id) {
      experimentActions.getAndSortExperimentsInfo(id, gid)
        .then((experimentsClassified) => {
          setExperiments(experimentsClassified);
          setAll(experimentsClassified);
        })
        .catch(() => toastr.error('Error', 'Could not fetch the latest experiments'))
        .finally(() => actions.setIsLoading(false));
    }
  }, [id]);

  const handleButtonsClick = (e) => {
    if (e.target.parentNode) {
      e.target.parentNode.childNodes.forEach((childNode) => {
        if (childNode.id !== e.target.id) {
          childNode.classList.remove('active');
        }
      });
      e.target.classList.add('active');
    }

    let exps = all;
    if (e.target.id !== 'all') {
      exps = all.filter((exp) => exp.status?.toLowerCase() === e.target.id);
    }

    setExperiments(exps);
  };

  const customCrumbs = [
    {
      name: 'Experiments',
      href: `/${namespace}/${slug}/-/experiments`,
    },
  ];

  const areThereExperimentsToShow = all
    .map((expClass) => expClass.values.length).reduce((a, b) => a + b) !== 0;

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }
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
          <>
            <div id="buttons-container" className="d-flex">
              {buttons.map((name) => (
                <button
                  id={name.toLowerCase()}
                  type="button"
                  className="btn btn-switch"
                  onClick={handleButtonsClick}
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
          {experiments
            .map((experimentClassification) => experimentClassification.values.length > 0 && (
              <ExperimentCard
                projectNamespace={namespace}
                projectSlug={slug}
                key={uuidv1()}
                projectId={gid}
                defaultBranch={defaultBranch}
                currentState={experimentClassification.status}
                experiments={experimentClassification.values}
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
};

ExperimentsOverview.propTypes = {
  match: shape({ params: shape({ namespace: string, slug: string }) }).isRequired,
  history: shape({}).isRequired,
  actions: shape({
    setIsLoading: func.isRequired,
  }).isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      ...jobsActions,
    }, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(ExperimentsOverview);

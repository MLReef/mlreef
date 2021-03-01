import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import {
  shape, string, func, bool,
} from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import hooks from 'customHooks/useSelectedProject';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import AuthWrapper from 'components/AuthWrapper';
import * as jobsActions from 'store/actions/jobsActions';
import * as userActions from 'store/actions/userActions';
import { fireModal } from 'store/actions/actionModalActions';
import ExperimentsApi from 'apis/experimentApi';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi.ts';
import ExperimentTable from 'components/commons/ExperimentTable';
// import experimentsDemo from 'components/commons/ExperimentTable/stories/experimentsDemo.json';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import emptyLogo from '../../images/experiments_empty-01.png';
import experimentActions from './ExperimentActions';

export const buttons = [
  'All',
  'Running',
  'Completed',
  'Failed',
  'Canceled',
];

const experimentApi = new ExperimentsApi();
const gitlabApi = new GitlabPipelinesApi();

const ExperimentsOverview = (props) => {
  const {
    history,
    actions,
    isLoading,
    match: { params: { namespace, slug } },
  } = props;

  const [experiments, setExperiments] = useState([]);

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const {
    id,
    gid,
  } = selectedProject;

  const fetchExperiments = useCallback(
    () => {
      if (!id) return Promise.resolve();

      actions.setIsLoading(true);

      return experimentActions.getAndSortExperimentsInfo(id, gid, { skipClassify: true })
        .then(setExperiments)
        .finally(() => actions.setIsLoading(false));
    },
    [id, gid, actions, setExperiments],
  );

  const deleteExperiment = useCallback(
    (experiment) => experimentApi
      .delete(id, experiment.id)
      .catch(() => toastr.error('Error', `Deleting ${experiment.name} failed.`)),
    [id],
  );

  const stopExperiment = useCallback(
    (experiment) => gitlabApi
      .abortGitlabPipelines(gid, experiment.pipelineJobInfo.id)
      .then(() => experimentApi.cancelExperiment(id, experiment.id))
      .catch(() => toastr.error('Error', `Aborting ${experiment.name} experiment failed.`)),
    [id, gid],
  );

  const handleDeleteExperiments = useCallback(
    (ids) => {
      const exps = ids.map((i) => experiments.find((exp) => exp.id === i));

      actions.fireModal({
        title: 'Delete experiments?',
        type: 'danger',
        closable: true,
        align: null,
        content: (
          <section className="experiments-overview-delete-modal">
            <div id="question-for-delete-exp">
              Are you sure you want to delete the experiments:
              <ul className="experiments-overview-delete-modal-list">
                {exps.map((exp) => (
                  <li key={exp.id} className="experiments-overview-delete-modal-list-item">
                    <b className="mr-3">
                      {exp.name.replace('experiment/', '')}
                    </b>
                    <span className={cx('status', exp.status)}>
                      {`(${exp.status})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ),
        onPositive: () => Promise.all(exps.map(deleteExperiment))
          .then(() => {
            toastr.success('Success', 'Experiments deleted');
            fetchExperiments();
          }),
      });
    },
    [experiments, actions, fetchExperiments, deleteExperiment],
  );

  const handleStopExperiments = useCallback(
    (ids) => {
      const exps = ids.map((i) => experiments.find((exp) => exp.id === i));

      actions.fireModal({
        title: 'Abort experiments?',
        type: 'danger',
        closable: true,
        align: null,
        content: (
          <section className="experiments-overview-delete-modal">
            <div id="question-to-abort">
              Are you sure you want to abort the experiments:
              <ul className="experiments-overview-delete-modal-list">
                {exps.map((exp) => (
                  <li key={exp.id} className="experiments-overview-delete-modal-list-item">
                    <b className="mr-3">
                      {exp.name.replace('experiment/', '')}
                    </b>
                    <span className={cx('status', exp.status)}>
                      {`(${exp.status})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ),
        onPositive: () => Promise.all(exps.map(stopExperiment))
          .then(() => {
            toastr.success('Success', 'Pipelines aborted');
            fetchExperiments();
          }),
      });
    },
    [experiments, actions, fetchExperiments, stopExperiment],
  );

  useEffect(() => {
    actions.setIsLoading(true);
    fetchExperiments();
  }, [id, actions, fetchExperiments]);

  const customCrumbs = [
    {
      name: 'Experiments',
      href: `/${namespace}/${slug}/-/experiments`,
    },
  ];

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
      {experiments.length > 0 && (
        <div className="main-content mb-5">
          <AuthWrapper minRole={30} norender>
            <div className="d-flex mt-3">
              <button
                id="new-experiment"
                type="button"
                className="btn btn-primary ml-auto"
                onClick={() => history.push(`/${namespace}/${slug}/-/experiments/new`)}
              >
                New experiment
              </button>
            </div>
          </AuthWrapper>
          {experiments.length > 0 && (
            <ExperimentTable
              experiments={experiments}
              className="experiments-overview-experiment-table mb-4"
              onDeleteExperiments={handleDeleteExperiments}
              onStopExperiments={handleStopExperiments}
              onUpdateExperiments={fetchExperiments}
            />
          )}
        </div>
      )}
      {experiments.length === 0 && !isLoading && (
        <div className="main-content">
          <div className="epmty-experiment-logo">
            <img src={emptyLogo} width="240" alt="Create an experiment" />
            <span>{'You don\'t have any experiment in your ML project'}</span>
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
  isLoading: bool.isRequired,
  actions: shape({
    setIsLoading: func.isRequired,
  }).isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
      ...jobsActions,
      fireModal,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    isLoading: state.globalMarker?.isLoading,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentsOverview);

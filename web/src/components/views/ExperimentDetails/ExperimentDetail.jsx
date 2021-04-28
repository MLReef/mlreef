import React, { useState, useEffect, useMemo } from 'react';
import { toastr } from 'react-redux-toastr';
import { MLoadingSpinnerContainer } from 'components/ui/MLoadingSpinner';
import {
  shape,
  string,
} from 'prop-types';
import hooks from 'customHooks/useSelectedProject';
import './ExperimentDetail.scss';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import JobLog from 'components/commons/JobLog';
import Navbar from 'components/navbar/navbar';
import ProjectContainer from 'components/projectContainer';
import DetailsSummary from './MenuOptions/DetailSummary';
import Files from './MenuOptions/ExperimentArtifacts';
import actions from './actions';

export const ExperimentDetails = (props) => {
  const [experiment, setExperiment] = useState({});
  const [jobs, setJobs] = useState([]);
  const {
    match: { params: { namespace, slug, experimentId } },
    history,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const {
    id,
    gid,
    name,
    gitlab,
  } = selectedProject;

  const userKind = gitlab?.namespace?.kind;
  const userParameters = experiment?.processing?.parameters;
  const { pipeline_job_info: pipelineInfo } = experiment;
  const experimentName = experiment.name;
  const uniqueName = experimentName && experimentName.split('/')[1];
  const experimentJob = jobs.filter((job) => job.ref === experiment.name)[0];

  useEffect(() => {
    if (id && experimentId) {
      actions.getExperimentDetails(id, experimentId)
        .then((res) => setExperiment(res))
        .catch(() => toastr.error('Error', 'Could not fetch the experiment'));
    }
  }, [id, experimentId]);

  useEffect(() => {
    if (pipelineInfo?.id) {
      actions.getJobsByPipeline(gid, pipelineInfo.id)
        .then((js) => {
          setJobs(js);
        })
        .catch((err) => toastr.error('Error', err.message));
    }
  }, [pipelineInfo]);

  const breadcrumbs = useMemo(
    () => [
      {
        name: namespace,
        href: userKind === 'group' ? `/groups/${namespace}` : `/${namespace}`,
      },
      {
        name,
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Experiments',
        href: `/${namespace}/${slug}/-/experiments`,
      },
      {
        name: uniqueName,
      },
    ],
    [namespace, slug, name, uniqueName, userKind],
  );

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="experiments"
        breadcrumbs={breadcrumbs}
      />
      <div className="main-content mt-4">
        <MSimpleTabs
          vertical
          pills
          sections={[
            {
              label: 'Details',
              content: experimentJob && (
                <DetailsSummary
                  projectNamespace={namespace}
                  projectSlug={slug}
                  projectId={gid}
                  expId={experimentId}
                  dataOperatorsExecuted={experiment.processing}
                  experimentName={uniqueName}
                  parameters={userParameters}
                  pipelineInfo={pipelineInfo}
                  history={history}
                />
              ),
              defaultActive: true,
            },
            {
              label: 'Training',
              content: experimentJob && (
                <JobLog
                  projectId={parseInt(gid, 10)}
                  currentState={experimentJob && experimentJob.status}
                  job={experimentJob}
                />
              ),
            },
            {
              label: 'Files',
              content: gid && experimentJob && (
                <Files projectId={gid} job={experimentJob} />
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

ExperimentDetails.propTypes = {
  match: shape({
    params: shape({
      experimentId: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({}).isRequired,
};

export default ExperimentDetails;

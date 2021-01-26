import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes, { arrayOf, bool, func, number, shape } from 'prop-types';
import Navbar from 'components/navbar/navbar';
import dayjs from 'dayjs';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import MPipes from 'components/ui/MPipes';
import { getTimeCreatedAgo, parseDurationInSeconds } from 'functions/dataParserHelpers';
import JobLog from 'components/ExperimentDetails/MenuOptions/jobLog';
import { suscribeRT } from 'functions/apiCalls';
import { toastr } from 'react-redux-toastr';
import ParameterList from './PublishProcessViewParameterList';
import RequirementList from './PublishProcessViewRequirementList';
import './PublishProcessView.scss';
import { parameters, requeriments } from './info';
import publishingActions from './publishingActionsAndFuncs';

const PublishProcessView = (props) => {
  const {
    match: {
      params: {
        namespace,
        slug,
        pipelineId,
      },
    },
    project,
  } = props;

  const [sortedJobs, setSortedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const breadcrumbs = [
    {
      name: namespace,
      href: '/',
    },
    {
      name: slug,
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Publishing',
      href: `/${namespace}/${slug}/-/publishing`,
    },
    {
      name: 'Processing',
    },
  ];

  const fetch = useCallback(
    () => {
      setIsFetching(true);
      publishingActions.getPipelineJobs(project.gid, pipelineId)
        .then(setSortedJobs)
        .catch((err) => toastr.error('Error:', err?.message))
        .finally(() => setIsFetching(false));
    },
    [project.gid, pipelineId],
  );

  useEffect(() => {
    const unsuscribeServices = suscribeRT({ timeout: 60000 })(fetch);

    return unsuscribeServices;
  }, [fetch]);

  return (
    <div className="publishing-process-view">
      <Navbar />
      <MBreadcrumb className="bg-light px-3" items={breadcrumbs} />
      <div className="publishing-process-view pt-4">
        <div className="publishing-process-view-content">
          <MSimpleTabs
            vertical
            pills
            sections={[
              {
                label: 'Overview',
                content: selectedJob ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-switch ml-4"
                      onClick={() => setSelectedJob(null)}
                      style={{ padding: '0.25rem 1.75rem' }}
                    >
                      <i className="fas fa-chevron-left" />
                    </button>
                    <JobLog projectId={project.gid} job={selectedJob} />
                  </>
                ) : (
                  <PublishingOverviewContent
                    isFetching={isFetching}
                    sortedJobs={sortedJobs}
                    setSelectedJob={setSelectedJob}
                  />
                ),
                defaultActive: true,
              },
              {
                label: 'Environment',
                disabled: true,
                content: (
                  <div>TODO</div>
                ),
              },
              {
                label: 'Parameters',
                disabled: true,
                content: (
                  <div>
                    <h4 className="mt-0 t-dark">
                      Parameters found for model_name
                    </h4>
                    <ParameterList parameters={parameters} />
                  </div>
                ),
              },
              {
                label: 'Requirements',
                disabled: true,
                content: (
                  <div>
                    <h4 className="mt-0 t-dark">
                      2 dependencies found in the requirements.txt file
                    </h4>
                    <RequirementList requeriments={requeriments} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

function mapStateToProps({ projects: { selectedProject: project } }) {
  return {
    project,
  };
}

PublishProcessView.defaultProps = {

};

PublishProcessView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  project: shape({
    gid: number.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps)(PublishProcessView);

const PublishingOverviewContent = (props) => {
  const {
    isFetching,
    sortedJobs,
    setSelectedJob,
  } = props;

  const pipeline = sortedJobs[0]?.jobs[0]?.pipeline;
  const userAvatar = sortedJobs[0]?.jobs[0]?.user;
  const pipelineTriggeredAgoTime = getTimeCreatedAgo(pipeline?.created_at, new Date());
  const totalDuration = sortedJobs[0]?.jobs?.map((j) => j.duration).reduce((a, b) => a + b);

  if (!pipeline && !isFetching) {
    return <h3 className="no-info-found">No publication info found</h3>;
  }

  return (
    <div className="publishing-process-view-content-overview">
      <div className="publishing-process-view-content-overview-title-div">
        <h3>Publishing pipelines</h3>
        <p>See the current pipelines and their status here</p>
      </div>
      <div className="publishing-process-view-content-overview-basic-info-1">
        <p>
          Publishing pipeline:
          <b>
            {`#${pipeline?.id}`}
          </b>
        </p>
        <p>{`triggered ${pipelineTriggeredAgoTime} ago by `}</p>
        <div
          style={{ backgroundImage: `url(${userAvatar?.avatar_url})` }}
          className="avatar-circle bg-image bg-cover"
        />
        <p>{userAvatar?.username}</p>
      </div>
      <div className="publishing-process-view-content-overview-basic-info-2">
        <p>Started:</p>
        <p><b>{dayjs(pipeline?.created_at).format('DD/MM/YYYY - HH:mm')}</b></p>
      </div>
      <div className="publishing-process-view-content-overview-basic-info-3">
        <p>Duration:</p>
        <p>
          <b>
            {totalDuration
              ? parseDurationInSeconds(totalDuration)
              : '---'}
          </b>
        </p>
      </div>
      <br />
      {pipeline ? (
        <MPipes
          stages={sortedJobs}
          status={pipeline.status}
          setSelectedJob={setSelectedJob}
        />
      ) : (
        <div className="d-flex mb-4" style={{ justifyContent: 'center' }}>
          <MLoadingSpinner />
        </div>
      )}
    </div>
  );
};

PublishingOverviewContent.propTypes = {
  isFetching: bool.isRequired,
  sortedJobs: arrayOf(shape({})),
  setSelectedJob: func.isRequired,
};

PublishingOverviewContent.defaultProps = {
  sortedJobs: [],
};

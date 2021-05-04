import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  string,
} from 'prop-types';
import moment from 'moment';
import { suscribeRT } from 'functions/apiCalls';
import greyLogo from 'images/icon_grey-01.png';
import './jobs.scss';
import JobsApi from 'apis/JobsApi';
import DataPipelineApi from 'apis/DataPipelineApi';
import { determineJobClass } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import hooks from 'customHooks/useSelectedProject';
import { toCamelCase } from 'functions/helpers';

const timeout = 60 * 1000;

const statusColor = {
  running: '#2dbe91',
  success: '#2dbe91',
  failed: '#f2261d',
  canceled: '#f2261d',
  pending: '#ebba45',
};

const dataPipeApi = new DataPipelineApi();
const jobsApi = new JobsApi();

const Jobs = (props) => {
  const { namespace, slug } = props;
  const [jobList, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [backendPipes, setBackendPipes] = useState([]);

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { id, gid } = selectedProject;

  const fetchJobs = useCallback(() => {
    dataPipeApi.getProjectPipelines(id)
      .then((backendPipelines) => setBackendPipes(backendPipelines));

    let query = '';
    if (filterStatus !== 'all') {
      query = `?scope[]=${filterStatus}`;
    }
    jobsApi.getPerProject(gid, query).then((res) => {
      setJobs(res);
    })
      .catch(() => toastr.error('Error', 'Could not retrieve all the jobs'));
  }, [id, gid, filterStatus, setBackendPipes, setJobs]);

  useEffect(() => suscribeRT({ timeout })(fetchJobs), [fetchJobs]);

  const filterButtons = useMemo(() => [
    'all',
    'running',
    'success',
    'failed',
    'canceled',
  ].map((status) => (
    <button
      id={status}
      type="button"
      className={`btn btn-basic-dark  ml-3 ${filterStatus === status ? 'active' : ''}`}
      onClick={() => setFilterStatus(status)}
    >
      {toCamelCase(status)}
    </button>
  )), [filterStatus]);

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      <div className="job-container">
        <div>
          <h1 className="job-container-title">Jobs</h1>
        </div>
        <div className="my-3 mx-0">
          {filterButtons}
        </div>
        <table className="job-table">
          <thead className="job-table-head">
            <tr className="head-tr">
              <th>Status</th>
              <th>Job</th>
              <th>Class</th>
              <th>Pipeline</th>
              <th>Timing</th>
            </tr>
          </thead>
          {jobList.length === 0 ? (
            <tbody>
              <tr>
                <td />
                <td />
                <td style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'var(--lessWhite)',
                }}
                >
                  <img src={greyLogo} alt="empty" width="45" />
                  <span>No Jobs to show</span>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="job-table-body">
              {jobList.map((job, index) => {
                const selectedPipe = backendPipes
                  ?.filter((pipe) => job?.ref.includes(pipe.name))[0];
                const jobClass = selectedPipe?.pipeline_type;
                const timeDuration = job.duration !== null && moment({}).startOf('day').seconds(job.duration).format('HH:mm:ss');
                return (
                  <tr className="p-3" key={index.toString()}>
                    <td className="job-status p-3">
                      <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                        <span style={{ color: statusColor[job.status], fontWeight: 'bold' }}>
                          {job.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                        {`#${job.id}`}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/${namespace}/${slug}/insights/-/jobs/${job.id}`}>
                        {determineJobClass(jobClass)}
                      </Link>
                    </td>
                    <td className="job-pipeline-number p-3">
                      {`#${job.pipeline.id} by `}
                      <a href={`/${job.user.name}`}>
                        <img className="ml-2" width="20" src={job.user.avatar_url} alt="avatar" />
                      </a>
                    </td>
                    <td className="duration">
                      <p className="p-0 m-0">
                        {job.duration !== null && (
                        <>
                          <img src="https://gitlab.com/mlreef/frontend/uploads/d0bd85ce84f0a8754dbf852871a04a15/clock.png" width="12" alt="" />
                          {timeDuration}
                        </>
                        )}
                      </p>
                      <p className="p-0 m-0">
                        <img src="https://gitlab.com/mlreef/frontend/uploads/24a7b38a430ed0e01c381ba037613d1d/Calender.png" width="12" alt="" />
                        {`${getTimeCreatedAgo(job.created_at, new Date())} ago`}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};

Jobs.propTypes = {
  namespace: string.isRequired,
  slug: string.isRequired,
};

export default Jobs;

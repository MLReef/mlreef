import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import dayjs from 'dayjs';
import durationModule from 'dayjs/plugin/duration';
import { toastr } from 'react-redux-toastr';
import { Link } from 'react-router-dom';
import { parseLine } from 'components/views/ExperimentDetails/actions';
import JobsApi from 'apis/JobsApi';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import './JobLog.scss';

dayjs.extend(durationModule);

const jobsApi = new JobsApi();

const JobLog = (props) => {
  const {
    className,
    projectId: gid,
    job,
  } = props;

  const {
    created_at: createdAt,
    user,
    duration,
    runner,
    status,
  } = job;

  const [jobLog, setJobLog] = useState(null);

  const handleResponse = useCallback(
    (res) => res.blob()
      .then((content) => {
        const reader = new FileReader();
        if (content.size === 0) {
          toastr.info('Info', 'No log has been generated yet');
          return;
        }
        reader.onload = () => {
          let finalLog = [];
          try {
            const b64 = reader.result.replace(/^data:.+;base64,/, '');
            finalLog = atob(b64).split('\n');
          } catch (error) {
            toastr.error('Error', error.message);
          } finally {
            setJobLog(finalLog);
          }
        };
        reader.readAsDataURL(content);
      }),
    [setJobLog],
  );

  const fetchJobLog = useCallback(
    () => {
      jobsApi.getLog(gid, job.id)
        .then((res) => res.ok ? handleResponse(res) : Promise.reject(res))
        .catch(() => toastr.error('Error', 'The job not found or error parsing it'));
    },
    [gid, job, handleResponse],
  );

  useEffect(() => { fetchJobLog(); }, [fetchJobLog]);

  return (
    <div className={cx('job-log', className)}>
      <div id="basic-information-container" className="flexible-div-basic-info-cont">
        <div className="job-log-header">
          <div data-testid="created" className="job-log-header-time">
            <strong data-testid="job">
              {`Job # ${job.id}`}
            </strong>
            {` triggered ${dayjs(createdAt).fromNow()} by`}
            <Link className="job-log-user" to={`/${user.name}`}>
              <img className="job-log-user-avatar" src={user.avatar_url} alt={user.name} />
              <strong className="job-log-user-name">{user.name}</strong>
            </Link>
          </div>
          <div className={cx('job-log-header-status', status)}>
            {status}
          </div>
        </div>
        <div className="job-log-info-extra">
          <div className="job-log-info-extra-left">
            <div className="job-log-header-info-extra-duration mb-2">
              <span className="job-log-info-extra-label">Duration:</span>
              <span data-testid="duration">
                {dayjs.duration(duration, 'seconds').format('H[h] m[m] s[s]')}
              </span>
            </div>
            {runner && (
              <div className="job-log-header-info-extra-runner mb-2">
                <span className="job-log-info-extra-label">Runner:</span>
                <strong data-testid="runner">
                  {`${runner.description} #(${runner.id})`}
                </strong>
              </div>
            )}
          </div>
          <div className="job-log-info-extra-right">
            <div className="job-log-header-info-extra-pipeline mb-2">
              <span className="mr-2">Pipeline:</span>
              <strong data-testid="pipeline">{` #${job.pipeline.id}`}</strong>
            </div>
          </div>
        </div>
        <div className="mt-3 w-100" style={{ backgroundColor: '#111111' }}>
          <div id="top-job-log-div">
            <p style={{ margin: 0 }} />
          </div>
          {jobLog
            ? jobLog.map((line, index) => {
              if (line.length === 0) return null;

              const { classList, finalLine } = parseLine(line);
              return (
                <div className="log-line" key={`${index.toString()} ${line}`}>
                  <div className="number-span-container">
                    <span style={{ color: 'gray' }}>{index}</span>
                  </div>
                  <span className={classList}>{finalLine}</span>
                </div>
              );
            }) : (
              <div className="d-flex p-1" style={{ minHeight: '3rem', justifyContent: 'center' }}>
                <MLoadingSpinner />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

JobLog.defaultProps = {
  className: '',
};

JobLog.propTypes = {
  projectId: PropTypes.number.isRequired,
  job: PropTypes.shape({
    id: PropTypes.number.isRequired,
    duration: PropTypes.number,
    created_at: PropTypes.string.isRequired,
    user: PropTypes.shape({
      avatar_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    status: PropTypes.string.isRequired,
    runner: PropTypes.shape({
      description: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    }).isRequired,
    pipeline: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  className: PropTypes.string,
};

export default JobLog;

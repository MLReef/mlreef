import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { number, shape, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import { SUCCESS, RUNNING, PENDING } from 'dataTypes';
import { getTimeCreatedAgo, parseDurationInSeconds } from 'functions/dataParserHelpers';
import { determineJobClass } from 'functions/pipeLinesHelpers';
import './jobLog.scss';
import jobActions, { parseLine } from '../actions';

const JobLog = (props) => {
  const { projectId, selectedProject: { id, namespace, slug }, job } = props;
  const [jobLog, setJobLog] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [duration, setDuration] = useState(0);
  const parsedDuration = parseDurationInSeconds(duration);
  const {
    created_at: createdAt,
    user,
    runner,
    status: currentState,
  } = job;

  const jobTimeCreatedAgo = getTimeCreatedAgo(createdAt, new Date());

  const mounted = useRef(false);
  const handleResponse = (res) => res
    .blob()
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
          if (!mounted.current) setJobLog(finalLog);
        }
      };
      reader.readAsDataURL(content);
    });

  useEffect(() => {
    jobActions.getProjectPipelines(id)
      .then(([backendPipelines, experimentList]) => {
        if (!mounted.current) setAllJobs([...backendPipelines, ...experimentList]);
      })
      .catch(() => toastr.error('Error', 'To get pipelines info was not possible'));

    jobActions.getJobInfo(projectId, job.id).then((res) => {
      if (!mounted.current) setDuration(res.duration);
    }).catch(() => toastr.error('Error', 'Error getting job info'));

    jobActions.getJobLog(projectId, job.id)
      .then((res) => res.ok ? handleResponse(res) : Promise.reject(res))
      .catch(() => toastr.error('Error', 'The job not found or error parsing it'));

    return () => {
      mounted.current = true;
    };
  }, [projectId, job.id, id]);

  let jobStatus = (
    <b style={{
      color: (currentState === SUCCESS)
        ? '#38b797'
        : 'red',
    }}
    >
      {currentState}
    </b>
  );
  if (currentState === RUNNING) {
    jobStatus = (
      <b style={{ color: '#2DB391' }}>
        {currentState}
      </b>
    );
  } else if (currentState === PENDING) {
    jobStatus = (
      <b style={{ color: '#E99444' }}>
        {currentState}
      </b>
    );
  }

  const selectedPipe = allJobs
    ?.filter((pipe) => job?.ref.includes(pipe.name))[0];
  const jobClass = selectedPipe?.pipeline_type;
  const jobOutput = job.ref.split('/')[1];

  const linkOutputToRoute = (type) => {
    let linkType = `/${namespace}/${slug}/-/experiments/${selectedPipe?.id}`;
    if (type === 'DATA') linkType = `/${namespace}/${slug}/-/datasets/${selectedPipe?.id}`;
    else if (type === 'VISUALIZATION') linkType = `/${namespace}/${slug}/-/visualizations/${selectedPipe?.id}`;

    return linkType;
  };

  return (
    <div id="job-information-container">
      <div id="basic-information-container" className="flexible-div-basic-info-cont">
        <div id="number-and-time-ago-cont">
          <p style={{ marginRight: '0.5em' }}>
            <b>
              Job #
              {job.id}
            </b>
            {' '}
            triggered
            {' '}
            {jobTimeCreatedAgo}
            {' '}
            ago by
          </p>
          <a className="d-flex" href={`/${user.name}`}>
            <img width="32" height="32" className="avatar-circle mr-1 mt-2" src={user.avatar_url} alt={user.name} />
            <p><b>{user.name}</b></p>
          </a>
        </div>
        <p style={{
          color: (job.status === 'success' || job.status === 'running')
            ? '#38b797'
            : 'red',
        }}
        >
          <b>{jobStatus}</b>
        </p>
      </div>
      <div className="w-100">
        <div id="additional-info-job" className="flexible-div-basic-info-cont">
          <div className="job-table">
            <div className="job-table-header">
              <p className="job-table-content">Duration: &nbsp;</p>
              <p className="job-table-content">{parsedDuration}</p>
            </div>
            <div className="job-table-header">
              <p className="job-table-content">Class:</p>
              <p className="job-table-content"><b>{determineJobClass(jobClass)}</b></p>
            </div>
            <div className="job-table-header">
              <p className="job-table-content">Output:</p>
              <p className="job-table-content">
                <b>
                  <Link className="t-info" to={linkOutputToRoute(jobClass)}>{jobOutput}</Link>
                </b>
              </p>
            </div>
            {runner
              && (
              <div className="job-table-header">
                <p className="job-table-content mr-2 m-0">Runner: </p>
                <p className="job-table-content m-0 t-bold">
                  {runner.description}
                  {' '}
                  (#
                  {runner.id}
                  )
                </p>
              </div>
              )}
          </div>
          <p>Pipeline: &nbsp;</p>
          <p>
            <b>
              #
              {job.pipeline.id}
            </b>
          </p>
        </div>
      </div>
      <div className="mt-3 w-100" style={{ backgroundColor: '#111111' }}>
        <div id="top-job-log-div">
          <p style={{ margin: 0 }} />
        </div>
        {jobLog
          ? jobLog.map((line, index) => {
            if (line.length === 0) {
              return null;
            }
            const { classList, finalLine } = parseLine(line);
            return (
              <div className="log-line" key={`${index.toString()} ${line}`}>
                <div className="number-span-container">
                  <span style={{ color: 'gray' }}>{index}</span>
                </div>
                <span className={classList}>
                  {finalLine}
                </span>
              </div>
            );
          }) : (
            <div className="d-flex p-1" style={{ minHeight: '3rem', justifyContent: 'center' }}>
              <MLoadingSpinner />
            </div>
          )}
      </div>
    </div>
  );
};

JobLog.propTypes = {
  projectId: number.isRequired,
  selectedProject: shape({
    id: string.isRequired,
  }).isRequired,
  job: shape({
    duration: number.isRequired,
    created_at: string.isRequired,
    user: shape({
      avatar_url: string.isRequired,
      name: string.isRequired,
    }).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(JobLog);

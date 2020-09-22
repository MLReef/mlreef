import React, { useEffect, useState } from 'react';

import { number, shape, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import { SUCCESS, RUNNING, PENDING } from 'dataTypes';
import { getTimeCreatedAgo, parseDurationInSeconds } from '../../../functions/dataParserHelpers';
import './jobLog.css';
import JobsApi from '../../../apis/JobsApi.ts';

const jobsApi = new JobsApi();

const JobLog = ({
  projectId,
  job,
}) => {
  const [jobLog, setJobLog] = useState(null);
  const [duration, setDuration] = useState(0);
  const parsedDuration = parseDurationInSeconds(duration);
  const {
    created_at: createdAt,
    user,
    runner,
    status: currentState,
  } = job;

  const jobTimeCreatedAgo = getTimeCreatedAgo(createdAt, new Date());

  function parseLine(line) {
    let classList = 'line-span';
    let finalLine = line;
    if (finalLine.includes('\u001b[31;1mERROR:')) {
      const errorIndex = finalLine.indexOf('[31;1mERROR:');
      finalLine = finalLine.substr(errorIndex, finalLine.length);
      classList = `${classList} red-letter`;
    } else if (finalLine.includes('\u001b[32;1m')) {
      const errorIndex = finalLine.indexOf('32;1m');
      finalLine = finalLine.substr(errorIndex, finalLine.length);
      classList = `${classList} green-letter`;
    }

    finalLine = finalLine
      .replace(' ', '  ')
      .replace('[31;1m', '')
      .replace('32;1m', '')
      .replace('\u001b[0K', '')
      .replace('\u001b[0;m', '');

    return (
      <span className={classList}>
        {finalLine}
      </span>
    );
  }

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
          setJobLog(finalLog);
        } catch (error) {
          toastr.error('Error', 'Something went wrong reading the log');
          setJobLog(finalLog);
        }
      };
      reader.readAsDataURL(content);
    });

  useEffect(() => {
    jobsApi.getJobById(projectId, job.id)
      .then((res) => setDuration(res.duration))
      .then(() => jobsApi.getLog(projectId, job.id))
      .then((res) => res.ok ? handleResponse(res) : Promise.reject(res))
      .catch(() => toastr.error('Error', 'The job not found or error parsing it'));
  }, [projectId, job.id]);

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
      <div style={{
        width: '100%',
      }}
      >
        <div id="additional-info-job" className="flexible-div-basic-info-cont">
          <div className="flexible-row">
            <p>Duration: &nbsp;</p>
            <p>{parsedDuration}</p>
          </div>
          <div className="flexible-row">
            <p>Experiment pipeline: &nbsp;</p>
            <p>
              <b>
                #
                {job.pipeline.id}
              </b>
            </p>
          </div>
        </div>
        {runner
        && (
        <div style={{ display: 'flex' }}>
          <p style={{ marginRight: '0.5em' }}>Runner: </p>
          <p style={{ fontWeight: '700' }}>
            {runner.description}
            {' '}
            (#
            {runner.id}
            )
          </p>
        </div>
        )}
      </div>
      <div style={{ width: '100%', backgroundColor: '#111111' }}>
        <div id="top-job-log-div">
          <p style={{ margin: 0 }} />
        </div>
        {jobLog
          ? jobLog.map((line, index) => {
            if (line.length === 0) {
              return null;
            }
            return (
              <div className="log-line" key={`${index.toString()} ${line}`}>
                <div className="number-span-container">
                  <span style={{ color: 'gray' }}>{index}</span>
                </div>
                {parseLine(line)}
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
  job: shape({
    duration: number.isRequired,
    created_at: string.isRequired,
    user: shape({
      avatar_url: string.isRequired,
      name: string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default JobLog;

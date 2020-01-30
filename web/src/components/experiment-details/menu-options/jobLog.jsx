import React, { useEffect, useState } from 'react';

import { number, shape, string } from 'prop-types';
import { toastr } from 'react-redux-toastr';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getTimeCreatedAgo, parseDurationInSeconds } from '../../../functions/dataParserHelpers';
import './jobLog.css';
import JobsApi from '../../../apis/JobsApi';

const JobLog = ({
  projectId,
  job,
}) => {
  const [jobLog, setJobLog] = useState(null);
  const parsedDuration = parseDurationInSeconds(job.duration);
  const { created_at, user, runner } = job;
  const jobTimeCreatedAgo = getTimeCreatedAgo(created_at, new Date());
  function parseLine(line) {
    let classList = 'line-span';
    let finalLine = line;
    if (finalLine.includes('\u001b[32;1m')) {
      finalLine = finalLine.substr(7, finalLine.length);
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
  useEffect(() => {
    JobsApi.getLog(projectId, job.id)
      .then(async (res) => {
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result.replace(/^data:.+;base64,/, '');
          const finalLog = atob(b64).split('\n');
          setJobLog(finalLog);
        };
        reader.readAsDataURL(blob);
      }).catch(() => {
        toastr.error('Error', 'The log could not be read');
      });
  }, [projectId, job.id]);
  return (
    <div id="job-information-container">
      <div id="basic-information-container" className="flexible-div">
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
          <div className="commit-pic-circle" style={{ margin: '0 0.5em 0 0' }}>
            <img src={user.avatar_url} alt={user.name} />
          </div>
          <p>{user.name}</p>
        </div>
        <p style={{
          color: (job.status === 'success' || job.status === 'running')
            ? '#38b797'
            : 'red',
        }}
        >
          <b>{job.status}</b>
        </p>
      </div>
      <div style={{
        width: '100%',
      }}
      >
        <div id="additional-info-job" className="flexible-div">
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
                <div style={{ display: 'flex', justifyContent: 'right', width: '1em' }}>
                  <span style={{ color: 'gray' }}>{index}</span>
                </div>
                {parseLine(line)}
              </div>
            );
          }) : (
            <div style={{ paddingLeft: '2.5em' }}>
              <CircularProgress size={30} />
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

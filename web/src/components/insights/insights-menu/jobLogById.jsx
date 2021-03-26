import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import { suscribeRT } from 'functions/apiCalls';
import JobLog from 'components/commons/JobLog';
import JobsApi from 'apis/JobsApi.ts';

const timeout = 20 * 1000;

const jobsApi = new JobsApi();

const JobLogById = (props) => {
  const { logId, projectId } = props;
  const [job, setJob] = useState();

  const done = job && ['failed', 'canceled', 'success'].includes(job.status);

  const fetchJob = useCallback(
    () => done ? Promise.resolve() : jobsApi.getJobById(projectId, logId)
      .then((res) => setJob(res))
      .catch(() => {
        toastr.error('Error', 'The job was not found');
      }),
    [projectId, logId, done],
  );

  useEffect(() => suscribeRT({ timeout })(fetchJob), [fetchJob]);

  return (
    <div style={{ width: '80%' }}>
      {job !== undefined && <JobLog projectId={projectId} job={job} />}
    </div>
  );
};

JobLogById.propTypes = {
  logId: PropTypes.number.isRequired,
  projectId: PropTypes.number.isRequired,
};

export default JobLogById;

import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import JobsApi from '../../../apis/JobsApi.ts';
import JobLog from '../../ExperimentDetails/MenuOptions/jobLog';

const jobsApi = new JobsApi();

const JobLogById = (props) => {
  const { logId, projectId } = props;
  const [job, setJob] = useState();

  useEffect(() => {
    jobsApi.getJobById(projectId, logId)
      .then((res) => setJob(res))
      .catch(() => {
        toastr.error('Error', 'The job was not found');
      })
  },[projectId, logId]);

  return (
    <div style={{ width: '80%' }}>
      {job !== undefined && <JobLog projectId={projectId} job={job} />}
    </div>
  )
};

export default JobLogById;

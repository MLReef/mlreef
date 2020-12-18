import JobsApi from 'apis/JobsApi.ts';
import { GET_JOBS } from '../actionTypes';

const jobsApi = new JobsApi();

export function setJobsSuccesfully(jobs) {
  return { type: GET_JOBS, jobs };
}

/**
 * get list of jobs per project to be persisted in redux state
 */
export function getJobsListPerProject(projectId) {
  return (dispatch) => jobsApi
    .getPerProject(projectId)
    .then(
      (jobs) => dispatch(
        setJobsSuccesfully(
          jobs,
        ),
      ),
    ).catch((err) => {
      throw err;
    });
}

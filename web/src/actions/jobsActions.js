import jobsApi from '../apis/JobsApi';
import { GET_JOBS } from './actionTypes';

/**
 * get list of jobs per project to be persisted in redux state
 */
export function getJobsListPerProject(projectId) {
  return (dispatch) => jobsApi
    .getPerProject(projectId)
    .then(
      (jobs) => dispatch(
        setJobsSuccesfully(
          jobs
        ),
      ),
    ).catch((err) => {
      throw err;
    });
}
  
export function setJobsSuccesfully(jobs) {
  return { type: GET_JOBS, jobs };
}
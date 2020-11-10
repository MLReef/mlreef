import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import JobsApi from 'apis/JobsApi';
import { handleResponse } from 'functions/helpers';

const gitlabPipelinesApi = new GitlabPipelinesApi();

const jobsApi = new JobsApi();

const sortJobs = (unsortedJobs) => Array.from(
  new Set(unsortedJobs.map((job) => job.stage)),
).map((stage) => ({
  label: stage,
  jobs: unsortedJobs.filter((job) => job.stage === stage),
}));

const getPipelineJobs = (
  projectId,
) => gitlabPipelinesApi.getPipesByProjectId(projectId)
  .then((pipes) => pipes.length > 0
    ? pipes[0]
    : null)
  .then((lastPipeline) => lastPipeline
    ? jobsApi.getJobsByPipelineId(projectId, lastPipeline.id)
      .then(handleResponse)
    : [])
  .then((unsortedJobs) => unsortedJobs.length > 0
    ? sortJobs(unsortedJobs)
    : []);

export default {
  getPipelineJobs,
  sortJobs,
};

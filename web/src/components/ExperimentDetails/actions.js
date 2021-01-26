import DataPiplineApi from 'apis/DataPipelineApi';
import ExperimentsApi from 'apis/experimentApi';
import JobsApi from 'apis/JobsApi';

const experimentApi = new ExperimentsApi();

const dataPipeApi = new DataPiplineApi();

const jobsApi = new JobsApi();

const getProjectPipelines = (id) => dataPipeApi.getProjectPipelines(id)
  .then(async (backendPipelines) => [backendPipelines, await experimentApi.getExperiments(id)]);

const getJobInfo = (projectId, jobId) => jobsApi.getJobById(projectId, jobId);

const getJobLog = (projectId, jobId) => jobsApi.getLog(projectId, jobId);


const getExperimentDetails = (backendId, experimentId) => experimentApi
  .getExperimentDetails(backendId, experimentId);

const getJobsPerProject = (projectId) => jobsApi.getPerProject(projectId);

export const parseLine = (line) => {
  let classList = 'line-span';
  let finalLine = line;
  if (finalLine.includes('\u001b[31;1mERROR:')) {
    const errorIndex = finalLine.indexOf('[31;1mERROR:');
    finalLine = finalLine.substr(errorIndex, finalLine.length);
    classList = `${classList} t-danger t-bold`;
  } else if (finalLine.includes('\u001b[32;1m')) {
    const errorIndex = finalLine.indexOf('32;1m');
    finalLine = finalLine.substr(errorIndex, finalLine.length);
    classList = `${classList} t-primary t-bold`;
  }

  finalLine = finalLine
    .replace(' ', '  ')
    .replace('[31;1m', '')
    .replace('32;1m', '')
    .replace('\u001b[0K', '')
    .replace('\u001b[0;m', '');

  return ({
    classList,
    finalLine,
  });
};

export default {
  getProjectPipelines,
  getJobInfo,
  getJobLog,
  getExperimentDetails,
  getJobsPerProject
};

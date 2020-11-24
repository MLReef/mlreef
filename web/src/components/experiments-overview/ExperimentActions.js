import CommitsApi from 'apis/CommitsApi';
import ExperimentsApi from 'apis/experimentApi';
import { plainToClass } from 'class-transformer';
import Experiment from 'domain/experiments/Experiment';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { classifyExperiments } from 'functions/pipeLinesHelpers';

const expApi = new ExperimentsApi();
const commitsApi = new CommitsApi();

const getExperiments = (id) => expApi.getExperiments(id)
  .then((exps) => exps.map(parseToCamelCase))
  .then((rawExperiments) => rawExperiments
    .filter((exp) => exp.pipelineJobInfo !== null)
    .map((exp) => (
      { ...exp, pipelineJobInfo: parseToCamelCase(exp.pipelineJobInfo) }
    )));

const getAndSortExperimentsInfo = (id, gid) => getExperiments(id)
  .then((exps) => exps.map(async (exp) => {
    const commitInfo = await commitsApi.getCommitDetails(gid, exp.pipelineJobInfo?.commitSha);
    return {
      ...exp,
      authorName: commitInfo.author_name,
      status: commitInfo.last_pipeline.status,
    };
  }))
  .then(async (promises) => {
    const experiments = await Promise.all(promises);
    const experimentsClassified = classifyExperiments(experiments);

    return experimentsClassified;
  });

export default {
  getAndSortExperimentsInfo,
  getExperiments,
  expApi,
};

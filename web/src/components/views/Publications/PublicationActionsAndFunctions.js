import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import {
  CANCELED, FAILED, PENDING, RUNNING, SUCCESS,
} from 'dataTypes';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { plainToClassFromExist } from 'class-transformer';
import Publication from 'domain/Publications/Publication';

const gitlabPipelinesApi = new GitlabPipelinesApi();

const projectApi = new ProjectGeneralInfoApi();

const mergeWithPromise = (gid, pubs = []) => pubs.map(async (p) => ({
  ...p,
  pipeline: await gitlabPipelinesApi.getPipesById(gid, p?.gitlabPipelineId)
}));


const getPiblicationsList = (projectId, gid) => projectApi.getPublications(projectId)
  .then((pub) => pub.content)
  .then((pipesAddInfo) => pipesAddInfo.map(parseToCamelCase))
  .then(async (publications) => {
    const resolvedArray = await Promise.all(mergeWithPromise(gid, publications));
    return plainToClassFromExist(
    Publication, resolvedArray, { excludeExtraneousValues: true }
  )});


const sortPipelines = (pipes) => [
  {
    status: PENDING,
    items: pipes.filter((p) => p.status === PENDING),
  },
  {
    status: RUNNING,
    items: pipes.filter((p) => p.status === RUNNING),
  },
  {
    status: FAILED,
    items: pipes.filter((p) => p.status === FAILED),
  },
  {
    status: 'finished',
    items: pipes.filter((p) => p.status === CANCELED
      || p.status === SUCCESS
      || p.status === FAILED),
  },
];

export default {
  getPiblicationsList,
  sortPipelines,
};

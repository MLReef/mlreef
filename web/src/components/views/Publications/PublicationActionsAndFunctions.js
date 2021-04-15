import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import {
  CANCELED, FAILED, PENDING, RUNNING, SUCCESS,
} from 'dataTypes';

const gitlabPipelinesApi = new GitlabPipelinesApi();

const getPipelinesAdditionalInformation = (gid, pipes) => Promise.all(
  pipes?.map((pipe) => gitlabPipelinesApi.getPipesById(gid, pipe?.id)),
).then((pipesAddInfo) => pipesAddInfo
  .map(parseToCamelCase)
  .map((parsed) => ({ ...parsed, user: parseToCamelCase(parsed.user) })));

const getColor = (status) => {
  switch (status) {
    case PENDING:
      return 'var(--warning)';
    case RUNNING:
      return 'var(--success)';
    case SUCCESS:
      return 'var(--success)';
    case CANCELED:
      return 'var(--dark)';
    case FAILED:
      return 'var(--danger)';
    default:
      return 'var(--info)';
  }
};

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
  getPipelinesAdditionalInformation,
  getColor,
  sortPipelines,
};

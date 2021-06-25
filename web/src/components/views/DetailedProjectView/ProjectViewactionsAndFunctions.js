import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { projectClassificationsProps } from 'dataTypes';

export const calculateColor = (project) => {
  if (project.searchableType === PROJECT_TYPES.DATA) {
    return projectClassificationsProps[0].color;
  }

  return projectClassificationsProps
    .filter((prop) => prop.typeOfProcessor === project.processorType)[0]?.color;
};

const fetchVisitor = (
  namespace,
  slug,
  actions,
) => actions.getProjectDetailsBySlug(namespace, slug)
  .then(({ project }) => {
    const gid = project.gitlabId || project.gitlab?.id;
    actions.setGlobalMarkerColor(calculateColor(project));
    return Promise.all([
      actions.getBranchesList(gid),
      actions.getMergeRequestsList(gid),
      actions.getUsersList(gid),
      actions.getProjectStarrers(gid),
    ]);
  })
  .catch(actions.redirectNotFound);

const fetchIfAuthenticated = (
  namespace,
  slug,
  actions,
) => actions.getProjectDetailsBySlug(namespace, slug)
  .then(({ project }) => {
    const gid = project.gitlabId || project.gitlab?.id;
    actions.setGlobalMarkerColor(calculateColor(project));

    let promises = [
      actions.getBranchesList(gid),
      actions.getMergeRequestsList(gid),
      actions.getUsersList(gid),
      actions.getJobsListPerProject(gid),
      actions.getProjectStarrers(gid),
    ];

    if (project.searchableType === PROJECT_TYPES.CODE) {
      promises = [...promises, actions.getProjectPipelines(gid)];
    } else {
      promises = [
        ...promises,
        actions.getProjectPipelinesByType(project.id, gid, 'DATA'),
        actions.getProjectPipelinesByType(project.id, gid, 'VISUALIZATION'),
      ];
    }

    return Promise.all(promises);
  })
  .catch(actions.redirectNotFound);

export default {
  fetchIfAuthenticated,
  fetchVisitor,
};

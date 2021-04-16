import { useSelector, useDispatch } from 'react-redux';
import ProjectApi from 'apis/ProjectGeneralInfoApi';
import { mergeWithGitlabProject, setSelectedProjectSuccesfully } from 'store/actions/projectInfoActions';
import { adaptProjectModel, parseToCamelCase } from 'functions/dataParserHelpers';
import { useEffect, useState } from 'react';
import { setGlobalMarkerColor } from 'store/actions/userActions';
import { calculateColor } from 'components/projectView/projectView';

const projectApi = new ProjectApi();

export const useSelectedProject = (namespace, slug) => {
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const [finalSelectedProject, setFinalSelectedProject] = useState(selectedProject);
  const [isFetching, setIsFetching] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (Object.keys(selectedProject).length === 0) {
      setIsFetching(true);
      if (namespace && slug) {
        projectApi.getProjectDetails(namespace, slug)
          .then(mergeWithGitlabProject)
          .then(parseToCamelCase)
          .then(adaptProjectModel)
          .then((proj) => {
            dispatch(setSelectedProjectSuccesfully(proj));
            dispatch(setGlobalMarkerColor(calculateColor(proj)));

            setFinalSelectedProject(proj);
            setIsFetching(false);
          });
      }
    }
  }, []);
  return [finalSelectedProject, isFetching];
};

export default {
  useSelectedProject,
};

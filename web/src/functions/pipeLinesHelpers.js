import { toastr } from 'react-redux-toastr';
import ExperimentsApi from 'apis/experimentApi';
import {
  Adjectives,
  BOOL,
  CANCELED,
  EXPIRED,
  FAILED,
  mlreefFileContent,
  Nouns,
  PENDING,
  RUNNING,
  SKIPPED,
  SUCCESS,
} from '../dataTypes';
import BranchesApi from '../apis/BranchesApi.ts';
import { callToCommitApi } from './apiCalls';

/**
 * @method addFilesSelectedInModal: This funtion is to add folders and files to the command
 * @param {lineWithOutFolderAndFiles}: This is the line without directories or files
 */
const addFilesSelectedInModal = (
  lineWithOutFoldersAndFiles,
  filesSelectedInModal,
) => {
  if (filesSelectedInModal.length === 0) {
    toastr.error('Execution failed', 'Check please that you have selected files to be used in the pipeline');
    return undefined;
  }
  let filesLine = '';
  const file = filesSelectedInModal[0];
  filesLine = `${filesLine} ${file.path}`;

  if (file.type === 'tree') {
    filesLine = filesLine.concat('/');
  }

  return lineWithOutFoldersAndFiles.replace('#directoriesAndFiles', filesLine);
};

/**
 * @param {input}: input html element which must be highlited to the user as wrong
 * @param {inputDataModel}: data model of input(data type, required, etc)
 * @param {dataOperationsHtmlElm}: operation container which must be highligthed
 */
export const showErrorsInTheOperationsSelected = (input, inputDataModel, dataOperationsHtmlElm) => {
  input.style.border = '1px solid red';
  dataOperationsHtmlElm.style.border = '1px solid red';
  const errorDiv = document.getElementById(`error-div-for-${input.id}`);
  errorDiv.style.display = 'flex';

  input.addEventListener('focusout', () => {
    input.removeAttribute('style');
    errorDiv.style.display = 'none';
  });

  dataOperationsHtmlElm.addEventListener('focusout', () => {
    dataOperationsHtmlElm.removeAttribute('style');
  });

  if (inputDataModel.dataType === BOOL) {
    const dropDown = input.parentNode.childNodes[1];
    dropDown.style.border = '1px solid red';
    dropDown.addEventListener('focusout', () => {
      dropDown.removeAttribute('style');
    });
  }
};

export const buildCommandLinesFromSelectedPipelines = (
  dataOperationsSelected,
  filesSelectedInModal,
  path,
) => dataOperationsSelected.map((dataOperation) => {
  let line = `    - python ${path}/${dataOperation.command}.py --images-path#directoriesAndFiles`;
  dataOperation.inputValuesAndDataModels.forEach((input) => {
    line = line.concat(` --${input.name} ${input.value}`);
  });

  return addFilesSelectedInModal(line, filesSelectedInModal);
});

export const generateRealContentFromTemplate = (
  pipeLineOperationCommands,
  dataInstanceName,
  httpUrlToRepo,
  pipelineOpScriptName,
) => mlreefFileContent
  .replace(/#pipeline-script/g,
    pipeLineOperationCommands
      .toString()
      .replace(/,/g, '\n'))
  .replace(/#target-branch/g, dataInstanceName)
  .replace(/#pipeline-operation-script-name/g, pipelineOpScriptName)
  .replace(/#repo-url/g, httpUrlToRepo.replace(/^(http?:|)\/\//, '')); // remove http://, https:// protocols

const getPathToPipiline = (pipelineType) => {
  switch (pipelineType) {
    case 'data-pipeline':
      return '/epf/pipelines';
    case 'model-experiment':
      return '/epf/model';
    default:
      return '/src/visualisation/';
  }
};

export const createPipelineInProject = (
  dataOperationsSelected,
  filesSelectedInModal,
  httpUrlToRepo,
  projectId,
  pipelineOpScriptType,
  branchName,
  dataInstanceName,
  branchSelected,
) => {
  const pipeLineOperationCommands = buildCommandLinesFromSelectedPipelines(
    dataOperationsSelected,
    filesSelectedInModal,
    getPathToPipiline(pipelineOpScriptType),
  );
  const finalContent = generateRealContentFromTemplate(
    pipeLineOperationCommands,
    dataInstanceName,
    httpUrlToRepo,
    pipelineOpScriptType,
    branchSelected,
  );
  const brApi = new BranchesApi();
  brApi.create(
    projectId,
    branchName,
    branchSelected || 'master',
  ).then((res) => {
    if (res.commit) {
      toastr.info('Execution', 'The branch for pipeline was created');
      callToCommitApi(projectId, branchName, 'create', finalContent);
    } else {
      toastr.error('Execution', 'The branch for pipeline could not be created');
    }
  }).catch(() => {
    toastr.error('Error', 'Something went wrong, try again later please');
  });
};



const createExperimentInProject = (
  dataOperationsSelected,
  backendId,
  branchName,
  branchSelected,
  filesSelectedInModal,
) => {
  const experimentData = dataOperationsSelected[0];
  const { inputValuesAndDataModels: parameters, slug } = experimentData;
  const experimentBody = {
    slug: branchName, // slug is NOT the branch name, it needs replacement
    name: branchName,
    source_branch: branchSelected,
    target_branch: branchName,
    input_files: filesSelectedInModal.map((file) => file.path),
    processing: {
      slug,
      parameters,
    },
  };
  ExperimentsApi.createExperiment(backendId, experimentBody)
    .then((experiment) => {
      toastr.success('Success', 'Experiment was generated');
      ExperimentsApi.startExperiment(backendId, experiment.id)
        .then((res) => {
          if (res.ok) {
            toastr.success('Success', 'Experiment was started');
          } else {
            Promise.reject(res);
          }
        });
    })
    .catch((err) => toastr('Error', err));
};

export default createExperimentInProject;

export const randomNameGenerator = () => {
  const randomFirstName = Math.floor(Math.random() * Adjectives.length);
  const randomLastName = Math.floor(Math.random() * Nouns.length);
  const currentDate = new Date();
  const date = currentDate.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const dateString = `${date}${month + 1}${year}`;
  return `${Adjectives[randomFirstName]}-${Nouns[randomLastName]}_${dateString}`;
};

export const classifyPipeLines = (pipelinesToClassify, arrayOfBranches) => {
  const pipes = pipelinesToClassify.filter((pipe) => pipe.status !== SKIPPED);
  const infoPipelinesComplemented = arrayOfBranches.map((branch) => {
    const pipeBranch = pipes.filter((pipe) => pipe.ref === branch.name)[0];
    if (pipeBranch) {
      return {
        status: pipeBranch.status,
        name: branch.name,
        authorName: branch.commit.author_name,
        createdAt: branch.commit.created_at,
        commit: branch.commit,
      };
    }

    return null;
  }).filter((pipeline) => pipeline !== null);
  return [
    {
      status: RUNNING,
      values: infoPipelinesComplemented.filter((exp) => exp.status === RUNNING || exp.status === PENDING),
    },
    { status: SUCCESS, values: infoPipelinesComplemented.filter((exp) => exp.status === SUCCESS) },
    { status: CANCELED, values: infoPipelinesComplemented.filter((exp) => exp.status === CANCELED) },
    { status: FAILED, values: infoPipelinesComplemented.filter((exp) => exp.status === FAILED) },
    { status: EXPIRED, values: infoPipelinesComplemented.filter((exp) => exp.status === EXPIRED) },
  ];
};

export const classifyExperiments = (pipelinesToClassify, arrayOfBranches, experiments) => {
  const pipes = pipelinesToClassify.filter((pipe) => pipe.status !== SKIPPED);
  const infoPipelinesComplemented = arrayOfBranches.map((branch) => {
    const pipeBranch = pipes.filter((pipe) => pipe.ref === branch.name)[0];
    let experimentData;
    experiments.forEach((experiment) => {
      if (pipeBranch && experiment.name === pipeBranch.ref) {
        experimentData = experiment;
      }
    });
    if (pipeBranch) {
      return {
        status: pipeBranch.status,
        name: branch.name,
        authorName: branch.commit.author_name,
        createdAt: branch.commit.created_at,
        commit: branch.commit,
        experimentData,
      };
    }

    return null;
  }).filter((pipeline) => pipeline !== null);
  return [
    {
      status: RUNNING,
      values: infoPipelinesComplemented
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((exp) => exp.status === RUNNING
      || exp.status === PENDING),
    },
    {
      status: SUCCESS,
      values: infoPipelinesComplemented
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((exp) => exp.status === SUCCESS),
    },
    {
      status: CANCELED,
      values: infoPipelinesComplemented
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((exp) => exp.status === CANCELED),
    },
    {
      status: FAILED,
      values: infoPipelinesComplemented
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((exp) => exp.status === FAILED),
    },
    {
      status: EXPIRED,
      values: infoPipelinesComplemented
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((exp) => exp.status === EXPIRED),
    },
  ];
};

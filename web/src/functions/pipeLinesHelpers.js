import { toastr } from 'react-redux-toastr';
import {
  Adjectives, BOOL, mlreefFileContent, Nouns, RUNNING, SUCCESS, CANCELED, FAILED, PENDING, SKIPPED, EXPIRED,
} from '../dataTypes';
import branchesApi from '../apis/BranchesApi';
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
  let line = `   - python ${path}/${dataOperation.command}.py --images-path#directoriesAndFiles`;
  dataOperation.inputValuesAndDataModels.forEach((input) => {
    line = line.concat(` --${input.inputDataModel.commandName} ${input.value}`);
  });

  return addFilesSelectedInModal(line, filesSelectedInModal);
});

export const generateRealContentFromTemplate = (
  mlreefFileContent,
  branchSelected,
  pipeLineOperationCommands,
  dataInstanceName,
  http_url_to_repo,
  pipelineOpScriptName,
) => mlreefFileContent
  .replace(/#replace-here-the-lines/g,
    pipeLineOperationCommands
      .toString()
      .replace(/,/g, '\n'))
  .replace(/#initialBranch/g, branchSelected)
  .replace(/#target-branch/g, dataInstanceName)
  .replace(/#pipeline-operation-script-name/g, pipelineOpScriptName)
  .replace(/#repo-url/g,http_url_to_repo.replace(/^(https?:|)\/\//, '')) // remove http://, https:// protocols  
  ;

const createPipelineInProject = (
  dataOperationsSelected,
  branchSelected,
  filesSelectedInModal,
  http_url_to_repo,
  projectId,
  pipelineOpScriptName,
  branchName,
  dataInstanceName,
) => {
  const pipeLineOperationCommands = buildCommandLinesFromSelectedPipelines(
    dataOperationsSelected,
    filesSelectedInModal,
    pipelineOpScriptName === 'data-pipeline' ? '/epf/pipelines' : '/epf/model',
  );
  const finalContent = generateRealContentFromTemplate(
    mlreefFileContent,
    branchSelected,
    pipeLineOperationCommands,
    dataInstanceName,
    http_url_to_repo,
    pipelineOpScriptName,
  );
  toastr.info('Execution', 'Pipeline execution has already started');
  branchesApi.create(
    projectId,
    branchName,
    'master',
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

export default createPipelineInProject;

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

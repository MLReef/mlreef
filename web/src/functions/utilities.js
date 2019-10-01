import {toastr} from 'react-redux-toastr';
import { BOOL, mlreefFileContent } from "./../data-types";
import { validateInput } from './validations'
import branchesApi from "../apis/BranchesApi";
import { callToCommitApi } from "./apiCalls";

/**
 * @method addFilesSelectedInModal: This funtion is to add folders and files to the command
 * @param {lineWithOutFolderAndFiles}: This is the line without directories or files
 */
export const addFilesSelectedInModal = (
    lineWithOutFoldersAndFiles, 
    filesSelectedInModal
) => {
    if(filesSelectedInModal.length === 0){
        toastr.error('Execution failed', 'Check please that you have selected files to be used in the pipeline');
        return undefined;
    }
    let filesLine = "";
    const file = filesSelectedInModal[0];
    filesLine = `${filesLine} ${file.path}`;
    
    if(file.type === "tree"){
        filesLine = filesLine.concat("/");
    }        

    return lineWithOutFoldersAndFiles.replace("#directoriesAndFiles", filesLine);
}

/**
 * @param {input}: input html element which must be highlited to the user as wrong
 * @param {inputDataModel}: data model of input(data type, required, etc)
 * @param {dataOperationsHtmlElm}: operation container which must be highligthed
 */
export const showErrorsInTheOperationsSelected = (input, inputDataModel, dataOperationsHtmlElm) => {
    input.style.border = "1px solid red";
    dataOperationsHtmlElm.style.border = "1px solid red";
    const errorDiv = document.getElementById(`error-div-for-${input.id}`);
    errorDiv.style.display = "flex";
    
    input.addEventListener('focusout', () => {
        input.removeAttribute("style");
        errorDiv.style.display = "none";
    });

    dataOperationsHtmlElm.addEventListener('focusout', () => {
        dataOperationsHtmlElm.removeAttribute("style");
    });

    if(inputDataModel.dataType === BOOL){
        const dropDown = input.parentNode.childNodes[1]
        dropDown.style.border = "1px solid red";
        dropDown.addEventListener('focusout', () => {
            dropDown.removeAttribute("style");
        });
    }
}


export const buildCommandLinesFromSelectedPipelines = (
    dataOperationsSelected,
    dataOperationsHtmlElms,
    filesSelectedInModal,
    errorCounter,
    path
) =>
    dataOperationsSelected.map((dataOperation, index) => {
        const dataOperationsHtmlElm = dataOperationsHtmlElms[index];
        let line = `   - python ${path}/${dataOperation.command}.py --images-path#directoriesAndFiles`;
        const dataOpInputs = Array.prototype.slice.call(dataOperationsHtmlElm.getElementsByTagName("input"));
        let advancedParamsCounter = 0;
        dataOpInputs.forEach((input, inputIndex) => {
            let inputDataModel = null;
            if(input.id.startsWith("ad-")){
                inputDataModel = dataOperation.params.advanced[advancedParamsCounter];
                advancedParamsCounter = advancedParamsCounter + 1;
            } else {
                inputDataModel = dataOperation.params.standard[inputIndex];
            }
            
            if(!validateInput(input.value, inputDataModel.dataType, inputDataModel.required)){
                errorCounter = errorCounter + 1;
                showErrorsInTheOperationsSelected(input, inputDataModel, dataOperationsHtmlElm);
                return;
            }

            if(input.value){
                line = line.concat(` --${inputDataModel.commandName} ${input.value}`);
            }
        });

        return errorCounter === 0 
            ? addFilesSelectedInModal(line, filesSelectedInModal)
            : undefined;
    });

export const generateRealContentFromTemplate = (
    mlreefFileContent,
    pipeLineOperationCommands,
    dataInstanceName,
    http_url_to_repo,
    pipelineOpScriptName
) => 
    mlreefFileContent
        .replace(/#replace-here-the-lines/g,
            pipeLineOperationCommands
                .toString()
                .replace(/,/g, "\n")
        )
        .replace(/#target-branch/g, dataInstanceName)
        .replace(/#pipeline-operation-script-name/g, pipelineOpScriptName)
        .replace(/#pipeline-operation-script-name/g, pipelineOpScriptName)
        .replace(
            /#repo-url/g, 
            http_url_to_repo.substr(
                8, 
                http_url_to_repo.length
            )
        );

export const createPipelineInProject = (
    dataOperationsSelected, 
    filesSelectedInModal, 
    http_url_to_repo,
    projectId,
    pipelineOpScriptName,
    branchName,
    dataInstanceName
) => {
    const pipeLineOperationCommands = buildCommandLinesFromSelectedPipelines(
        dataOperationsSelected,
        Array.prototype.slice.call(
            document
                .getElementById('data-operations-selected-container')
                .childNodes
        ).map(
            child => child.childNodes[1]
        ),
        filesSelectedInModal
        , 0,
        pipelineOpScriptName === "data-pipeline" ? "/epf/pipelines": "/epf/model"
    );
    if(pipeLineOperationCommands
        .filter(
            line => line !== undefined
        ).length === dataOperationsSelected.length 
    ){
        const finalContent = generateRealContentFromTemplate(
            mlreefFileContent, 
            pipeLineOperationCommands, 
            dataInstanceName,
            http_url_to_repo,
            pipelineOpScriptName
        );
        console.log(finalContent);
        toastr.info('Execution', 'Pipeline execution has already started');
        branchesApi.create(
            projectId,
            branchName,
            "master"
        ).then((res) => {
            if(res['commit']){
                toastr.info('Execution', 'The branch for pipeline was created');
                callToCommitApi(projectId, branchName, "create", finalContent);
            }else{
                toastr.error('Execution', 'The branch for pipeline could not be created');
            }
        }).catch((err) => {
            console.log(err);
            toastr.error('Error', 'Something went wrong, try again later please');
        });
    } else {
        toastr.error('Form', 'Validate please data provided in inputs');
    }
};

export const getTimeCreatedAgo = (timeAgoCreatedAt) => {
    const today = new Date();
    const timeAgoCreatedAtDate = new Date(timeAgoCreatedAt);
    let diff = today - timeAgoCreatedAtDate;
    let timediff;
    if (diff > 2678400e3) {
        timediff = `${Math.floor(diff / 2678400e3)} months`
    }
    else if (diff > 604800e3) {
        timediff = `${Math.floor(diff / 604800e3)} weeks`
    }
    else if (diff > 86400e3) {
        timediff = `${Math.floor(diff / 86400e3)} days`
    }
    else if (diff > 3600e3) {
        timediff = `${Math.floor(diff / 3600e3)} hour(s)`
    }
    else if (diff > 60e3) {
        timediff = `${Math.floor(diff / 60e3)} minutes`
    }
    else {
        timediff = "just now"
    }

    return timediff;
}

export const generateSummarizedInfo = (epochObjects) => {
    /**
     * Next loop is to get all the epoc keys like acc, val_acc, loss, val_loss.
     */
    const resultData = Object.keys(epochObjects[0]).map( key => {
        const pipeLineEpochValue = {};
        pipeLineEpochValue[key] = [];

        return pipeLineEpochValue;
    });

    Object.keys(epochObjects).forEach(obj => {
        Object.keys(epochObjects[obj]).forEach((objKey, index) => {
            resultData[index][objKey].push(epochObjects[obj][objKey]);
        });
    });

    /**
     * Get average data per epoch value
     */
    resultData.forEach((epochValue) => {
        const epochNameValue = Object.keys(epochValue)[0];
        resultData[`avg_${epochNameValue}`] = (
            epochValue[epochNameValue]
                .reduce((a, b) => a + b)
                    / epochValue[epochNameValue].length
        );
    })
    return resultData;
}

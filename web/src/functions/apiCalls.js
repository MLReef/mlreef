import filesApi from "../apis/FilesApi";
import commitsApi from "./../apis/CommitsApi";

export const callToCommitApi = (
    projectId, 
    branch, 
    action, 
    finalContent
) =>
    commitsApi.performCommit(
        projectId,
        ".mlreef.yml",
        finalContent,
        "gitlab.com",
        branch,
        "pipeline execution",
        action
    )
    .then(res => {
        if(!res['id'] || typeof res['id'] === undefined){
            callToCommitApi(branch, "update", finalContent);
        }
    })
    .catch(err => console.log(err));

export const callToGetFilesInFolder = (
    path,
    branch,
    projectId,
    recursive
) =>
    filesApi
    .getFilesPerProject(projectId, path ? path : "", recursive, "gitlab.com", branch)
    .catch(err => console.error(err));
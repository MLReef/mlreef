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

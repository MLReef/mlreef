import * as types from './actionTypes';
import commitsApi from "./../apis/CommitsApi";

export function performCommit(projectId, filePath, fileContent, domain = "gitlab.com", branch = "master", commitMss){
    return async () => {
        try {
            return commitsApi.performCommit(projectId, filePath, fileContent, domain, branch, commitMss);
        } catch (error) {
            console.log(error);
        }
    }
}

export function getCommitInfoSuccessfully(commitData) {
    return { type: types.GET_COMMIT_DATA, commitData }
}

export function getCommits(projectId) {
    return async function () {
        let domain = "gitlab.com";

        try {
            return commitsApi.getCommits(domain, projectId);
        }
        catch (err) {
            throw err;
        }
    }
}
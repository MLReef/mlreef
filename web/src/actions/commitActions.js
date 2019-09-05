import * as types from './actionTypes';
import { SECURITY_TOKEN } from "../api-config";
import commitsApi from "./../apis/CommitsApi";

export function getCommitInfoSuccessfully(commitData) {
    return { type: types.GET_COMMIT_DATA, commitData }
}

export function getCommits(projectId) {
    return async function () {
        let domain = "gitlab.com";

        try {
            return commitsApi.getCommits(domain, projectId, SECURITY_TOKEN);
        }
        catch (err) {
            throw err;
        }
    }
}
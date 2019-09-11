import * as types from './actionTypes';
import { SECURITY_TOKEN } from "../api-config";
import commitsApi from "./../apis/CommitsApi";

export function getCommitInfoSuccessfully(commitData) {
    return { type: types.GET_COMMIT_DATA, commitData }
}

export function getCommits(domain, projectId) {
    return async function () {
        try {
            return commitsApi.getCommits(domain, projectId, SECURITY_TOKEN);
        }
        catch (err) {
            throw err;
        }
    }
}

export function getCommitDetails(domain, projectId, commitId) {
    return async function () {
        try {
            return commitsApi.getCommitDetails(domain, projectId, commitId, SECURITY_TOKEN);
        }
        catch (err) {
            throw err;
        }
    }
}
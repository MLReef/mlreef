import projectGeneralInfoApi from "./../apis/projectGeneralInfoApi";
import * as types from "./actionTypes";
import { loadFiles } from "./fileActions";

export function loadProjectInfoSuccessfully(project) {
    return {type: types.GET_GENERAL_INFO_REPO, project};
}

export function loadProjectGeneralInfo() {
    return function(dispatch) {
        let token = "4s129mSs6v1iw_uDzDc7";
        let projectId = "12395599";

        return projectGeneralInfoApi.getProjectInfoApi(token, projectId).then(project => {
            dispatch(loadProjectInfoSuccessfully(project));
            dispatch(loadFiles("", project.default_branch))
        }).catch(err => {
            throw err;
        });
    }
}
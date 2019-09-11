import projectGeneralInfoApi from "./../apis/projectGeneralInfoApi";
import * as types from "./actionTypes";

/**
 * 
 * @param {*} projects: load list for redux global state
 */

export function getProjectsInfoSuccessfully(projects) {
    return { type: types.GET_LIST_OF_PROJECTS, projects };
}

/**
 * get list of projects associated with authenticated user
 */

export function getProjectsList() {
    return (dispatch) => projectGeneralInfoApi
        .getProjectsList()
        .then(
            projects => dispatch(getProjectsInfoSuccessfully(
                projects.filter(project =>
                    project.id
                )
            )
            )
        ).catch(err => {
            throw err;
        });
}

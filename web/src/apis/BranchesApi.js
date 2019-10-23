import { SECURITY_TOKEN } from "../apiConfig";
import { domain } from "../dataTypes";
/**
 * core-js and regenerator-runtime imports are necessary to make tests run
 */
import "core-js/stable";
import "regenerator-runtime/runtime";

export default class BranchesApi {
    static async create(projectId, branchName, refBranch) {
        try {
            const response = await fetch(
                `https://${domain}/api/v4/projects/${projectId}/repository/branches?branch=${branchName}&ref=${refBranch}`, {
                    method: 'POST',
                    headers: new Headers({
                        "PRIVATE-TOKEN": SECURITY_TOKEN,
                        "Content-Type": "application/json"
                    })
                });
                return response.json();
            } catch (err) {
                console.log(err);
                return err;
            }
    }

    static async getBranches(projectId) {
        let url = `https://${domain}/api/v4/projects/${projectId}/repository/branches`;
        try {
            const response = await fetch(
                url, {
                method: 'GET',
                headers: new Headers({
                    "PRIVATE-TOKEN": SECURITY_TOKEN
                })
            });
            return response.json();
        } catch(err){
            console.log(err);
        }
    }
}
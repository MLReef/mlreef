import { SECURITY_TOKEN } from "../api-config";
import { domain } from "../data-types";

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
}
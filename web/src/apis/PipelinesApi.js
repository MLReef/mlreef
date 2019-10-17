import { SECURITY_TOKEN } from "../apiConfig";
import { domain } from "../dataTypes";

export default class PipeLinesApi {
    static async create(projectId, refBranch) {
        try {
            const response = await fetch(
                `https://${domain}/api/v4/projects/${projectId}/pipeline?ref=${refBranch}`, {
                    method: 'POST',
                    headers: new Headers({
                        "PRIVATE-TOKEN": SECURITY_TOKEN,
                        "Content-Type": "application/json"
                    })
                });
                return response.json();
        } 
        catch (err) {
            console.log(err);
            return err;
        }
    }

    static async getPipesByProjectId(projectId) {
        try {
            const response = await fetch(
                `https://${domain}/api/v4/projects/${projectId}/pipelines/`, {
                    method: 'GET',
                    headers: new Headers({
                        "PRIVATE-TOKEN": SECURITY_TOKEN
                    })
                });
                return response.json();
        } 
        catch (err) {
            console.log(err);
            return err;
        }
    }
}

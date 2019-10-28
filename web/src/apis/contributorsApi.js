import { SECURITY_TOKEN } from "./../apiConfig";
import { domain } from "./../dataTypes";

export default class ContributorsApi {
    static async getProjectContributors(projectId) {
        try {
            const response = await fetch(new Request(`https://${domain}/api/v4/projects/${projectId}/members`, {
                method: 'GET',
                headers: new Headers({
                    "PRIVATE-TOKEN": SECURITY_TOKEN
                })
            }));
            return response.json();
        }
        catch (err) {
            console.log(err);
            return err;
        }
    }
}
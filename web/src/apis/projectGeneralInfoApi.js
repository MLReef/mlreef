import { SECURITY_TOKEN } from "../api-config";
export default class ProjectGeneralInfoApi {
    static async getProjectInfoApi(projectId, domain = "gitlab.com") {
        try {
            const respone = await fetch(new Request(`https://${domain}/api/v4/projects/${projectId}`, {
                method: 'GET',
                headers: new Headers({
                    'PRIVATE-TOKEN': SECURITY_TOKEN
                })
            }));
            return respone.json();
        }
        catch (err) {
            return err;
        }
    }

    static async getProjectsList(domain = "gitlab.com") {
        try {
            const respone = await fetch(new Request(`https://${domain}/api/v4/projects?simple=true&membership=true`, {
                method: 'GET',
                headers: new Headers({
                    'PRIVATE-TOKEN': SECURITY_TOKEN
                })
            }));
            return respone.json();
        }
        catch (err) {
            return err;
        }
    }
}
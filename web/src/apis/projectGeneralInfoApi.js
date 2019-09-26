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
        } catch (err) {
            return err;
        }
    }

    static async getProjectsList(domain = "gitlab.com") {
        try {
            const response = await fetch(new Request(`https://${domain}/api/v4/projects?simple=true&membership=true`, {
                method: 'GET',
                headers: new Headers({
                    'PRIVATE-TOKEN': SECURITY_TOKEN
                })
            }));
            return response.json();
        } catch (err) {
            return err;
        }
    }

    static async forkProject(domain, projectId, projName) {
        let url = `https://${domain}/api/v4/projects/${projectId}/fork`;
        return fetch(new Request(
            url, {
            method: 'POST',
            headers: new Headers({
                "PRIVATE-TOKEN": SECURITY_TOKEN,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ id: projectId, namespace: "mlreefdemo", path: `sathvik_${projName}_fork`, name: `${projName}_forked` })
        }
        ))
    }

    static async removeProject(domain, projectId) {
        let url = `https://${domain}/api/v4/projects/${projectId}`;
        return fetch(new Request(
            url, {
            method: 'DELETE',
            headers: new Headers({
                "PRIVATE-TOKEN": SECURITY_TOKEN
            })
        }
        ))
    }
}
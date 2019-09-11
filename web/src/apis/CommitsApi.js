import { SUPER_SECURITY_TOKEN, SECURITY_TOKEN } from "../api-config";

export default class CommitsApi {

    static async performCommit(projectId, filePath, fileContent, domain = "gitlab.com", branch = "master", commitMss, action) {
        try {
            const response = await fetch(
                `https://${domain}/api/v4/projects/${projectId}/repository/commits`, {
                method: 'POST',
                headers: new Headers({
                    "PRIVATE-TOKEN": SUPER_SECURITY_TOKEN,
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "https://gitlab.com"
                }),
                body: JSON.stringify({
                    "branch": branch,
                    "commit_message": commitMss,
                    "actions": [
                        {
                            "action": action,
                            "file_path": filePath,
                            "content": fileContent
                        }
                    ]
                })
            }
            );

            return response.json();
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    static async getCommits(domain, projectId) {
        let url = `https://${domain}/api/v4/projects/${projectId}/repository/commits`;
        return fetch(new Request(
            url, {
            method: 'GET',
            headers: new Headers({
                "PRIVATE-TOKEN": SECURITY_TOKEN
            })
        }
        ))
    }
}

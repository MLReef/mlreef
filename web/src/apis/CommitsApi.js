export default class CommitsApi {
    static getCommits(domain, projectId, token) {
        let url = `https://${domain}/api/v4/projects/${projectId}/repository/commits`;
        console.log(url);
        return fetch(new Request(
            url, {
                method: 'GET',
                headers: new Headers({
                    "PRIVATE-TOKEN": token
                })
            }
        ))
    }
}
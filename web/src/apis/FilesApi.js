export default class FilesApi {

    static getFilesPerProject(token, projectId, path, recursive = false, domain = "gitlab.com", branch = "master") {
        return fetch(new Request(
                `https://${domain}/api/v4/projects/${projectId}/repository/` +
                        `tree?ref=${branch}&recursive=${recursive}&path=${path}`, {
                            method: 'GET',
                            headers: new Headers({
                                "PRIVATE-TOKEN": token
                            })
                }
            )).then(response => {
                return response.json();
              }).catch(err => {
                return err;
              }); 
    }

    static getFileData(domain, projectId, path = "/", branch = "master", token) {
        let url = `https://${domain}/api/v4/projects/${projectId}/repository/files/${path}?ref=${branch}`;
        console.log(url);
        return fetch(new Request(
            url, {
                method: 'GET',
                headers: new Headers({
                    "PRIVATE-TOKEN": token
                })
            }
            )).then(response => {
                return response.json();
            }).catch(err => {
                return err;
            }); 
        }
}

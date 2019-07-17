export default class ProjectGeneralInfoApi{
    static getProjectInfoApi(token, projectId, domain = "gitlab.com") {
        return fetch(new Request(`https://${domain}/api/v4/projects/${projectId}`, {
                method: 'GET',
                headers: new Headers({
                    'PRIVATE-TOKEN': token
                })
            }
        )).then(respone => {
            return respone.json();
        }).catch(err => {
            return err;
        });
    }
}
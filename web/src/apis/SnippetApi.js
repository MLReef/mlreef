import {SECURITY_TOKEN} from "../apiConfig";

export default class SnippetApi {

    static buildRequest(url, method) {
        return new Request(url, {
            method: method,
            headers: new Headers({
                "PRIVATE-TOKEN": SECURITY_TOKEN
            })
        });
    }

    static async getSnippetFile(projectId, experimentId, fileName, domain = "gitlab.com") {
        const fileNameFilter = `${experimentId}-${fileName}`;
        const results = this.findSnippets(projectId, fileNameFilter, domain);
        return results.then((results) => results !== undefined && results.length > 0
            ? this.getSnippetContent(results[0].id)
            : Promise.reject(`File not found in backend: ${fileNameFilter}`));
    }

    static async findSnippets(projectId, fileNameFilter = "", domain = "gitlab.com") {
        try {
            const url = `https://${domain}/api/v4/projects/${projectId}/snippets/`;
            const response = await fetch(this.buildRequest(url, 'GET'));

            const promise = response.json();
            return promise.then((resultArray) => (fileNameFilter.length > 0)
                ? Promise.resolve(resultArray.filter(item => item.file_name === fileNameFilter))
                : Promise.resolve(resultArray));
        } catch (err) {
            return err;
        }
    }

    static async getSnippetContent(snippetId, domain = "gitlab.com") {
        try {
            const url = `https://${domain}/api/v4/snippets/${snippetId}/raw`;
            const response = await fetch(this.buildRequest(url, 'GET'));
            return response.json();
        } catch (err) {
            return err;
        }
    }
}

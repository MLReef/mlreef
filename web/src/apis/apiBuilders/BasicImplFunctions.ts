import { PER_PAGE } from 'apiConfig';

interface PaginationObject {
  per_page: number;
  page?: number;
}

function generatePaginationString(pagination: PaginationObject) {
  return Object.entries(pagination).map(([k, v]) => `${k}=${v}`).join('&');
}

export default class BasicImplFunctions {
  url: string = '';

  pagination: PaginationObject = {
    per_page: PER_PAGE,
  };

  gitlabRegex = /api\/v4\//;

  constructor({ pagination }: { pagination?: PaginationObject } = {}) {
    this.attachPagination = this.attachPagination.bind(this);

    if (pagination) this.pagination = pagination;
  }

  parseMapsToJson = (map: Map<string, string>) => JSON.parse(JSON.stringify(map));

  attachPagination() {
    const isGitlab = this.gitlabRegex.test(this.url);

    if (!isGitlab) return this.url;

    const sep = this.url.match(/\?/) ? '&' : '?';

    return `${this.url}${sep}${generatePaginationString(this.pagination)}`;
  }
}

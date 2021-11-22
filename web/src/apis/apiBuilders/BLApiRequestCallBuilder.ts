import Builder from "./Builder";
import BasicImplFunctions from "./BasicImplFunctions";

export default class BodyLessApiRequestCallBuilder extends BasicImplFunctions implements Builder {
  method: string;
  headers: Map<string, string>;
  url: string;
  private urlParams: Map<string, string> = new Map();

  constructor(method: string, headers: Map<string, string>, url: string, pagination: any){
    super({ pagination });

    this.method = method;
    this.headers = headers;
    this.url = url;
  }

  public setUrlParams(urlParams : Map<string, string>) {
    this.urlParams = urlParams;
  }

  buildUrlWithParams = () => Array.from(
    this.urlParams.keys()
  )
    .forEach((key, indexKey) => {
      const value = this.urlParams.get(key);
      const urlKey = indexKey === 0 ? '?' : '&';
      this.url = `${this.url}${urlKey}${key}=${value}`;
    });

  build({ pagination = true }: { pagination?: boolean } = {}) {
    const url = pagination ? this.attachPagination() : this.url;

    return new Request(
      url , {
        method: this.method,
        headers: new Headers(this.parseMapsToJson(this.headers)),
      },
    )
  }
}
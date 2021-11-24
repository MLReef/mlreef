import Builder from "./Builder";
import BasicImplFunctions from "./BasicImplFunctions";
import { string } from "prop-types";

export default class ApiRequestCallBuilder extends BasicImplFunctions implements Builder {
  method: string;
  headers: Map<string, string>;
  url: string;
  private body: string;

  constructor(method: string, headers: Map<string, string>, url: string, body: string, pagination: any = {}){
    super({ pagination });

    this.build = this.build.bind(this);

    this.method = method;
    this.headers = headers;
    this.url = url;
    this.body = body;
  };

  build({ pagination = true }: { pagination?: boolean } = {}) {
    const { method, body } = this;
    const headers = new Headers(this.parseMapsToJson(this.headers));
    const url = pagination ? this.attachPagination() : this.url;

    return new Request(url, {method, headers, body });
  }
}
import Builder from "./Builder";
import BasicImplFunctions from "./BasicImplFunctions";

export default class ApiRequestCallBuilder extends BasicImplFunctions implements Builder {
  method: string;
  headers: Map<string, string>;
  url: string;
  private body: string;
  
  constructor(method: string, headers: Map<string, string>, url: string, body: string){
    super();
    this.method = method;
    this.headers = headers;
    this.url = url;
    this.body = body;
  };

  build = () => new Request(
      this.url , {
        method: this.method,
        headers: new Headers(this.parseMapsToJson(this.headers)),
        body: this.body,
      },
    )
  
}
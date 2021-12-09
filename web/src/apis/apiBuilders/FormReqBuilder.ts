import BasicImplFunctions from './BasicImplFunctions';
import Builder from './Builder.ts';
import { METHODS } from './requestEnums';

export default class FormReqBuilder extends BasicImplFunctions implements Builder {
  method: string = METHODS.POST;

  headers: Map<string, string> = new Map();

  formData: FormData | undefined;

  url: string = '';

  withUrl(url: string) {
    this.url = url;

    return this;
  }

  withMethod(method: string) {
    this.method = method;

    return this;
  }

  withHeaders(headers: Map<string, string>) {
    this.headers = headers;

    return this;
  }

  withFormDataParam(name: string, data: any) {
    if (!this.formData) {
      this.formData = new FormData();
    }
    this.formData.append(name, data);

    return this;
  }

  build(): Request {
    let finalParams: any = {
      headers: new Headers(this.parseMapsToJson(this.headers)),
      method: this.method,
    };

    if (this.formData) {
      finalParams = { ...finalParams, body: this.formData };
    }

    return new Request(
      this.url,
      finalParams,
    );
  }
}

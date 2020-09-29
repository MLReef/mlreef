import { getAuth, getCurrentToken } from "TokenProvider";
import { commonHeaderNames, headerDataTypes, validServicesToCall } from "./apiBuilders/requestEnums";

export default class ApiDirector {
  buildAnonHeaders() {
    const contentHeaders = new Map<string, string>();
    contentHeaders.set(commonHeaderNames.CONTENT_TYPE, headerDataTypes.JSON);
    contentHeaders.set(commonHeaderNames.ACCEPT, headerDataTypes.JSON);
    
    return contentHeaders;
  };

  private resolveTokenName = (serviceToCall: string) => {
    switch (serviceToCall) {
      case validServicesToCall.BACKEND:
        return commonHeaderNames.PRIV_TOKEN
      case validServicesToCall.GITLAB:
        return commonHeaderNames.OAUTH_TOKEN
      default:
        throw new Error("No valid service requested");
    }
  }

  buildBasicHeaders = (serviceToCall: string) : Map<string, string> => {
    const headers = this.buildAnonHeaders();

    if (getAuth()) {
      return headers.set(this.resolveTokenName(serviceToCall), getCurrentToken());
    }

    return headers;
  }
}

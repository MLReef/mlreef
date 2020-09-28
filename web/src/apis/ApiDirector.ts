import store from '../store';
import { commonHeaderNames, headerDataTypes, validServicesToCall } from "./apiBuilders/requestEnums";

export default class ApiDirector {   
  getCurrentToken() : string {
    const { user } = store.getState();
    return user && `Bearer ${user.access_token}`;
  }

  private getAuth(): boolean {
    const { user } = store.getState();

    return !!user?.auth;
  }

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

    if (this.getAuth()) {
      return headers.set(this.resolveTokenName(serviceToCall), this.getCurrentToken());
    }

    return headers;
  }
}

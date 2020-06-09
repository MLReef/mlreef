import store from "store";

export default class ApiDirector {   
  private getCurrentToken() : string {
    const { user } = store.getState();

    return user && user.token;
  }
  
  buildBasicHeaders = (): Map<string, string> => new Map()
    .set('PRIVATE-TOKEN', this.getCurrentToken())
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
}
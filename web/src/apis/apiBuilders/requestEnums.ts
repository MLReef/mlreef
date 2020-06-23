export enum METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export enum headerDataTypes {
  JSON = 'application/json'
}

export enum commonHeaderNames {
  CONTENT_TYPE = 'Content-Type',
  ACCEPT = 'Accept',
  PRIV_TOKEN = 'PRIVATE-TOKEN',
  OAUTH_TOKEN = 'Authorization',
}

export enum validServicesToCall {
  BACKEND = "backend",
  GITLAB = "gitlab",
}
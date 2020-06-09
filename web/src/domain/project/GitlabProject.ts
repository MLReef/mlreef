export interface GitlabProject {
  id?: number;
  description?: string;
  defaultBranch?: string;
  visibility?: string;
  sshUrlToRepo?: string;
  httpUrlToRepo?: string;
  webUrl?: string;
  readmeUrl?: string;
  gitlabName?: string;
  nameWithNamespace?: string;
  path?: string;
  pathWithNamespace?: string;
  namespace?: any;
  avatarUrl?: string;
  forksCount?: number;
  starCount?: number;
  emptyRepo?: boolean;
}
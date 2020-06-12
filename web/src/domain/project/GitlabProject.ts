import { INFORMATION_UNITS } from "domain/informationUnits";

export abstract class GitlabProject {
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
  repositorySize?: number;  
  getRepositorySize(): string {
    if(!this.repositorySize)
      return '0';
    if(this.repositorySize > 0 && this.repositorySize < INFORMATION_UNITS.MEGABYTE){
      return `${Math.floor(this.repositorySize / INFORMATION_UNITS.KILOBYTE)}KB`;
    }
    return `${Math.floor(this.repositorySize / INFORMATION_UNITS.MEGABYTE)}MB`;
  };
}
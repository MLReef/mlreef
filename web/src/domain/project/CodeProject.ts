import MLProject from "./MLProject";
import { GitlabProject } from "./GitlabProject";
import { PROJECT_TYPES } from "./projectTypes";

export default class CodeProject extends GitlabProject implements MLProject {
  backendId?: string;
  slug: string;
  url: string;
  ownerId: string;
  gitlabGroup?: string;
  gitlabProject?: string
  gitlabId?: number

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
  projectType: string = PROJECT_TYPES.CODE_PROJ;

  constructor(
    backendId: string,
    slug: string,
    url: string,
    ownerId: string,
    gitlabGroup: string,
    gitlabProject: string,
    gitlabId: number
  ) {
    super();
    this.backendId = backendId;
    this.slug = slug;
    this.url = url;
    this.ownerId = ownerId;
    this.gitlabGroup = gitlabGroup;
    this.gitlabProject = gitlabProject;
    this.gitlabId = gitlabId;
  }
}
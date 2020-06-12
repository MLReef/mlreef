import MLProject from "./MLProject";
import Experiment from "../experiments/Experiment";
import { GitlabProject } from "./GitlabProject";

export default class DataProject extends GitlabProject implements MLProject {
  backendId?: string;
  slug: string;
  url: string;
  ownerId: string;
  gitlabGroup: string;
  gitlabProject?:string
  id?: number;
  experiments: Array<Experiment>
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
  
  constructor(
    id: string,
    slug: string,
    url: string,
    ownerId: string,
    gitlabGroup: string,
    experiments: Array<Experiment>,
  ) {
    super();
    this.backendId = id;
    this.slug = slug;
    this.url = url;
    this.ownerId = ownerId;
    this.gitlabGroup = gitlabGroup;
    this.experiments = experiments;
  }
}
export default interface MLProject {
  backendId?: string;
  slug: string;
  url: string;
  ownerId: string;
  gitlabNamespace?: string;
  gitlabPath?: string,
  gitlabId?: number;
}
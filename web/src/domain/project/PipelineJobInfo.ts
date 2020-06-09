export default class PipelineJobInfo {   
  private id: number;
  private ref: string;
  private commitSha: string;
  private createdAt: string | null | undefined;
  private committedAt: string | null | undefined;
  private startedAt: string | null | undefined;
  private updatedAt: string | null | undefined;
  private finishedAt: string | null | undefined;

  constructor(
    id: number,
    ref: string,
    commitSha: string,
    createdAt: string | null | undefined,
    committedAt: string | null | undefined,
    startedAt: string | null | undefined,
    updatedAt: string | null | undefined,
    finishedAt: string | null | undefined
  ) {
    this.id = id;
    this.ref = ref;
    this.commitSha = commitSha;
    this.createdAt = createdAt;
    this.committedAt = committedAt;
    this.startedAt = startedAt;
    this.updatedAt = updatedAt;
    this.finishedAt = finishedAt;
  }
}
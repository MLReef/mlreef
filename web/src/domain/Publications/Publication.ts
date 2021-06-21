import { Expose } from 'class-transformer';
import Environment from './Environment';

class Publication {
  @Expose() id: string = '';

  @Expose() projectId: string = '';

  @Expose() branch: string = '';

  @Expose() version: string = '';

  @Expose() scriptPath: string = '';

  @Expose() environment: Environment = new Environment();

  @Expose() modelType: string = '';

  @Expose() name: string = '';

  @Expose() slug: string = '';

  @Expose() description: string = '';

  @Expose() commitSha: string = '';

  @Expose() publishedAt: string = '';

  @Expose() jobStartedAt: string = '';

  @Expose() jobFinishedAt: string = '';

  @Expose() publishedBy: string = '';

  @Expose() status: string = '';

  @Expose() gitlabPipelineId: number = -1;

  @Expose() entryFile: string = '';

  @Expose() user: Object = {};

  @Expose() pipeline: Object = {};
}

export default Publication;

import ParameterInstance from './ParameterInstance';

export default class DataProcessorInstance {
  private slug: string;
  private parameters: Array<ParameterInstance>;
  private id: string;
  private name: string;

  constructor(
    slug: string,
    parameters: Array<ParameterInstance>,
    id: string,
    name: string
  ) {
    this.slug = slug;
    this.parameters = parameters;
    this.id = id;
    this.name = name;
  }
}
export default class ParameterInstance {
  private name: string;
  private value: string;
  private type: string | null | undefined;
  private required: Boolean;
  private description: string;

  constructor(    
    name: string,
    value: string,
    type: string,
    required: Boolean,
    description: string
  ) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.required = required;
    this.description = description;
  }
}
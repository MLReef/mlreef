export default class FileToUpload {
  private id: String;
  private name: String;
  private content: any;
  private size: Number = 0;
  private type: String;
  private progress: Number = 0;
  public isValid: Boolean = true;

  constructor(id: String, name: String, size: Number, type: String, isValid: Boolean){
    this.id = id;
    this.name = name;
    this.size = size;
    this.type = type;
    this.isValid = isValid;
  }
  
  public setId = (id: String) => this.id = id;
  public getId = () => this.id;

  public setName = (name: String) => this.name = name;
  public getName = () => this.name;

  public setContent = (content: any) => this.content = content;
  public getContent = () => this.content;

  public setSize = (size: Number) => this.size = size;
  public getSize = () => this.size;

  public setType = (type: String) => this.type = type;
  public getType = () => this.type;

  public setProg = (p: Number) => this.progress = p;
  public getProg = () => this.progress;
  
}
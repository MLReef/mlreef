import { colorsForCharts } from "../../dataTypes";

export default class Experiment {
  private id: string;
  private dataProjectId: string;
  private dataInstanceId: string | null | undefined;
  private slug: string;
  private name: string;
  private sourceBranch: string;
  private targetBranch: string;
  private status: string;
  private pipelineJobInfo?: any;
  private postProcessing: Array<any>;
  private processing?: any;
  private epochs?: Array<any>;
  private jsonBlob: string = ""; // structure: {"1": {"acc": 0.198, "val_acc": 0.098, "loss": 2.802, "val_loss": 2.802}};
  private paramNames: Array<string> = [];
  private authorName?: string;

  constructor(
    id: string,
    dataProjectId: string,
    dataInstanceId: string,
    slug: string,
    name: string,
    sourceBranch: string,
    targetBranch: string,
    status: string,
    pipelineJobInfo: any,
    postProcessing: any,
    processing: any,
    jsonBlob: string,
  ) {
    this.id = id;
    this.dataProjectId = dataProjectId;
    this.dataInstanceId = dataInstanceId;
    this.slug = slug;
    this.name = name;
    this.sourceBranch = sourceBranch;
    this.targetBranch = targetBranch;
    this.status = status;
    this.pipelineJobInfo = pipelineJobInfo;
    this.postProcessing = postProcessing;
    this.processing = processing;
    this.jsonBlob = jsonBlob;

  }

  public fromBlobToEpochs(jsonBlob: string) {
    if(jsonBlob === ""){
      throw new Error("No experiment statistics yet");
    }
    this.jsonBlob = jsonBlob;
    this.epochs = Object.values(JSON.parse(this.jsonBlob));
    this.generateParamsFromEpochs();
  }

  generateParamsFromEpochs(){
    if(this.epochs){
      this.paramNames = Object.keys(this.epochs[0]).map((key: string) => key);
    }
  }

  public generateAverageInformation(): any {
    const epLength = this.epochs?.length;
    if(!epLength){
      throw Error("Not initialized info");
    }
    return this.paramNames.map((param: string) => {
      const result = this.extractSpecificParamValueFromEpochs(param);
      const resultObj = {
        name: param, 
        value: 0
      }

      if(!result) return resultObj;
      
      resultObj.value = result.reduce((valA: number, valB: number) => valA + valB) / epLength;
      return resultObj;
    })
  }

  public generateChartInformation(): any {
    return this.paramNames.map((param, index) => ({
      label: param,
      fill: false,
      pointRadius: 0,
      backgroundColor: colorsForCharts[index],
      borderColor: colorsForCharts[index],
      lineTension: 0,
      data: this.extractSpecificParamValueFromEpochs(param),
    }))
  }
  
  extractSpecificParamValueFromEpochs = (param: string) => this.epochs?.map((ep) => ep[param]);

  public getEpochs() : Array<any> | undefined {
    return this.epochs;
  }

}

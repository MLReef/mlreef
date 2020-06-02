import { colorsForCharts } from "../../dataTypes";

export default class Experiment {
  private epochs?: Array<any>;
  private jsonBlob: string = ""; // structure: {"1": {"acc": 0.198, "val_acc": 0.098, "loss": 2.802, "val_loss": 2.802}};
  private paramNames: Array<string> = [];

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
      Object.keys(this.epochs[0]).forEach((key: string) => {
        this.paramNames.push(key);
      });}
  }

  public generateAverageInformation(): any {
    const epLength = this.epochs?.length;
    if(!epLength){
      throw Error("Not initialized info");
    }
    return this.paramNames.map((param: string) => {
      const result = this.extractSpecificParamValueFromEpochs(param);
      if(!result){
        return {
          name: `avg - ${param}`, 
          value: 0
        }
      }
      return {
        name: `avg - ${param}`, 
        value: result.reduce((valA: number, valB: number) => valA + valB)
            / epLength
      }
    })
  }

  public generateChartInformation(): any {
    return this.paramNames.map((param, index) => ({
      label: param,
      fill: false,
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
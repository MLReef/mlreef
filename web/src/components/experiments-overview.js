import React, {Component} from "react";
import ReactDOM from 'react-dom';
import Navbar from "./navbar/navbar";
import ProjectContainer from "./projectContainer";
import "../css/experiments-overview.css";
import $ from "jquery";
import traiangle01 from './../images/triangle-01.png';
import { Line } from "react-chartjs-2";
import { connect } from "react-redux";
import ArrowButton from "./arrow-button/arrow-button";

const Running = "Running";
const Open = "Open";
const Completed = "Completed";
const Aborted = "Aborted";

const DataCard = ({title, linesOfContent}) => <div className="data-card">
    <div className="title">
        <p><b>{title}</b></p>
    </div>
    <div>
        {   
            linesOfContent.map((line) => 
                <p className="line"> {line}</p>
            )
        }
    </div>
</div>

class ExperimentCard extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            showChart: false,
            chartDivId: new Date().getTime()
        }
        
        this.handleArrowDownButtonClick = this.handleArrowDownButtonClick.bind(this);
    }

    getButtonsDiv(experimentState, index){
        let buttons;
        switch (experimentState) {
            case Running:
                buttons = [<ArrowButton imgPlaceHolder={traiangle01} callback={this.handleArrowDownButtonClick} params={{"ind": index}}/>, <button className="dangerous-red"> <b> Abort </b></button>];    
                break;
            case Open:
                buttons = [<ArrowButton imgPlaceHolder={traiangle01} callback={this.handleArrowDownButtonClick} params={{"ind": index}}/>, <button className="dangerous-red"> <b>X</b> </button>,
                    <button className="light-green-button experiment-button non-active-black-border"> <b>Resume</b> </button>
                ];
                break;
            case Completed:
                buttons = [<ArrowButton imgPlaceHolder={traiangle01} callback={this.handleArrowDownButtonClick} params={{"ind": index}}/>, <button className="dangerous-red"> <b>X</b> </button>,
                    <button className="light-green-button experiment-button non-active-black-border"> <b>Deploy</b> </button>
                ];
                break;
            case Aborted:
                buttons = [<ArrowButton imgPlaceHolder={traiangle01} callback={this.handleArrowDownButtonClick} params={{"ind": index}}/>, <button className="dangerous-red"> <b>X</b> </button>];
                    break;
            default:
                break;
        }
        
        return (
            <div className="buttons-div">
                {buttons}
            </div>
        )
    }

    handleArrowDownButtonClick(e, params){
        const index = params.ind;
        const exp = this.props.params.experiments[index];
        const newState = this.state;
        const chartDiv = document.getElementById(this.state.chartDivId);
        const cardResults = `${this.state.chartDivId}-Idcard-results-${index}`;
        
        newState.showChart = !this.state.showChart;
        this.setState(
            newState
        );
        if(exp.data && newState.showChart){
             chartDiv.parentNode.childNodes[1].style.display = "unset";
             $(`#${cardResults}`).css("display", "flex");
             ReactDOM.render(
                <div>
                    <Line data={exp.data} height={50} />
                </div>,
                chartDiv
            )
        }else { 
            $(`#${cardResults}`).css("display", "none");
            chartDiv.parentNode.childNodes[1].style.display = "none";
            ReactDOM.unmountComponentAtNode(chartDiv);
        }
    }

    render(){
        const params = this.props.params;
        const chartDivId = this.state.chartDivId;

        return (
            <div className="experiment-card">
                <div className="header">
                    <div className="title-div">
                        <p> <b>{params.currentState}</b> </p>
                    </div>
                    <div className="select-div">
                        <select>
                            <option value="">
                                Sort by
                            </option>
                        </select>
                    </div>
                </div>

                {params.experiments.map((experiment, index) => {
                    let modelDiv = "inherit";
                    let progressVisibility = "inherit";
                    if(!experiment.percentProgress){
                        modelDiv = "hidden";
                    }
                    if(!experiment.modelTitle){
                        progressVisibility = "hidden";
                    }
                    return (
                        <div className="card-content">
                            <div className="summary-data">
                                <div className="project-desc-experiment">
                                    <p>
                                        <b>{experiment.descTitle}</b>
                                    </p>
                                    <p>
                                        Created by <b>{experiment.userName}</b>&nbsp;{experiment.timeCreatedAgo}
                                    </p>
                                </div>
                                <div className="project-desc-experiment" style={{visibility: progressVisibility}}>
                                    <p>
                                        <b>{experiment.percentProgress}% completed</b>
                                    </p>
                                    <p>
                                        ETA: {experiment.eta} hours
                                    </p>
                                </div>
                                <div className="project-desc-experiment" style={{visibility: modelDiv}}>
                                    <p>
                                        Model: <b>{experiment.modelTitle}</b>
                                    </p>
                                    <p>
                                        {experiment.averageParams
                                            .filter(avgParam => avgParam.showBellowModel)
                                            .map(avgParam => `${avgParam.name}: ${avgParam.value}`)
                                        }
                                    </p>
                                </div>
                                {this.getButtonsDiv(experiment.currentState, index)}
                            </div>
                            <div className="data-summary">
                                <div className="chart-container" id={chartDivId}></div>
                                <div className="content">
                                    <p><b>Performace achieved from last epoch:</b></p>
                                    {
                                        experiment.averageParams.map((opt) => 
                                            <p> {`${opt.name}: ${opt.value}`} </p>
                                        ) 
                                    }
                                </div>
                            </div>
                            <div className="card-results" id={`${chartDivId}-Idcard-results-${index}`}>
                                <DataCard title="Data" linesOfContent={["17.215 files selected", "Data instance: DI_pipeline_2", "op1: augmentation", "op2: random crop", "op3: random rotate"]}/>
                                <DataCard title="Algorithm" linesOfContent={["17.215 files selected", "Data instance: DI_pipeline_2", "op1: augmentation", "op2: random crop", "op3: random rotate"]}/>
                                <DataCard title="Training" linesOfContent={["17.215 files selected", "Data instance: DI_pipeline_2", "op1: augmentation", "op2: random crop", "op3: random rotate"]}/>
                            </div>
                        </div>)
                    })
                }
            </div>
        )
    }
}


class ExperimentsOverview extends Component {
    handleButtonsClick(e){
        e.target.parentNode.childNodes.forEach(childNode => {
            if(childNode.id !== e.target.id){
                childNode.classList.remove("active-border-light-blue");
                childNode.classList.add("non-active-black-border");
            }
        });
        e.target.classList.add("active-border-light-blue");
        e.target.classList.remove("non-active-black-border");
    }
    
    render(){
        const project = this.props.project;
        return(
            <div id="experiments-overview-container">
                <Navbar />
                <ProjectContainer project activeFeature="experiments" folders = {['Group Name', project.name, 'Data', 'Experiments']}/>
                <br/>
                <br/>
                <div className="main-content">
                    <br />
                    <div id="line"/>
                    <br />
                        <div id="buttons-container">
                            <button id="all" className="non-active-black-border experiment-button" onClick={(e) => this.handleButtonsClick(e)}>All</button>
                            <button id="running" className="non-active-black-border experiment-button" onClick={(e) => this.handleButtonsClick(e)}>Running</button>
                            <button id="open" className="non-active-black-border experiment-button" onClick={(e) => this.handleButtonsClick(e)}>Open</button>
                            <button id="completed" className="non-active-black-border experiment-button" onClick={(e) => this.handleButtonsClick(e)}>Completed</button>
                            <button id="aborted" className="non-active-black-border experiment-button" onClick={(e) => this.handleButtonsClick(e)}>Aborted</button>
                            <button id="new-experiment" className="light-green-button experiment-button"><b>New experiment</b></button>
                        </div>
                    <ExperimentCard params={
                            {
                                "currentState": Open,
                                "experiments": [ 
                                    {
                                        "currentState": Open, "descTitle": "EX_ProjectShort_3", "userName": "User","percentProgress": "49",  "eta": "2", 
                                        "modelTitle": "Inception_V3", "timeCreatedAgo": "7 hours",
                                        "averageParams": [
                                            {name: "val_acc", value: "0.82", showBellowModel: true},
                                            {name: "t_acc", value: "0.98"},
                                            {name: "val_loss", value: "0.23"},
                                            {name: "train_locc", value: "0.14"}
                                        ],
                                        "data": {
                                                labels: ["", "", "", "", "", "", "", "", "", ""],
                                                datasets: [{
                                                    label: "val_acc",
                                                    fill: false,
                                                    backgroundColor: '#f5544d',
                                                    borderColor: '#f5544d',
                                                    lineTension: 0,
                                                    data: [0.9, 0.8, 0.8, 0.9, 0.7, 0.5, 0.6, 0.8, 0.4, 0.1]
                                                },
                                                {
                                                    label: "val_loss",
                                                    fill: false,
                                                    borderColor: '#2db391',
                                                    backgroundColor: '#2db391',
                                                    lineTension: 0,
                                                    data: [0.1, 0.2, 0.4, 0.3, 0.4, 0.45, 0.6, 0.8, 0.9, 0.9]
                                                }
                                            ]
                                        }
                                    } 
                                ]
                            }
                        }
                    />

                    <ExperimentCard params={
                            {
                                "currentState": Open,
                                "experiments": [ 
                                    {
                                        "currentState": Open, "descTitle": "EX_ProjectShort_2", "userName": "User","percentProgress": "49",  "eta": "2", 
                                        "modelTitle": "Inception_V4", "timeCreatedAgo": "8 hours",
                                        "averageParams": [
                                        ],
                                        "data": {
                                                labels: ["", "", "", "", "", "", "", "", "", ""],
                                                datasets: [{
                                                    label: "val_acc",
                                                    fill: false,
                                                    backgroundColor: '#f5544d',
                                                    borderColor: '#f5544d',
                                                    lineTension: 0,
                                                    data: []
                                                },
                                                {
                                                    label: "val_loss",
                                                    fill: false,
                                                    borderColor: '#2db391',
                                                    backgroundColor: '#2db391',
                                                    lineTension: 0,
                                                    data: []
                                                }
                                            ]
                                        }
                                    } 
                                ]
                            }
                        }
                    />
                </div>
                <br />
                <br />
            </div>
    )}
}

function mapStateToProps(state){
    return {
        project: state.project
    };
}

export default connect(mapStateToProps)(ExperimentsOverview);

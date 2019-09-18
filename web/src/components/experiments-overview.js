import React, {Component} from "react";
import ReactDOM from 'react-dom';
import Navbar from "./navbar/navbar";
import ProjectContainer from "./projectContainer";
import "../css/experiments-overview.css";
import $ from "jquery";
import traiangle01 from './../images/triangle-01.png';
import {Line} from "react-chartjs-2";
import {connect} from "react-redux";
import ArrowButton from "./arrow-button/arrow-button";
import { Link } from "react-router-dom";

const Running = "Running";
const Open = "Open";
const Completed = "Completed";
const Aborted = "Aborted";

const DataCard = ({ title, linesOfContent }) => <div className="data-card">
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
</div>;

class ExperimentCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showChart: false,
            chartDivId: new Date().getTime()
        };

        this.handleArrowDownButtonClick = this.handleArrowDownButtonClick.bind(this);
    }

    getButtonsDiv(experimentState, index) {
        let buttons;
        switch (experimentState) {
            case Running:
                buttons = [
                    <ArrowButton imgPlaceHolder={traiangle01}
                                 callback={this.handleArrowDownButtonClick}
                                 params={{"ind": index}}
                    />,
                    <button className="dangerous-red"><b> Abort </b></button>];
                break;
            case Open:
                buttons = [
                    <ArrowButton imgPlaceHolder={traiangle01}
                                 callback={this.handleArrowDownButtonClick}
                                 params={{"ind": index}}
                    />,
                    <button className="dangerous-red"><b>X</b></button>,
                    <button className="light-green-button experiment-button non-active-black-border"><b>Resume</b>
                    </button>
                ];
                break;
            case Completed:
                buttons = [
                    <ArrowButton imgPlaceHolder={traiangle01}
                                 callback={this.handleArrowDownButtonClick}
                                 params={{"ind": index}}
                    />,
                    <button className="dangerous-red"><b>X</b></button>,
                    <button className="light-green-button experiment-button non-active-black-border">
                        <b>Deploy</b>
                    </button>
                ];
                break;
            case Aborted:
                buttons = [
                    <ArrowButton imgPlaceHolder={traiangle01}
                                 callback={this.handleArrowDownButtonClick}
                                 params={{"ind": index}}
                    />,
                    <button className="dangerous-red"><b>X</b></button>];
                break;
            default:
                break;
        }

        return (<div className="buttons-div">{buttons}</div>)
    }

    handleArrowDownButtonClick(e, params) {
        const index = params.ind;
        const exp = this.props.params.experiments[index];
        const newState = this.state;
        const chartDiv = document.getElementById(this.state.chartDivId);
        const cardResults = `${this.state.chartDivId}-Idcard-results-${index}`;

        newState.showChart = !this.state.showChart;
        this.setState(
            newState
        );
        if (exp.data && newState.showChart) {
            chartDiv.parentNode.childNodes[1].style.display = "unset";
            $(`#${cardResults}`).css("display", "flex");
            ReactDOM.render(
                <div>
                    <Line data={exp.data} height={50}/>
                </div>,
                chartDiv
            )
        } else {
            $(`#${cardResults}`).css("display", "none");
            chartDiv.parentNode.childNodes[1].style.display = "none";
            ReactDOM.unmountComponentAtNode(chartDiv);
        }
    }

    render() {
        const params = this.props.params;
        const chartDivId = this.state.chartDivId;

        return (
            <div className="experiment-card">
                <div className="header">
                    <div className="title-div">
                        <p><b>{params.currentState}</b></p>
                    </div>
                    <div className="select-div">
                        <select>
                            <option value="">Sort by</option>
                        </select>
                    </div>
                </div>

                {params.experiments.map((experiment, index) => {
                    let modelDiv = "inherit";
                    let progressVisibility = "inherit";
                    if (!experiment.percentProgress) {
                        modelDiv = "hidden";
                    }
                    if (!experiment.modelTitle) {
                        progressVisibility = "hidden";
                    }
                    return (
                        <div className="card-content">
                            <div className="summary-data">
                                <div className="project-desc-experiment">
                                    <p><b>{experiment.descTitle}</b></p>
                                    <p>Created by <b>{experiment.userName}</b><br/>
                                        {experiment.timeCreatedAgo} ago
                                    </p>
                                </div>
                                <div className="project-desc-experiment" style={{visibility: progressVisibility}}>
                                    <p><b>{experiment.percentProgress}% completed</b></p>
                                    <p>ETA: {experiment.eta} hours</p>
                                </div>
                                <div className="project-desc-experiment" style={{visibility: modelDiv}}>
                                    <p>Model: <b>{experiment.modelTitle}</b></p>
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
                                <div className="chart-container" id={chartDivId}/>
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
                                <DataCard title="Data" linesOfContent={[
                                    "10000 files selected",
                                    "Data instance: DL_pipeline_1",
                                    "op1: Augment",
                                    "op2: Random Crop",
                                    "op3: Rotate"]}
                                />
                                <DataCard title="Algorithm" linesOfContent={[
                                    "30 files selected",
                                    "Data instance: ML-cycle-3",
                                    "op1: Speckle Filter",
                                    "op2: Random Crop",
                                    "op3: Augment"]}
                                />
                                <DataCard title="Training" linesOfContent={[
                                    "32500 files selected",
                                    "Data instance: Pipeline_DeepLearning_SAR",
                                    "op1: Speckle Filter",
                                    "op2: Tile to Size",
                                    "op3: Rotate"]}/>
                            </div>
                        </div>)
                })
                }
            </div>
        )
    }
}


class ExperimentsOverview extends Component {
    constructor(props) {
        super(props);
        const project = this.props.projects.selectedProject;

        this.state = {
            project: project
        };
    }

    handleButtonsClick(e) {
        e.target.parentNode.childNodes.forEach(childNode => {
            if (childNode.id !== e.target.id) {
                childNode.classList.remove("active-border-light-blue");
                childNode.classList.add("non-active-black-border");
            }
        });
        e.target.classList.add("active-border-light-blue");
        e.target.classList.remove("non-active-black-border");
    }

    render() {
        const project = this.state.project;
        return (
            <div id="experiments-overview-container">
                <Navbar/>
                <ProjectContainer project={project}
                                  activeFeature="experiments"
                                  folders={['Group Name', project.name, 'Data', 'Experiments']}
                />
                <br/>
                <br/>
                <div className="main-content">
                    <br/>
                    <div id="line"/>
                    <br/>
                    <div id="buttons-container">
                        <button id="all" className="non-active-black-border experiment-button"
                                onClick={(e) => this.handleButtonsClick(e)}>
                            All
                        </button>
                        <button id="running" className="non-active-black-border experiment-button"
                                onClick={(e) => this.handleButtonsClick(e)}>
                            Running
                        </button>
                        <button id="open" className="non-active-black-border experiment-button"
                                onClick={(e) => this.handleButtonsClick(e)}>
                            Open
                        </button>
                        <button id="completed" className="non-active-black-border experiment-button"
                                onClick={(e) => this.handleButtonsClick(e)}>
                            Completed
                        </button>
                        <button id="aborted" className="non-active-black-border experiment-button"
                                onClick={(e) => this.handleButtonsClick(e)}>Aborted
                        </button>                            
                        <Link 
                            id="new-experiment" 
                            to={`/my-projects/${project.id}/new-experiment`}
                            style={{height: '0.2em'}} 
                            className="light-green-button experiment-button">
                            <b>
                                New experiment
                            </b>
                        </Link>
                    </div>
                    <ExperimentCard params={
                            {
                                "currentState": Completed,
                                "experiments": [
                                    {
                                        "currentState": Completed,
                                        "descTitle": "UNET_SARData",
                                        "userName": "Camillo Pachmann",
                                        "percentProgress": "100",
                                        "eta": "0",
                                        "modelTitle": "Inception_V3",
                                        "timeCreatedAgo": "7 hours",
                                        "averageParams": [
                                            {name: "Validation Accuracy", value: "0.91", showBellowModel: true},
                                            {name: "Training Accuracy", value: "0.93"},
                                            {name: "Validation Loss", value: "0.32"},
                                            {name: "Training Loss", value: "0.28"}
                                        ],
                                        "data": {
                                                labels: ["", "", "", "", "", "", "", "", "", ""],
                                                datasets: [{
                                                    label: "Validation Accuracy",
                                                    fill: false,
                                                    backgroundColor: '#f5544d',
                                                    borderColor: '#f5544d',
                                                    lineTension: 0,
                                                    data: [0.8491, 0.8513, 0.8699, 0.8950, 0.9023, 0.9064, 0.9077, 0.9120, 0.9140, 0.9100]
                                                },
                                                {
                                                    label: "Training Accuracy",
                                                    fill: false,
                                                    borderColor: '#2db391',
                                                    backgroundColor: '#2db391',
                                                    lineTension: 0,
                                                    data: [0.8530, 0.8673, 0.8702, 0.8791, 0.8828, 0.8953, 0.9056, 0.9147, 0.9223, 0.9310]
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
                                "currentState": Completed,
                                "experiments": [ 
                                    {
                                        "currentState": Completed,
                                        "descTitle": "HAM10000_ShallowTrain_1",
                                        "userName": "Vaibhav Mehotra",
                                        "percentProgress": "100",
                                        "eta": "0",
                                        "modelTitle": "Inception_V4",
                                        "timeCreatedAgo": "2 Weeks",
                                        "averageParams": [
                                            {name: "Validation Accuracy", value: "0.86", showBellowModel: true},
                                            {name: "Training Accuracy", value: "0.89"},
                                            {name: "Validation Loss", value: "0.43"},
                                            {name: "Training Loss", value: "0.35"}
                                        ],
                                        "data": {
                                            labels: ["", "", "", "", "", "", "", "", "", ""],
                                            datasets: [{
                                                label: "Validation Accuracy",
                                                fill: false,
                                                backgroundColor: '#f5544d',
                                                borderColor: '#f5544d',
                                                lineTension: 0,
                                                data: [0.5931, 0.6113, 0.6320, 0.6476, 0.6511, 0.6589, 0.6700, 0.6781, 0.6880, 0.6969, 0.7080, 0.7129, 0.7357, 0.7459, 0.7655, 0.7700, 0.7835, 0.7938, 0.8119, 0.8299, 0.8365, 0.8412, 0.8475, 0.8520, 0.8660]
                                            },
                                                {
                                                    label: "Training Accuracy",
                                                    fill: false,
                                                    borderColor: '#2db391',
                                                    backgroundColor: '#2db391',
                                                    lineTension: 0,
                                                    data: [0.6431, 0.6450, 0.6500, 0.6570, 0.6590, 0.67, 0.6881, 0.6919, 0.7050, 0.7124, 0.7229, 0.7388, 0.75, 0.7588, 0.77, 0.78, 0.8110, 0.8302, 0.8442, 0.8720, 0.8830, 0.8850, 0.8850, 0.8850, 0.89]
                                                }
                                            ]
                                        }
                                    } 
                                ]
                            }
                        }
                    />
                </div>
                <br/>
                <br/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        projects: state.projects
    };
}

export default connect(mapStateToProps)(ExperimentsOverview);

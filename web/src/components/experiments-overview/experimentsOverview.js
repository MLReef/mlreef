import React, {Component} from "react";
import ReactDOM from 'react-dom';
import Navbar from "../navbar/navbar";
import ProjectContainer from "../projectContainer";
import "./experimentsOverview.css";
import $ from "jquery";
import traiangle01 from './../../images/triangle-01.png';
import {Line} from "react-chartjs-2";
import {connect} from "react-redux";
import ArrowButton from "../arrow-button/arrowButton";
import {Link} from "react-router-dom";
import filesApi from "../../apis/FilesApi";
import snippetApi from "../../apis/SnippetApi";
import pipelinesApi from "../../apis/PipelinesApi";
import {
    getTimeCreatedAgo,
    generateSummarizedInfo
} from "../../functions/dataParserHelpers";
import {
    colorsForCharts,
    SKIPPED,
    RUNNING,
    SUCCESS,
    CANCELED,
    FAILED,
    PENDING,
    filesForExperimentsDetails
} from '../../dataTypes';
import {toastr} from 'react-redux-toastr';
import ExperimentDetails from './../experiment-details/experimentDetails';
import uuidv1 from 'uuid/v1';

const DataCard = ({title, linesOfContent}) => <div className="data-card">
    <div className="title">
        <p><b>{title}</b></p>
    </div>
    <div>
        {linesOfContent.map((line, index) => {
                const lineContent = line.startsWith("*")
                    ? <b>{line.replace("*", "")}</b>
                    : line;
                return <p key={`data-card-${title}-line-cont-${index}`} className="line">{lineContent}</p>;
            }
        )}
    </div>
</div>;

class ExperimentCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showChart: false,
            chartDivId: new Date().getTime(),
            experiments: this.props.params.experiments
        };

        this.handleArrowDownButtonClick = this.handleArrowDownButtonClick.bind(this);
    }

    getButtonsDiv(experimentState, index) {
        let buttons;
        const uniqueCode = uuidv1();
        const arrowBtn = <ArrowButton
            imgPlaceHolder={traiangle01}
            callback={this.handleArrowDownButtonClick}
            params={{"ind": index}}
            id={`ArrowButton-${index}`}
            key={`ArrowButton-${uniqueCode}-${index}`}
        />
        if (experimentState === RUNNING || experimentState === PENDING) {
            buttons = [
                arrowBtn,
                <button key={`dangerous-red-${uniqueCode}`} className="dangerous-red" style={{width: 'max-content'}}><b> Abort </b></button>
            ];
        } else if (experimentState === SKIPPED) {
            buttons = [
                arrowBtn,
                <button key={`dangerous-red-${uniqueCode}`} className="dangerous-red"><b>X</b></button>,
                <button
                    key={`deploy-${uniqueCode}`}
                    className="light-green-button experiment-button non-active-black-border"
                    style={{width: '100px'}}
                ><b>Resume</b>
                </button>
            ];
        } else if (experimentState === SUCCESS || experimentState === FAILED) {
            buttons = [
                arrowBtn,
                <button key={`dangerous-red-${uniqueCode}`} className="dangerous-red"><b>X</b></button>,
                <button
                    key={`deploy-${uniqueCode}`}
                    className="light-green-button experiment-button non-active-black-border"
                    style={{width: '100px'}}
                >
                    <b>Deploy</b>
                </button>
            ];
        } else if (experimentState === CANCELED) {
            buttons = [
                arrowBtn,
                <button key={`dangerous-red-${uniqueCode}`} className="dangerous-red"><b>X</b></button>
            ];
        }
        return (<div className="buttons-div">{buttons}</div>)
    }

    mapSummarizedInfoToDatasets = (summarizedInfo) => summarizedInfo.map(
        (epochObjectVal, index) => {
            const currentValueName = Object.keys(epochObjectVal)[0];
            const dataSet = {};

            dataSet["label"] = currentValueName;
            dataSet["fill"] = false;
            dataSet["backgroundColor"] = colorsForCharts[index];
            dataSet["borderColor"] = colorsForCharts[index];
            dataSet["lineTension"] = 0;
            dataSet["data"] = epochObjectVal[currentValueName];

            return dataSet;
        });

    parseDataAndRefreshChart(jsonExperimentFileParsed, index) {
        const chartDiv = document.getElementById(this.state.chartDivId);
        const cardResults = `${this.state.chartDivId}-Idcard-results-${index}`;
        const exp = this.state.experiments[index];
        const summarizedInfo = generateSummarizedInfo(jsonExperimentFileParsed);
        const dataSets = this.mapSummarizedInfoToDatasets(summarizedInfo);
        const labels = Object.keys(dataSets[0].data);
        const avgValues = Object.keys(summarizedInfo)
            .filter(sInfoItem => sInfoItem.startsWith("avg_"))
            .map(sInfoItem => {
                return {name: sInfoItem.substring(4, sInfoItem.length), value: summarizedInfo[sInfoItem]}
            });
        exp.data = {labels: labels, datasets: dataSets};
        exp.averageParams = avgValues;

        const newExperimentsArr = this.state.experiments;
        newExperimentsArr[index] = exp;
        this.setState({experiments: newExperimentsArr});
        if (exp.data) {
            chartDiv.parentNode.childNodes[1].style.display = "unset";
            $(`#${cardResults}`).css("display", "flex");
            ReactDOM.render(
                <div>
                    <Line data={exp.data} height={50}/>
                </div>,
                chartDiv
            )
        }
    }

    retrieveStatisticsFromApi = (index) =>
        snippetApi.getSnippetFile(
            this.props.params.project.id,
            this.state.experiments[index].descTitle.replace("/", "-"),
            "experiment.json",
            "gitlab.com"
        ).then(res => {
            this.parseDataAndRefreshChart(res, index);
            if (this.state.experiments[index].status === RUNNING
                || this.state.experiments[index].status === PENDING
            ) {
                setTimeout(() => {
                    this.retrieveStatisticsFromApi(index);
                }, 30000);
            }
        }).catch(
            err => {
                console.log(err)
                toastr.warning('Wait', 'No data has been generated for this experiment yet');
            }
        );

    handleArrowDownButtonClick(e, params) {
        const index = params.ind;
        const newState = this.state;
        const chartDiv = document.getElementById(this.state.chartDivId);
        const cardResults = `${this.state.chartDivId}-Idcard-results-${index}`;
        newState.showChart = !this.state.showChart;
        this.setState(
            newState
        );
        if (newState.showChart) {
            this.retrieveStatisticsFromApi(index);
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

                {this.state.experiments.map((experiment, index) => {
                    let modelDiv = "inherit";
                    let progressVisibility = "inherit";
                    if (!experiment.percentProgress) {
                        modelDiv = "hidden";
                    }
                    if (!experiment.modelTitle) {
                        progressVisibility = "hidden";
                    }
                    return (
                        <div 
                            key={`${experiment.timeCreatedAgo}-${experiment.descTitle}-${index}`} 
                            className="card-content"
                        >
                            <div className="summary-data">
                                <div className="project-desc-experiment">
                                    <button 
                                        onClick={() => {
                                            this.props.setSelectedExperiment(experiment);
                                        }}
                                        style={{
                                            border: 'none', 
                                            backgroundColor: 'transparent', 
                                            marginTop: 7, 
                                            padding: 0
                                        }}
                                    >
                                        <b>{experiment.descTitle}</b>
                                    </button>
                                    <p>Created by <b>{experiment.userName}</b><br/>
                                        {getTimeCreatedAgo(experiment.timeCreatedAgo)} ago
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
                                        experiment.averageParams.map((opt, index) =>
                                            <p key={`${opt.name}-${index}`}> {`${opt.name}: ${opt.value}`} </p>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="card-results" id={`${chartDivId}-Idcard-results-${index}`}>
                                <DataCard title="Data" linesOfContent={[
                                    "*3.245 files selected",
                                    "  from",
                                    "*data instance: DL_pipeline_1",
                                    "resulting from a data pipeline with",
                                    "*op1: Augment",
                                    "*op2: Random Crop",
                                    "*op3: Rotate",
                                    "sourced from",
                                    "*data branch: Master"
                                ]}
                                />
                                <DataCard title="Algorithm" linesOfContent={[
                                    "*Resnet 50",
                                    "from",
                                    "*branch: feature/3-layers",
                                    "authored by",
                                    "*Camillo 8 hours ago",
                                    "being",
                                    "*2 commits and 1 commit behind",
                                    "of its master branch"
                                ]}
                                />
                                <DataCard title="Training" linesOfContent={[
                                    "*10 epochs trained",
                                    "with",
                                    "*P: learning_r = 0.002",
                                    "*P: optimizer = adam",
                                    "*P: lr_decay = 0.0005",
                                    "*P: layers = 3",
                                    "*P: dropout = 0.5",
                                    "*P: alpha = 1",
                                ]}/>
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
            project: project,
            branches: [],
            experiments: [],
            selectedExperiment: null
        };

        this.setSelectedExperiment = this.setSelectedExperiment.bind(this);

        filesApi.getBranches("gitlab.com", project.id)
            .then(res => res.json())
            .then(response => {
                const branches = response.filter(branch => branch.name.startsWith("experiment"));
                pipelinesApi.getPipesByProjectId(project.id).then(res => {
                    const pipes = res.filter(pipe => pipe.status !== SKIPPED);
                    const experiments = branches.map(branch => {
                        const pipeBranch = pipes.filter(pipe => pipe.ref === branch.name)[0];
                        if (pipeBranch) {
                            const experiment = {};
                            experiment["status"] = pipeBranch.status;
                            experiment["name"] = branch.name;
                            experiment["authorName"] = branch.author_name;
                            experiment["commit"] = branch.commit;
                            return experiment;
                        }

                        return null;
                    });

                    this.setState({experiments: experiments});
                });
            });
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

    setSelectedExperiment = (experiment) =>
        this.setState({selectedExperiment: experiment});

    render() {
        const project = this.state.project;
        return (
            <div id="experiments-overview-container">
                <Navbar/>
                <ProjectContainer
                    project={project}
                    activeFeature="experiments"
                    folders={['Group Name', project.name, 'Data', 'Experiments']}
                />
                <br/>
                <br/>
                <div className="main-content">
                    {this.state.selectedExperiment === null && <>
                        <br/>
                        <div id="line"/>
                        <br/>
                    </>}
                    {this.state.selectedExperiment === null && <div id="buttons-container">
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
                            style={{height: '0.1em'}}
                            className="light-green-button experiment-button">
                            <b>
                                New experiment
                            </b>
                        </Link>
                    </div>}
                    {this.state.selectedExperiment === null && this.state.experiments.map((experiment, index) =>
                        experiment && <ExperimentCard 
                            key={`${experiment.name}-${index}`}
                            params={{
                                "project": project,
                                "currentState": experiment.status,
                                "experiments": [{
                                    "currentState": experiment.status,
                                    "descTitle": experiment.name,
                                    "userName": experiment.commit.author_name,
                                    "percentProgress": "100",
                                    "eta": "0",
                                    "modelTitle": "Resnet 50",
                                    "timeCreatedAgo": experiment.commit.created_at,
                                    "averageParams": [],
                                    "data": {}
                                }]
                            }}
                            setSelectedExperiment={this.setSelectedExperiment}
                        />
                    )}
                    {this.state.selectedExperiment && 
                        <ExperimentDetails 
                            setNullExperiment={this.setSelectedExperiment}
                            experiment={this.state.selectedExperiment} 
                            files={filesForExperimentsDetails}
                        />
                    }
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

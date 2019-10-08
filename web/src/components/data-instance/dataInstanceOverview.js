import React, { Component } from "react";
import Navbar from "../navbar/navbar";
import ProjectContainer from "../projectContainer";
import "./dataInstanceOverview.css";
import { connect } from "react-redux";
import filesApi from "../../apis/FilesApi";
import arrow_down_white_01 from "../../images/arrow_down_white_01.svg";
import { Instruction } from '../instruction/instruction';
import { getTimeCreatedAgo } from '../../functions/utilities';

const Active = "Active";
const Expired = "Expired";

class InstanceCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showChart: false,
        };
    }

    handleButtonsClick(e) {
        const branchName = encodeURIComponent(e.currentTarget.parentNode.parentNode.getAttribute("data-key"));
        const pId = this.props.params.experiments[0].projId;
        this.props.history.push(`/my-projects/${pId}/master/data-instances/${branchName}`)
    }

    handleEmptyClick(e) {
        return;
    }

    getButtonsDiv(experimentState) {
        let buttons;
        switch (experimentState) {
            case Active:
                buttons = [
                    <button className="non-active-black-border experiment-button"
                        onClick={(e) => this.handleEmptyClick(e)}>
                        View Pipeline
                    </button>,
                    <button className="dangerous-red"><b>X</b></button>,
                    <Dropdown />
                ];
                break;
            case Expired:
                buttons = [
                    <button className="non-active-black-border experiment-button"
                        onClick={(e) => this.handleEmptyClick(e)}>
                        View Pipeline
                    </button>];
                break;
            default:
                break;
        }

        return (<div className="buttons-div">{buttons}</div>)
    }

    render() {
        const params = this.props.params;
        return (
            <div className="experiment-card">
                <div className="header">
                    <div className="title-div">
                        <p><b>{params.currentState}</b></p>
                    </div>
                </div>

                {params.experiments.map((experiment, index) => {
                    let modelDiv = "inherit";
                    let progressVisibility = "inherit";
                    if (experiment.currentState === "Expired")
                        progressVisibility = "hidden"
                    return (
                        <div key={index} className="card-content">
                            <div className="summary-data" data-key={`${experiment.descTitle}`}>
                                <div className="project-desc-experiment">
                                    <p onClick={(e) => {
                                        experiment.currentState === "Expired"
                                            ? this.handleEmptyClick()
                                            : this.handleButtonsClick(e)
                                    }}
                                        style={{ cursor: "pointer" }}>
                                        <b>{experiment.descTitle}</b>
                                    </p>
                                    <p>Created by <b>{experiment.userName}</b><br />
                                        {experiment.timeCreatedAgo} ago
                                    </p>
                                </div>
                                <div className="project-desc-experiment" style={{ visibility: progressVisibility }}>
                                    <p><b>Use: 24GB</b></p>
                                    <p>Expires in:{experiment.expiration}</p>
                                </div>
                                <div className="project-desc-experiment" style={{ visibility: modelDiv }}>
                                    <p><b>24,051 files changed</b></p>
                                    <p>Id: {experiment.di_id ? experiment.di_id : "72fb5m"}</p>
                                </div>
                                {this.getButtonsDiv(experiment.currentState)}
                            </div>
                        </div>)
                })
                }
            </div>
        )
    }
}


class DataInstanceOverview extends Component {
    constructor(props) {
        super(props);
        const project = this.props.projects.selectedProject;

        this.state = {
            project: project,
            branches: []
        };
    }

    componentDidMount() {
        filesApi.getBranches("gitlab.com", this.state.project.id)
            .then(res => res.json())
            .then(response =>
                this.setState({ branches: response.filter(branch => branch.name.startsWith("data-pipeline")) })
            )
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

    hideInstruction = () =>
        document.getElementById("instruction-pipe-line").classList.add("invisible");

    render() {
        const project = this.state.project;
        return (
            <div id="experiments-overview-container">
                <Navbar />
                <ProjectContainer project={project}
                    activeFeature="data"
                    folders={['Group Name', project.name, 'Data', 'Instances']}
                />
                <Instruction
                    titleText={"Handling Data instances:"}
                    paragraph={
                        `A data instance is a reslt of an executed data pipeline, thus being a pre-processed data set. You can use these data sets
                        directly for training or to merge them into a data repository in order to permanently save the changes made.`
                    }
                />
                <div className="main-content">
                    <br />
                    <div id="line" />
                    <br />
                    <div id="buttons-container">
                        <button id="all" className="non-active-black-border experiment-button"
                            onClick={(e) => this.handleButtonsClick(e)}>
                            All
                        </button>
                        <button id="InProgress" className="non-active-black-border experiment-button"
                            onClick={(e) => this.handleButtonsClick(e)}>
                            In Progress
                        </button>
                        <button id="Active" className="non-active-black-border experiment-button"
                            onClick={(e) => this.handleButtonsClick(e)}>
                            Active
                        </button>
                        <button id="expired" className="non-active-black-border experiment-button"
                            onClick={(e) => this.handleButtonsClick(e)}>Expired
                        </button>
                    </div>

                    <InstanceCard params={
                        {
                            "currentState": Expired,
                            "experiments": [
                                {
                                    "currentState": Expired,
                                    "descTitle": "UNET_SARData",
                                    "userName": "Camillo Pachmann",
                                }
                            ]
                        }
                    }
                    />
                    {this.state.branches.map((item, index) => {
                        const timediff = getTimeCreatedAgo(item.commit.created_at);
                        return (
                            <InstanceCard key={index} history={this.props.history} params={
                                {
                                    "currentState": Active,
                                    "experiments": [
                                        {
                                            "currentState": Active,
                                            "di_id": item.commit.short_id,
                                            "descTitle": item.name,
                                            "userName": item.commit.author_name,
                                            "timeCreatedAgo": timediff,
                                            "expiration": timediff,
                                            "projId": this.state.project.id,
                                            "modelTitle": "Resnet-50",
                                        }
                                    ]
                                }
                            }
                            />
                        )
                    })}
                </div>
                <br />
                <br />
            </div>
        )
    }
}

function Dropdown() {
    const [state, setState] = React.useState(false);
    const node = React.useRef();

    const handleClickOutside = e => {
        if (node.current.contains(e.target)) {
            return;
        }
        setState(false);
    };

    React.useEffect(() => {
        if (state) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [state]);

    return (
        <>
            <button onClick={e => setState(!state)} ref={node} className="light-green-button experiment-button non-active-black-border">
                <span><b style={{ margin: "0 10px 10px 0" }}>Save</b></span>
                <img className="dropdown-white" src={arrow_down_white_01} alt="" />
            </button>
            {state &&
                <div className="save-instance">
                    <div
                        style={{ marginLeft: "25%", fontSize: "14px" }}>
                        <p>Save Data Instances</p>
                    </div>
                    <hr />
                    <div className="search-branch">
                        <div>
                            <p><b>New branch</b></p>
                            <p className="dull">Only new data is saved in new branch</p>
                        </div>
                        <div>
                            <p><b>Create Pull Request</b></p>
                            <p className="dull">New data and original data coexist in existing branch</p>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

function mapStateToProps(state) {
    return {
        projects: state.projects
    };
}

export default connect(mapStateToProps)(DataInstanceOverview);

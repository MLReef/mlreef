import React, { Component } from "react";
import Navbar from "../navbar/navbar";
import ProjectContainer from "../projectContainer";
import "./dataInstanceOverview.css";
import { connect } from "react-redux";
import arrow_down_white_01 from "../../images/arrow_down_white_01.svg";
import { Instruction } from '../instruction/instruction';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import DataInstancesDeleteModal from "../data-instances-delete-and-abort-modal/dataInstancesDeleteNAbortModal";
import pipelinesApi from "../../apis/PipelinesApi";
import {
    SKIPPED,
    RUNNING,
    SUCCESS,
    CANCELED,
    FAILED,
    PENDING,
} from '../../dataTypes';

const getStatusForDataInstance = (status) => {
    let mappedStatus = status;
    switch (status) {
        case RUNNING:
            mappedStatus = "In progress"
            break;
        case SUCCESS:
            mappedStatus = "Active"
            break;
        case CANCELED:
            mappedStatus = "Aborted"
            break;
        case PENDING:
            mappedStatus = "In progress"
            break;
    
        default:
            break;
    }

    return mappedStatus;
}
    
const InstanceCard = ({...props}) => {
    const params = props.params;

    function handleButtonsClick(e) {
        const branchName = encodeURIComponent(e.currentTarget.parentNode.parentNode.getAttribute("data-key"));
        const pId = props.params.experiments[0].projId;
        props.history.push(`/my-projects/${pId}/master/data-instances/${branchName}`)
    }

    function handleEmptyClick(e) {
        return;
    }

    function getButtonsDiv(experimentState) {
        let buttons;
        if (experimentState === RUNNING || experimentState === PENDING) {
            buttons = [
                <button 
                    className="dangerous-red" 
                    onClick={
                        () => props.setIsDeleteModalVisible(true, "abort")
                    }
                    style={{width: 'max-content'}}>
                        <b> Abort </b>
                    </button>
            ];
        }  else if (experimentState === SUCCESS || experimentState === FAILED || experimentState === CANCELED) {
            buttons = [
                <button className="non-active-black-border experiment-button"
                    onClick={(e) => handleEmptyClick(e)}>
                    View Pipeline
                </button>,
                <button 
                    onClick={
                        () => props.setIsDeleteModalVisible(true, "delete")
                    }
                    className="dangerous-red">
                        <b>
                            X
                        </b>
                </button>,
                <Dropdown />
            ];
        }

        return (
            <div className="buttons-div">{buttons}</div>
        )
    }

    return (
        <div className="experiment-card">
            <div className="header">
                <div className="title-div">
                    <p><b>{getStatusForDataInstance(params.currentState)}</b></p>
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
                                        ? handleEmptyClick()
                                        : handleButtonsClick(e)
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
                            { getButtonsDiv(experiment.currentState) }
                        </div>
                    </div>
                )
            })}
        </div>
    )
}


class DataInstanceOverview extends Component {
    constructor(props) {
        super(props);
        const project = this.props.projects.selectedProject;

        const branches = props.branches.filter(branch => branch.name.startsWith("data-pipeline"));
        this.state = {
            project: project,
            isDeleteModalVisible: false,
            dataInstances: [],
            typeOfMessage: null
        };

        pipelinesApi.getPipesByProjectId(project.id).then(res => {
            const pipes = res.filter(pipe => pipe.status !== SKIPPED);
            const dataInstances = branches.map(branch => {
                const pipeBranch = pipes.filter(pipe => pipe.ref === branch.name)[0];
                if (pipeBranch) {
                    const dataInstance = {};
                    dataInstance["status"] = pipeBranch.status;
                    dataInstance["name"] = branch.name;
                    dataInstance["authorName"] = branch.author_name;
                    dataInstance["commit"] = branch.commit;
                    return dataInstance;
                }

                return null;
            });
            this.setState({dataInstances: dataInstances});
        });
        this.setIsDeleteModalVisible = this.setIsDeleteModalVisible.bind(this);
    }

    setIsDeleteModalVisible = (isDeleteModalVisible, typeOfMessage) =>
        this.setState({
            isDeleteModalVisible: isDeleteModalVisible,
            typeOfMessage: typeOfMessage
        });

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
            <>
            <DataInstancesDeleteModal 
                isModalVisible={this.state.isDeleteModalVisible}
                setIsVisible={this.setIsDeleteModalVisible}
                typeOfMessage={this.state.typeOfMessage}
            />
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
                    {this.state.dataInstances
                        .filter(item => item !== null)
                        .map((item, index) => {
                        const timediff = getTimeCreatedAgo(item.commit.created_at);
                        return (
                            <InstanceCard 
                                key={index} 
                                history={this.props.history}
                                setIsDeleteModalVisible={this.setIsDeleteModalVisible}
                                params={{
                                    "currentState": item.status,
                                    "experiments": [{
                                        "currentState": item.status,
                                        "di_id": item.commit.short_id,
                                        "descTitle": item.name,
                                        "userName": item.commit.author_name,
                                        "timeCreatedAgo": timediff,
                                        "expiration": timediff,
                                        "projId": this.state.project.id,
                                        "modelTitle": "Resnet-50"
                                    }]
                                }}
                            />
                        )
                    })}
                </div>
                <br />
                <br />
            </div>
            </>
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
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };

    }, [state]);

    return (
        <>
            <button 
                onClick={e => setState(!state)} ref={node} 
                className="light-green-button experiment-button non-active-black-border">
                    <span>
                        <b style={{ margin: "0 10px 10px 0" }}>
                            Save
                        </b>
                    </span>
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
        projects: state.projects,
        branches: state.branches
    };
}

export default connect(mapStateToProps)(DataInstanceOverview);

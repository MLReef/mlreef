import React from "react";
import Navbar from "../navbar/navbar";
import ProjectContainer from "../projectContainer";
import folderIcon from "../../images/folder_01.svg";
import fileIcon from "../../images/file_01.svg";
import "./dataInstanceDetails.css";
import { connect } from "react-redux";

const DataInstanceDetails = ({...props}) => {
    const project = props.projects.selectedProject;
    const pipelineName = decodeURIComponent(props.match.params.di_name);
    const selectedPipeline = props.branches.filter(function (item) {
        return item.name === pipelineName
    });

    return (
        <div id="experiments-overview-container">
            <Navbar />
            <ProjectContainer project={project}
                activeFeature="data"
                folders={['Group Name', project.name, 'Data', 'Instances']}
            />
            <div className="main-content">
                <br />
                <div id="line" />
                <br />
                <div className="commit-per-date">
                    <div className="commit-header">
                        <p>Viewing</p>
                    </div>
                    {selectedPipeline && <div className="summary-data" style={{ display: "flex" }}>
                        <div className="project-desc-experiment">
                            <p><b>{pipelineName}</b></p>
                            <p>Created by <b>{selectedPipeline[0].commit.author_name}</b><br />
                                20 days ago
                            </p>
                        </div>
                        <div className="project-desc-experiment" style={{ visibility: "inherit" }}>
                            <p><b>Use: 24GB</b></p>
                            <p>Expires in: 2 days</p>
                        </div>
                        <div className="project-desc-experiment" style={{ visibility: "inherit" }}>
                            <p><b>24,051 files changed</b></p>
                            <p>Id: {selectedPipeline[0].commit.short_id}</p>
                        </div>
                        <button style={{ margin: "1.5em", cursor: "pointer", marginLeft: "auto" }} className="dangerous-red"><b>X</b></button>
                    </div>}
                </div>
                <br />
                <div className="files-container">
                    <table className="file-properties" id="file-tree">
                        <thead>
                            <tr className="title-row">
                                <th>
                                    <p id="paragraphName">Name</p>
                                </th>
                                <th>
                                    <p id="paragraphLastCommit">Last Commit</p>
                                </th>
                                <th>
                                    <p id="paragraphSize">Size(files)</p>
                                </th>
                                <th>
                                    <p id="paragraphLastUpdate">Last Update</p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <RenderFiles />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function RenderFiles() {
    return (
        <>
            <tr className="files-row">
                <td className="file-type">
                    <img src={folderIcon} alt="" />
                    src
            </td>
                <td>
                    {" "}
                    <p>Something</p>
                </td>
                <td>
                    <p>48Kb</p>{" "}
                </td>
                <td>
                    {" "}
                    <p> yesterday </p>{" "}
                </td>
            </tr>
            <tr className="files-row">
                <td className="file-type">
                    <img src={fileIcon} alt="" />
                    file01.jpg
                </td>
                <td>
                    {" "}
                    <p>Something</p>
                </td>
                <td>
                    <p>48Kb</p>{" "}
                </td>
                <td>
                    {" "}
                    <p> yesterday </p>{" "}
                </td>
            </tr>
        </>
    )
}

function mapStateToProps(state) {
    return {
        projects: state.projects,
        branches: state.branches
    };
}

export default connect(mapStateToProps)(DataInstanceDetails);

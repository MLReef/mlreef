import React from 'react';
import { connect } from "react-redux";
import * as fileActions from "../actions/fileActions";
import { Base64 } from "js-base64";
import { bindActionCreators } from "redux";

class ReadMeComponent extends React.Component {

    componentWillMount() {
        const projectId = this.props.projectId;
        const proj = this.props.projects.filter(proj => proj.id === parseInt(projectId))[0];
        this.setState({ project: proj })
        this.props.actions.getFileData("gitlab.com", projectId, "README.md", this.props.branch);
    }

    render() {
        const projectName = this.state.project.name;
        let fileContent = [];
        if (this.props.fileData.content) {
            fileContent = Base64.decode(this.props.fileData.content).split("\n");
        }
        return <div className="readme-container">
            <div className="readme-titlebar">
                <div className="readme-profile-pic"></div>
                <div className="readme-name">
                    <p id="readmeName"><b>README.md</b></p>
                </div>
            </div>

            <div className="readme-content-container">
                <div className="readme-content">
                    <p id="project-name-readme">{projectName}</p>
                    <div id="project-content-readme">
                        <table>
                            <tbody>
                                {fileContent.map(function (line, index) {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <p>{line}</p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        fileData: state.file,
        projects: state.projects
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(fileActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReadMeComponent);
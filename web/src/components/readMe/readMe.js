import React from 'react';
import marked from "marked";
import { connect } from "react-redux";
import "./readme.css"
import * as fileActions from "../../actions/fileActions";
import { Base64 } from "js-base64";
import { bindActionCreators } from "redux";

class ReadMeComponent extends React.Component {

    componentWillMount() {
        this.setState({ project: this.props.project })
        this.props.actions.getFileData("gitlab.com", this.props.project.id, "README.md", this.props.branch);
    }

    rawMarkup(content) {
        return { __html: marked(content, { sanitize: true }) };
    }


    render() {
        const projectName = this.state.project.name;
        let textContent;
        if (this.props.fileData.content) {
            textContent = Base64.decode(this.props.fileData.content);
        }
        return <div className="readme-container">
            <div className="readme-titlebar">
                <div className="readme-profile-pic"></div>
                <div className="readme-name">
                    <p id="readmeName"><b>README.md</b></p>
                </div>
            </div>

            <div className="readme-content-container readme-style">
                <div className="readme-content">
                    <p id="project-name-readme">{projectName}</p>
                    <div id="project-content-readme" dangerouslySetInnerHTML={textContent && this.rawMarkup(textContent)}>
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
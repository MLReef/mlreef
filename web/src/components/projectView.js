import React from 'react';
import { connect } from 'react-redux';
import ReadMeComponent from './../components/readMe'
import ProjectContainer from './projectContainer';
import FilesContainer from './files-container';
import RepoInfo from './repo-info';
import RepoFeatures from './repo-features';
import Navbar from './navbar/navbar';
import { bindActionCreators } from 'redux';
import * as fileActions from "./../actions/fileActions";
import "../css/index.css";

class ProjectView extends React.Component {
    state = {
        project: null
    }

    componentWillMount() {
        const project = this.props.projects.filter(proj => proj.id === parseInt(this.props.match.params.projectId))[0];
        this.setState({ project: project });
        this.props.actions.loadFiles(
            null,
            project.default_branch,
            this.props.match.params.projectId
        );
    }

    componentWillUpdate() {
        const projectId = window.location.href.split("/my-projects/")[1]

        if (this.state.project.id !== parseInt(projectId)) {
            const project = this.props.projects.filter(proj => proj.id === parseInt(projectId))[0];
            this.setState({
                project: project
            });
            this.props.actions.loadFiles(
                null,
                project.default_branch,
                projectId
            );
        }
    }

    render() {
        const files = this.props.files;
        const branch = this.state.project.default_branch;
        const projectName = this.state.project.name;
        return (<div className="project-component">
            <Navbar />
            <ProjectContainer project={this.state.project} activeFeature="data" folders={["Group Name", projectName, "Data"]} />
            <div className="main-content">
                <RepoInfo />
                <div className="last-commit-info">
                    <div className="last-commit-details">
                        <div className="last-commit-pic"></div>
                        <div className="last-commit-name">
                            Merged Branch <b>"branch_name"</b> into <b>"new_branch_name"</b><br />
                            by <b>user_name</b> authored <b>4_days_ago</b>
                        </div>
                    </div>

                    <div className="last-commit-id">
                        <p>PR_ID</p>
                    </div>
                </div>
                <RepoFeatures />
                <FilesContainer projectId={this.state.project.id} branch={branch} files={files} />
                <ReadMeComponent projectId={this.state.project.id} branch={branch} files={files} />
            </div>
        </div>)
    }
}

function mapStateToProps(state) {
    return {
        files: state.files,
        projects: state.projects,
        file: state.file
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(fileActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

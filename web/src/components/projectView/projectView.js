import React from 'react';
import { connect } from 'react-redux';
import ReadMeComponent from '../readMe/readMe'
import ProjectContainer from '../projectContainer';
import FilesContainer from '../filesContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import { bindActionCreators } from 'redux';
import * as fileActions from "../../actions/fileActions";
import * as projectActions from "../../actions/projectInfoActions";
import "./../../css/index.css";
import LoadingModal from "../loadingModal";
import contributorsApi from "./../../apis/contributorsApi";

class ProjectView extends React.Component {
    constructor(props) {
        super(props);
        let project = null;
        project = this.props.projects.all.filter(proj => proj.id === parseInt(this.props.match.params.projectId))[0];
        this.props.actions.setSelectedProject(project);
        this.props.actions.loadFiles(
            null,
            this.props.match.params.branch,
            this.props.match.params.projectId,
            true
        );

        this.state = {
            selectedProject: project,
            branch: this.props.match.params.branch,
            showLoadingModal: true,
            contributors: []
        }

        contributorsApi
            .getProjectContributors(
                this.state.selectedProject.id
            )
            .then(res => this.setState({contributors: res}));

        this.setModalVisibility = this.setModalVisibility.bind(this);
    }

    static getDerivedStateFromProps = (nextProps, prevState) =>
        nextProps.match.params.branch !== prevState.branch 
            ? { 
                branch: decodeURIComponent(nextProps.match.params.branch) 
            }
            : prevState;

    setModalVisibility = (modalVisibility) => 
        this.setState({showLoadingModal: modalVisibility});
    
    render() {
        const files = this.props.files;
        const branch = encodeURIComponent(this.state.branch);
        const projectName = this.state.selectedProject.name;
        const showReadMe = !window.location.href.includes("path");
        return (
            <div className="project-component">
                <LoadingModal isShowing={this.state.showLoadingModal}/>
                <Navbar />
                <ProjectContainer 
                    project={this.state.selectedProject} 
                    activeFeature="data" 
                    folders={["Group Name", projectName, "Data"]} 
                />
                <div className="main-content">
                    <RepoInfo
                        projectId={this.state.selectedProject.id}
                        currentBranch={branch}
                        numberOfContributors={this.state.contributors.length}
                        branchesCount={this.props.branches.length}
                        dataInstanesCount={
                            this.props.branches
                                .filter(
                                    branch => branch.name.startsWith("data-pipeline")
                                ).length
                            }
                    />
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
                    <RepoFeatures 
                        projectId={this.state.selectedProject.id} 
                        branch={branch}
                    />
                    <FilesContainer 
                        projectId={this.state.selectedProject.id} 
                        branch={branch} 
                        files={files} 
                        setModalVisibility={this.setModalVisibility}
                    />
                    {showReadMe && <ReadMeComponent project={this.state.selectedProject} branch={branch} />}
                </div>
            </div >
        )
    }
}

function mapStateToProps(state) {
    return {
        projects: state.projects,
        selectedProject: state.selectedProject,
        branches: state.branches,
        files: state.files
    };

}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ ...fileActions, ...projectActions }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

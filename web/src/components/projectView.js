import React from 'react';
import {connect} from 'react-redux';
import ReadMeComponent from './../components/readMe'
import ProjectContainer from './projectContainer';
import FilesContainer from './files-container';
import RepoInfo from './repo-info';
import RepoFeatures from './repo-features';
import { bindActionCreators } from 'redux';
import * as fileActions from "./../actions/fileActions";

class ProjectView extends React.Component{
    componentDidMount(){       
        if(this.props.match){
            this.props.actions.updatePathToFile(`${this.props.file.pathToFile}/${this.props.match.params.path}`);
            this.props.actions.loadFiles(this.props.match.params.path, this.props.match.params.branch);
        } else {
            this.props.actions.loadFiles("", this.props.project.default_branch);
        }
    }
    
    render() {
        const files = this.props.files;
        const branch = this.props.project.default_branch;
        return (<div className="project-component">
            <ProjectContainer project/>
            <RepoInfo/>
            <div class="last-commit-info">
                    <div class="last-commit-details">
                        <div class="last-commit-pic"></div>
                        <div class="last-commit-name">
                            <p id="prName">Merged Branch <b>"branch_name"</b> into <b>"new_branch_name"</b></p>
                            <p id="prDate">by <b>user_name</b> authored <b>4_days_ago</b></p> 
                        </div>
                    </div>

                    <div class="last-commit-id">
                        <p>PR_ID</p>
                    </div>              
            </div>
            <RepoFeatures/>
            <FilesContainer branch={branch} files={files}/>
            <ReadMeComponent/>
        </div>)
    }
}

function mapStateToProps(state){
    return {
        files: state.files,
        project: state.project,
        file: state.file
    };
}

function mapDispatchToProps(dispatch){
    return {
        actions: bindActionCreators(fileActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

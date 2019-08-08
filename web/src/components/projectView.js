import React from 'react';
import {connect} from 'react-redux';
import ReadMeComponent from './../components/readMe'
import ProjectContainer from './projectContainer';
import FilesContainer from './files-container';
import RepoInfo from './repo-info';
import RepoFeatures from './repo-features';
import Navbar from './navbar';
import {bindActionCreators} from 'redux';
import * as fileActions from "./../actions/fileActions";
import "../css/index.css";

class ProjectView extends React.Component{
    componentDidMount(){        
        if(!this.props.match){
            this.props.actions.loadFiles(
                    null, 
                    this.props.project.default_branch
                );
        }
    }
    
    render() {
        const files = this.props.files;
        const branch = this.props.project.default_branch;
        const projectName = this.props.project.name;
        return (<div className="project-component">
            <Navbar/>
            <ProjectContainer project activeFeature="data" folders={["Group Name", projectName, "Data"]}/>
            <div className="main-content">
                <RepoInfo/>
                <div className="last-commit-info">
                        <div className="last-commit-details">
                            <div className="last-commit-pic"></div>
                            <div className="last-commit-name">
                                Merged Branch <b>"branch_name"</b> into <b>"new_branch_name"</b><br/>
                                by <b>user_name</b> authored <b>4_days_ago</b>
                            </div>
                        </div>

                    <div className="last-commit-id">
                            <p>PR_ID</p>
                        </div>              
                </div>
                <RepoFeatures/>
                <FilesContainer branch={branch} files={files}/>
                <ReadMeComponent/>
            </div>
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

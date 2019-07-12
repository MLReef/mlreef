import React from 'react';
import {connect} from 'react-redux';
import ReadMeComponent from './../components/readMe'
import ProjectContainer from './projectContainer';
import FilesContainer from './files-container';
import RepoInfo from './repo-info';
import RepoFeatures from './repo-features';

class ProjectView extends React.Component{
//    constructor(props, context) {
//        super(props, context);
//      }

    render() {
        const files = this.props.files;
        return <div className="project-component">
            <ProjectContainer/>
            <RepoInfo/>
            <div class="pr-info">
                    <div class="pr-details">
                        <div class="pr-profile-pic"></div>
                        <div class="pr-name">
                            <p id="prName">Merged Branch <b>"branch_name"</b> into <b>"new_branch_name"</b></p>
                            <p id="prDate">by <b>user_name</b> authored <b>4_days_ago</b></p> 
                        </div>
                    </div>

                    <div class="pr-id">
                        <p>PR_ID</p>
                    </div>              
            </div>
            <RepoFeatures/>
            <FilesContainer files={files}/>
            <ReadMeComponent/>
        </div>
    }
}

function mapStateToProps(state){
    return {
        files: state.files
    };
}

export default connect(mapStateToProps)(ProjectView);

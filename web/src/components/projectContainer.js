import React from "react";
import ProjectInfo from "./projectInfo";
import {connect} from 'react-redux';
import ProjectNav from './projectNav';

class ProjectContainer extends React.Component {
    render(){   
        const project = this.props.project;
        const folders = this.props.folders;
        return (<div className="project-container">
            <div className="project-details main-content">
            <ProjectNav folders = {folders}/>

            <ProjectInfo info={project}/>
                {<p className="project-desc">{project.description ? project.description : "No description"}</p>}
                <div className="feature-list">
                <div className="feature active"><p>Data</p></div>                
                <div className="feature"><p>Experiments</p></div>                
                <div className="feature"><p>Inference</p></div>                
                <div className="feature"><p>Insights</p></div>                
                <div className="feature"><p>Pull Requests</p></div>                
                <div className="feature"><p>Settings</p></div>                
            </div>
        </div>
    </div>)
    }
    
}
function mapStateToProps(state){
    return {
        project: state.project
    };
}

export default connect(mapStateToProps)(ProjectContainer);

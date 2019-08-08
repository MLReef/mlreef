import React from "react";
import ProjectInfo from "./projectInfo";
import {connect} from 'react-redux';
import { Link } from "react-router-dom";
import ProjectNav from './projectNav';

class ProjectContainer extends React.Component {
    componentDidMount(){
        document.getElementById(this.props.activeFeature).classList.add("active");
    }

    render(){   
        const project = this.props.project;
        const folders = this.props.folders;
        console.log(folders);
        return (<div className="project-container">
            <div className="project-details main-content">
            <ProjectNav folders = {folders}/>

            <ProjectInfo info={project}/>
                {<p className="project-desc">{project.description ? project.description : "No description"}</p>}
                <div id=""className="feature-list">
                    <Link to="/home" id="data" className="feature"><p>Data</p></Link>
                    <Link to="/experiments-overview" id="experiments" className="feature"><p>Experiments</p></Link>
                    <div id="inference" className="feature"><p>Inference</p></div>
                    <div id="insights" className="feature"><p>Insights</p></div>
                    <div id="pullRequests" className="feature"><p>Pull Requests</p></div>
                    <div id="settings" className="feature"><p>Settings</p></div>
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

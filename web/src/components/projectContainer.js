import React from "react";
import ProjectInfo from "./projectInfo";


export default class ProjectContainer extends React.Component{
    render(){
        return <div class="project-container">
        <div class="project-details">
            <div class="project-nav">
                <p>Group Name</p> <p>></p> <p>Project Name</p> <p>></p> <p>Data</p>
            </div>

           <ProjectInfo/>

            <p class="project-desc">Project description what this project is about, but this text only takes this much space.</p>

            <div class="feature-list">
                <div class="feature" style={{backgroundColor: '#fff'}}><p>Data</p></div>                
                <div class="feature"><p>Experiments</p></div>                
                <div class="feature"><p>Inference</p></div>                
                <div class="feature"><p>Insights</p></div>                
                <div class="feature"><p>Pull Requests</p></div>                
                <div class="feature"><p>Settings</p></div>                
            </div>


        </div>
    </div>
    }
}
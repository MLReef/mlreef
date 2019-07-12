import React from 'react';

export default class ReadMeComponent extends React.Component{
    render(){
        return <div class="readme-container">  
            <div class="readme-titlebar">
                <div class="readme-profile-pic"></div>
                <div class="readme-name">
                    <p id="readmeName"><b>README.md</b></p>
                </div>
            </div>  

            <div class="readme-content-container">
                <div class="readme-content">
                    <p id="project-name-readme">Project Name</p>
                    <p id="project-content-readme">Content of the README.md file is displayed here ...</p>
                </div>
            </div>      
        </div>
    }
}
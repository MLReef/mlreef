import React from 'react';

export default class ReadMeComponent extends React.Component{
    render(){
        return <div className="readme-container">  
            <div className="readme-titlebar">
                <div className="readme-profile-pic"></div>
                <div className="readme-name">
                    <p id="readmeName"><b>README.md</b></p>
                </div>
            </div>  

            <div className="readme-content-container">
                <div className="readme-content">
                    <p id="project-name-readme">Project Name</p>
                    <p id="project-content-readme">Content of the README.md file is displayed here ...</p>
                </div>
            </div>      
        </div>
    }
}
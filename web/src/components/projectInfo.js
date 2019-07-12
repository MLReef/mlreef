import React from "react";
import star_01 from './../images/star_01.svg';
import fork_01 from './../images/fork_01.svg';
import clone_01 from './../images/clone_01.svg';

export default class ProjectInfo extends React.Component{
    render(){
        return <div class="project-info">
            <div class="project-id">
                <div class="project-pic"></div>
                <div class="project-name">
                    <p id="projectName">Project Name</p>
                    <p id="projectId">Project ID; ProjectID</p> 
                </div>
            </div>

            <div class="project-options">

                <div class="options">

                    <div class="option-name">
                        <img id="option-image" src={star_01} alt=""/>
                        <p>Star</p>
                    </div>

                    <div class="counter">
                        <p>0</p>
                    </div>

                </div>

                <div class="options">

                    <div class="option-name">
                        <img id="option-image" src={fork_01} alt=""/>
                        <p>Fork</p>
                    </div>

                    <div class="counter">
                        <p>0</p>
                    </div>

                </div>

                <div class="options">

                    <div class="option-name">
                        <img id="option-image" src={clone_01} alt=""/>
                        <p>Star</p>
                    </div>

                    <div class="counter">
                        <p>0</p>
                    </div>

                </div>

            </div>

        </div>

    }
}

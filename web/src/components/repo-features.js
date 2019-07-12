import React from 'react';
import arrow_down_blue_01 from './../images/arrow_down_blue_01.svg';
import plus_01 from './../images/plus_01.svg';

export default class RepoFeatures extends React.Component{
    render() {
        return <div class="repo-features">
            <div class="leftside-feature">
                <p>Sub-Master</p>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </div>                    

            <div class="leftside-feature">
                <img id="plus" src={plus_01} alt=""/>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </div>                   

            <button class="leftside-feature" id="data-pipeline">
                <p>Data Pipeline</p>
            </button>

            <button class="leftside-feature" id="data-visualisation">
                <p>Data Visualisation</p>
            </button>

            <div class="rightside-feature">
                <p>History</p>
            </div>                    

            <div class="rightside-feature">
                <p>Web IDE</p>
            </div>                   

            <div class="rightside-feature">
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </div>
        </div>
    }
}

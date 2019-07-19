import React from 'react';
import arrow_down_blue_01 from './../images/arrow_down_blue_01.svg';
import plus_01 from './../images/plus_01.svg';

export default class RepoFeatures extends React.Component{
    render() {
        return <div class="repo-features">
            <button>
                <p>Sub-Master</p>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </button>                    

            <button>
                <img id="plus" src={plus_01} alt=""/>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </button>                   

            <button id="data-visualisation">
                <p>Data Visualisation</p>
            </button>

            <button id="data-pipeline">
                <p>Data Pipeline</p>
            </button>

            <button>
                <p>History</p>
            </button>                    

            <button>
                <p>Web IDE</p>
            </button>                   

            <button>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt=""/>
            </button>
        </div>
    }
}

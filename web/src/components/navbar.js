import React from 'react';
import ml_reef_icon_01 from './../images/MLReef_Logo_navbar.png'
import arrow_down_white_01 from './../images/arrow_down_white_01.svg'

export default class Navbar extends React.Component{    
    render(){
        return <div class="navbar">
            <img class="logo" src={ml_reef_icon_01} alt=""/>

            <div class="projects-dropdown">
                <p>Projects</p>
                <img class="dropdown-white" src={arrow_down_white_01} alt=""/>
            </div>

            <div class="profile-options">
                <img class="dropdown-white" src={arrow_down_white_01} alt=""/>
                <div class="profile-pic-circle"></div>
            </div>
        </div>
    }
}

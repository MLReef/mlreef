import React from 'react';
import ml_reef_icon_01 from './../images/MLReef_Logo_navbar.png'
import arrow_down_white_01 from './../images/arrow_down_white_01.svg'

export default class Navbar extends React.Component{    
    render(){
        return <div className="navbar">
            <img className="logo" src={ml_reef_icon_01} alt=""/>

            <div className="projects-dropdown">
                <p>Projects</p>
                <img className="dropdown-white" src={arrow_down_white_01} alt=""/>
            </div>

            <div className="profile-options">
                <img className="dropdown-white" src={arrow_down_white_01} alt=""/>
                <div className="profile-pic-circle"/>
            </div>
        </div>
    }
}

import React from "react";
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import { Link } from "react-router-dom";
import "../css/project-overview.css";

export default class ProjectSet extends React.Component {
  state = {
    personal: true,
    starred: false,
    explore: false
  }

  handlePersonal = () => {
    this.setState({ personal: true, starred: false, explore: false })
  }

  handleStarred = () => {
    this.setState({ personal: false, starred: true, explore: false })
  }

  handleExplore = () => {
    this.setState({ personal: false, starred: false, explore: true })
  }

  render() {
    return (
      <>
        <div className="project-dashboard">
          <div className="project-list">
            <div
              className={
                "project-tab " + (this.state.personal ? "project-border" : "")
              }
              onClick={this.handlePersonal}
            >
              <p>Your Projects </p>
              <p id="count">1</p>
            </div>
            <div
              className={
                "project-tab " + (this.state.starred ? "project-border" : "")
              }
              onClick={this.handleStarred}
            >
              <p>Starred Projects </p>
              <p id="count">1</p>
            </div>
            <div
              className={
                "project-tab " + (this.state.explore ? "project-border" : "")
              }
              onClick={this.handleExplore}
            >
              <p>Explore Projects </p>
            </div>
          </div>
          <div>
            <input id="filter" type="text" placeholder="Filter by name"/>
          </div>
        </div>
        <hr style={{ marginTop: "0" }} />
        
        {this.state.personal && <Project owner="Mlreef" name="demo" />}
        {this.state.starred && <Project owner="Mlreef" name="demo" />}
        
      </>
    );
  }
}

const Project = props => {
  return (
    <div id="project-display" onClick={props.click}>
      <div>
        <div id="project-icon" />
        <div id="project-descriptor">
          <Link to="/home">
            <h4 style={{ margin: "0" }}>
              {props.owner}/{props.name}
            </h4>
            <span>This is a MLreef demo project</span>
          </Link>
        </div>
      </div>
      <div>
        <div id="pro-info">
          <div>
            <img className="dropdown-white" src={star_01} alt="" />
            12
          </div>
          <div>
            <img className="dropdown-white" src={fork_01} alt="" />
            8
          </div>
        </div>
        <p>Updated 10 minutes ago</p>
        </div>
      </div>
  )
}

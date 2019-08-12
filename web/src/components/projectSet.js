import React from "react";
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import { Link } from "react-router-dom";

export default class ProjectSet extends React.Component {
  state = {
    personal: true,
    starred: false,
    explore: false
  };

  handlePersonal = () => {
    this.setState({ personal: true, starred: false, explore: false });
  };

  handleStarred = () => {
    this.setState({ personal: false, starred: true, explore: false });
  };

  handleExplore = () => {
    this.setState({ personal: false, starred: false, explore: true });
  };

  render() {
    return (
      <>
        <div className="project-dashboard" style={{}}>
          <div className="project-list">
            <div
              className={
                "project-tab " + (this.state.personal ? "project-border" : "")
              }
              onClick={this.handlePersonal}
            >
              <p>Your Projects </p>
              <p id="count">3</p>
            </div>
            <div
              className={
                "project-tab " + (this.state.starred ? "project-border" : "")
              }
              onClick={this.handleStarred}
            >
              <p>Starred Projects </p>
              <p id="count">4</p>
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
            <input type="text" placeholder="Search your projects" />
          </div>
        </div>
        <hr style={{ marginTop: "0" }} />
        {this.state.starred && (
          <Project owner="Mlreef" name="Machine Learning" />
        )}
        {this.state.explore && <Project owner="Mlreef" name="demo" />}
      </>
    );
  }
}

const Project = props => {
  return (
    <div
      style={{ paddingTop: "30px", display: "flex", cursor: "pointer" }}
      onClick={props.click}
    >
      <div
        style={{
          width: "50px",
          height: "40px",
          backgroundColor: "rgb(255,255,255)",
          border: "1px solid #000",
          borderRadius: "4px"
        }}
      />
      <div style={{ display: "block", marginLeft: "1em", flex: "1 1 auto" }}>
        <Link to="/home">
          <h4 style={{ margin: "0" }}>
            {props.owner}/{props.name}
          </h4>
          <span>Machine Learning description</span>
        </Link>
      </div>
      <div className="pro-info">
        <div style={{ display: "flex" }}>
          <img className="dropdown-white" src={star_01} alt="" />
          <p>12</p>
        </div>
        <div style={{ display: "flex" }}>
          <img className="dropdown-white" src={fork_01} alt="" />
          <p>8</p>
        </div>
      </div>
      <p>Updated 10 minutes ago</p>
    </div>
  );
};

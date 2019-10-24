import React from "react";
import { connect } from "react-redux";
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import { Link } from "react-router-dom";
import projectGeneralInfoApi from "../apis/projectGeneralInfoApi";

class ProjectSet extends React.Component {
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
              
            </div>
            <div
              className={
                "project-tab " + (this.state.starred ? "project-border" : "")
              }
              onClick={this.handleStarred}
            >
              <p>Starred Projects </p>
              
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
            <input id="filter" type="text" placeholder="Filter by name" />
          </div>
        </div>
        <hr style={{ marginTop: "0" }} />

        {this.state.personal && this.props.projects.map((proj) =>
          proj.name.includes("forked") &&
          <Project
            key={`proj-key-${proj.id}`}
            owner={proj.id}
            name={proj.name}
            projId={proj.id}
            branch={proj.default_branch}
            desc={proj.description}
            avatar={proj.avatar_url}
            projects={this.props.projects}
          />
        )}
        {this.state.explore && this.props.projects.map((proj) =>
          !proj.name.includes("forked") &&
          <Project
            key={`proj-key-${proj.id}`}
            owner={proj.id}
            name={proj.name}
            projId={proj.id}
            branch={proj.default_branch}
            desc={proj.description}
            avatar={proj.avatar_url}
            projects={this.props.projects}
          />
        )}
      </>
    );
  }
}

const Project = props => {

  const [refresh, setRefresh] = React.useState(true);

  function handleClick() {
    projectGeneralInfoApi.removeProject("gitlab.com", props.owner)
      .then(res => res.json())
      .then(result => console.log(result))
    setRefresh(!refresh);
  }

  return (refresh &&
    <div id="project-display" onClick={props.click}>
      <div>
        <div id="project-icon">
          <div className="project-pic">
            <img style={{ minWidth: "100%" }} src={props.avatar} alt="" />
          </div>
        </div>
        <div id="project-descriptor">
          <Link to={`/my-projects/${props.projId}/${props.branch}`}>
            <h4 style={{ margin: "0", marginBottom: "5px" }}>
              {props.owner}/{props.name}
            </h4>
            <span 
              style={{ 
                maxWidth: "400px", 
                textOverflow: "ellipsis" 
                }}
            >
              {props.desc 
                ? props.desc.length > 50 
                  ? props.desc.substring(0, 100) + "..." 
                  : props.desc 
                : "No description"}
            </span>
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
        <button style={{ margin: "0.5em", cursor: "pointer" }} className="dangerous-red" onClick={handleClick}><b>X</b></button>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    projects: state.projects.all
  };
}

export default connect(mapStateToProps)(ProjectSet);
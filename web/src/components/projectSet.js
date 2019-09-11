import React from "react";
import { connect } from "react-redux";
import star_01 from "./../images/star_01.svg";
import fork_01 from "./../images/fork_01.svg";
import { Link } from "react-router-dom";
import "../css/project-overview.css";

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
              <p id="count">3</p>
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
            <input id="filter" type="text" placeholder="Filter by name" />
          </div>
        </div>
        <hr style={{ marginTop: "0" }} />

        {this.state.personal && this.props.projects.map((proj) =>
          <Project key={`proj-key-${proj.id}`} owner={proj.id} name={proj.name} projId={proj.id} desc={proj.description} avatar={proj.avatar_url} />
        )}
        {this.state.starred && <Project owner="Mlreef" name="demo" projId={"12395599"} />}

      </>
    );
  }
}

const Project = props => {
  return (
    <div id="project-display" onClick={props.click}>
      <div>
        <div id="project-icon">
          <div className="project-pic">
            <img style={{ minWidth: "100%" }} src={props.avatar} alt="" />
          </div>
          {console.log(props)}
        </div>
        <div id="project-descriptor">
          <Link to={`/my-projects/${props.projId}`}>
            <h4 style={{ margin: "0", marginBottom: "5px" }}>
              {props.owner}/{props.name}
            </h4>
            <span style={{ maxWidth: "400px", textOverflow: "ellipsis" }}>{props.desc ? props.desc.length > 50 ? props.desc.substring(0, 100) + "..." : props.desc : "No description"}</span>
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

function mapStateToProps(state) {
  return {
    projects: state.projects
  };
}

export default connect(mapStateToProps)(ProjectSet);
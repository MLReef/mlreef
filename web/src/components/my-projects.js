import React from "react";
import Navbar from "./navbar";
import ProjectSet from "./projectSet";

class Myprojects extends React.Component {
  state = {
    showOverview: true,
    showProjects: false,
    showRepo: false
  };

  handleOverview = () => {
    this.setState({ showOverview: true, showProjects: false, showRepo: false });
  };

  handleProjectList = () => {
    this.setState({ showOverview: false, showProjects: true, showRepo: false });
  };

  handleRepo = () => {
    this.setState({ showOverview: false, showProjects: false, showRepo: true });
  };

  render() {
    return (
      <div>
        <Navbar />
        <div className="project-container">
          <div className="project-details main-content">
            <div className="tag-list">
              <div
                className={
                  "feature " + (this.state.showOverview ? "active" : "")
                }
                onClick={this.handleOverview}
              >
                <p>Overview</p>
              </div>
              <div
                className={
                  "feature " + (this.state.showProjects ? "active" : "")
                }
                onClick={this.handleProjectList}
              >
                <p>Projects</p>
              </div>
              <div
                className={"feature " + (this.state.showRepo ? "active" : "")}
                onClick={this.handleRepo}
              >
                <p>Code Repository</p>
              </div>
            </div>
          </div>
        </div>
        {this.state.showProjects && (
          <div class="project-content">
            <NewProject />
            <hr />
            <ProjectSet />
          </div>
        )}
      </div>
    );
  }
}

const NewProject = () => {
  return (
    <div className="new-project">
      <p class="add">New Project</p>
    </div>
  );
};

export default Myprojects;

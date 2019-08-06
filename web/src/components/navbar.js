import React from "react";
import ml_reef_icon_01 from "./../images/MLReef_Logo_navbar.png";
import arrow_down_white_01 from "./../images/arrow_down_white_01.svg";
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";

export default class Navbar extends React.Component {
  state = { dialogOpen: false, projectDialog: false };

  handleProfile = e => {
    if (!this.state.dialogOpen) {
      document.addEventListener("click", this.handleOutsideClick, false);
    } else {
      document.removeEventListener("click", this.handleOutsideClick, false);
    }

    this.setState(prevState => ({
      dialogOpen: !prevState.dialogOpen
    }));
  };

  handleOutsideClick = e => {
    // ignore clicks on the component itself
    if (this.node.contains(e.target)) {
      return;
    }

    this.handleProfile();
  };

  handleProject = e => {
    if (!this.state.projectDialog) {
      document.addEventListener("click", this.handleBlur, false);
    } else {
      document.removeEventListener("click", this.handleBlur, false);
    }

    this.setState(prevState => ({
      projectDialog: !prevState.projectDialog
    }));
  };

  handleBlur = e => {
    if (this.node.contains(e.target)) {
      return;
    }

    this.handleProject();
  };

  render() {
    return (
      <div className="navbar">
        <img className="logo" src={ml_reef_icon_01} alt="" />

        <div
          className={
            this.state.projectDialog
              ? "projects-dropdown-click"
              : "projects-dropdown"
          }
          onClick={this.handleProject}
        >
          <a href="#foo">Projects</a>
          <img
            className="dropdown-white"
            src={
              this.state.projectDialog
                ? arrow_down_blue_01
                : arrow_down_white_01
            }
            alt=""
          />
          {this.state.projectDialog && (
            <div className="project-box">
              <div className="user-projects">
                <p>Your Projects</p>
                <p>Starred Projects</p>
                <p>Explore Projects</p>
              </div>
              <div className="project-search">
                <input
                  autoFocus={true}
                  type="text"
                  placeholder="Search your projects"
                />
                <div style={{ margin: "1em" }}>
                  <b>Frequently visited</b>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={
            "profile-options " +
            (this.state.dialogOpen ? "selected-controller" : "")
          }
          onClick={this.handleProfile}
          ref={node => {
            this.node = node;
          }}
        >
          <img
            className="dropdown-white"
            src={
              this.state.dialogOpen ? arrow_down_blue_01 : arrow_down_white_01
            }
            alt=""
          />
          <div
            className={
              this.state.dialogOpen
                ? "profile-pic-darkcircle"
                : "profile-pic-circle"
            }
          />
          {this.state.dialogOpen && (
            <div className="sign-box">
              <div>
                Signed in as <b>user_name</b>
              </div>
              <hr />
              <p>Set Status</p>
              <p>Your Profile</p>
              <p>Settings</p>
              <hr />
              <p>Sign Out</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

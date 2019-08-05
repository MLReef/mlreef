import React from "react";
import ml_reef_icon_01 from "./../images/MLReef_Logo_navbar.png";
import arrow_down_white_01 from "./../images/arrow_down_white_01.svg";
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";

export default class Navbar extends React.Component {
  state = { dialogOpen: false, projectDialog: false };

  handleProfile = () => {
    this.setState({ dialogOpen: !this.state.dialogOpen });
  };

  handleProject = e => {
    e.target.focus();
    this.setState({ projectDialog: !this.state.projectDialog });
  };

  handleBlur = e => {
    if (
      e.nativeEvent.explicitOriginalTarget &&
      e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget
    ) {
      return;
    }

    if (this.state.projectDialog) {
      setTimeout(() => {
        this.setState({ projectDialog: false });
      }, 200);
    }
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
            <div className="project-box" onBlur={this.handleBlur}>
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
          onMouseEnter={this.handleProfile}
          onMouseLeave={this.handleProfile}
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
        </div>
      </div>
    );
  }
}

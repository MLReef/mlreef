import React from "react";
import ml_reef_icon_01 from "./../images/MLReef_Logo_navbar.png";
import arrow_down_white_01 from "./../images/arrow_down_white_01.svg";
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";
import "../css/navbar.css";

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = { dialogOpen: false };
  }

  handleClick = () => {
    this.setState({ dialogOpen: !this.state.dialogOpen });
  };

  render() {
    return (
      <div className="navbar">
        <img className="logo" src={ml_reef_icon_01} alt="" />

        <div className="projects-dropdown">
          <p>Projects</p>
          <img className="dropdown-white" src={arrow_down_white_01} alt="" />
        </div>

        <div
          className={
            "profile-options " +
            (this.state.dialogOpen ? "selected-controller" : "")
          }
        >
          <img
            className="dropdown-white"
            src={
              this.state.dialogOpen ? arrow_down_blue_01 : arrow_down_white_01
            }
            alt=""
            onClick={this.handleClick}
          />
          <div
            className={
              this.state.dialogOpen
                ? "profile-pic-darkcircle"
                : "profile-pic-circle"
            }
          />
          {this.state.dialogOpen && <Dialog />}
        </div>
      </div>
    );
  }
}

function Dialog() {
  return (
    <div className="sign-box">
      <p>
        Signed in as <b>user_name</b>
      </p>
      <hr />
      <p>Set Status</p>
      <p>Your Profile</p>
      <p>Settings</p>
      <hr />
      <p>Sign Out</p>
    </div>
  );
}

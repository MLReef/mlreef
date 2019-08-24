import React,{Component} from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import ml_reef_icon_01 from "../../images/MLReef_Logo_navbar.png";
import arrow_down_white_01 from "../../images/arrow_down_white_01.svg";
import arrow_down_blue_01 from "../../images/arrow_down_blue_01.svg";
import "./navbar.css";

class Navbar extends Component {
  state = { dialogOpen: false, projectDialog: false, yourProjects: false};

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
    if (this.state.dialogOpen) this.handleProfile();
    else if (this.state.projectDialog) this.handleProject();
  };

  handleProject = e => {
    if(!e){
      return;
    }
    switch (e.target.id) {
      case "your-projects":
          this.setState({yourProjects: true});
        break;
    
      default:
        !this.state.projectDialog 
          ? document.addEventListener("click", this.handleOutsideClick, false)
          : document.removeEventListener("click", this.handleOutsideClick, false);
        this.setState(prevState => ({
          projectDialog: !prevState.projectDialog
        }));
        break;
      }
  };

  render() {
    return (
      <div className="navbar">
        <Link to="/">
          <img className="logo" src={ml_reef_icon_01} alt="" />
        </Link>
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
                <p><Link to="/my-projects">Your Projects</Link></p>
                <p>Starred Projects</p>
                <p>Explore Projects</p>
              </div>
              {!this.state.yourProjects && <div className="project-search">
                <input
                  autoFocus={true}
                  type="text"
                  placeholder="Search your projects"
                />
                <div style={{ margin: "1em" }}>
                  <b>Frequently visited</b>
                </div>
              </div>}
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

function mapStateToProps(state){
  return {
    projectsList: state.projects
  };
}

export default connect(mapStateToProps)(Navbar);
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import arrow_down_blue_01 from "./../images/arrow_down_blue_01.svg";
import plus_01 from "./../images/plus_01.svg";
import { Link } from "react-router-dom";
import * as branchesActions from "./../actions/branchesActions";

class RepoFeatures extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
      plusOpen: false,
      branchSelected: decodeURIComponent(this.props.branch),
      projectId: this.props.projects.selectedProject.id,
      branches: []
    };

    this.props.actions.getBranchesList(this.state.projectId);
  }

  branchRef = React.createRef();
  plusRef = React.createRef();

  handleBlur = e => {
    this.handleBranch();
  };

  plusDropdownBlur = e => {
    this.plusDropdown();
  };

  handleBranch = e => {
    if (!this.state.isOpen) {
      document.addEventListener("click", this.handleBlur, false);
    } else {
      document.removeEventListener("click", this.handleBlur, false);
    }

    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };

  plusDropdown = e => {
    if (!this.state.plusOpen) {
      document.addEventListener("click", this.plusDropdownBlur, false);
    } else {
      document.removeEventListener("click", this.plusDropdownBlur, false);
    }

    this.setState(prevState => ({
      plusOpen: !prevState.plusOpen
    }));
  };

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const newState = {...prevState};
    newState.branches = nextProps.branches;
    
    newState.branchSelected = nextProps.branch !== prevState.branchSelected 
      ? nextProps.branch
      : newState.branchSelected;
   
    return newState;
  }

  handleClick = (e) => {
    this.props.actions.loadFiles(
      null,
      encodeURIComponent(e.currentTarget.id),
      this.state.projectId,
      true
    );
  }

  render = () => (
      <>
        <div id="repo-features">
          <div>
            <div className="reference" ref={this.branchRef}>
              <button
                className="white-button"
                onClick={this.handleBranch}
              >
                <span>{this.state.branchSelected}</span>
                <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
              </button>
              {this.state.isOpen &&
                <div className="select-branch">
                  <div
                    style={{ margin: "0 50px", fontSize: "14px", padding: "0 40px" }}>
                    <p>Switch Branches</p>
                  </div>
                  <hr />
                  <div className="search-branch">
                    <input
                      autoFocus={true}
                      type="text"
                      placeholder="Search branches or tags"
                    />
                    <div className="branches">
                      <ul>
                        <li className="branch-header">Branches</li>
                        {this.state.branches.filter(branch =>
                          !branch.name.startsWith("data-pipeline/") &&
                          !branch.name.startsWith("experiment/")
                        ).map((branch) => {
                          let encoded = encodeURIComponent(branch.name);
                          return (
                            <li key={encoded}>
                              <Link id={branch.name} to={`/my-projects/${this.state.projectId}/${encoded}`} onClick={this.handleClick}><p>{branch.name}</p></Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className="reference" ref={this.plusRef}>
              <button className="white-button" style={{ position: "relative" }} onClick={this.plusDropdown}>
                <img id="plus" src={plus_01} alt="" />
                <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
              </button>
              {this.state.plusOpen && <div className="plus-dropdown">
                <ul className="plus-list">
                  <li>This directory</li>
                  <li className="plus-option"><Link to="/">New file</Link></li>
                  <li className="plus-option"><Link to="/">Upload file</Link></li>
                  <li className="plus-option"><Link to="/">New directory</Link></li>
                  <hr />
                  <li>This repository</li>
                  <li className="plus-option"><Link to="/">New branch</Link></li>
                  <li className="plus-option"><Link to="/">New tag</Link></li>
                </ul>
              </div>}
            </div>
            <button className="blue-button">
              <Link to={`/my-projects/${this.state.projectId}/visualizations`}><p>Data Visualisation</p></Link>
            </button>

            <button className="blue-button">
              <Link to={`/my-projects/${this.state.projectId}/pipe-line`}><p>Data Pipeline</p></Link>
            </button>
          </div>
          <div>
            <button className="white-button">
              History
                </button>

            <button className="white-button">
              Web IDE
                </button>

            <button className="white-button">
              <img id="leftfeature-image" src={arrow_down_blue_01} alt="" />
            </button>
          </div>
        </div>
      </>
  );
}

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(branchesActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RepoFeatures);

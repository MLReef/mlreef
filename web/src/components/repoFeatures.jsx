import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import {
  string,
  shape,
  number,
  func,
  arrayOf,
} from 'prop-types';
import arrowDown from '../images/arrow_down_blue_01.svg';
import plus01 from '../images/plus_01.svg';
import * as branchesActions from '../actions/branchesActions';
import * as fileActions from '../actions/fileActions';

export class RepoFeatures extends Component {
  branchRef = React.createRef();

  plusRef = React.createRef();

  constructor(props) {
    super(props);
    const {
      branch,
      projects: { selectedProject: { id } },
      actions,
    } = this.props;

    this.state = {
      isOpen: false,
      plusOpen: false,
      branchSelected: decodeURIComponent(branch),
      projectId: id,
      branches: [],
    };
    if(actions){
      actions.getBranchesList(id);
    }
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const newState = { ...prevState };
    newState.branches = nextProps.branches;

    newState.branchSelected = nextProps.branch !== prevState.branchSelected
      ? nextProps.branch
      : newState.branchSelected;

    return newState;
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  handleBlur = () => {
    this.handleBranch();
  };

  plusDropdownBlur = () => {
    this.plusDropdown();
  };

  handleBranch = () => {
    const { isOpen } = this.state;
    if (!isOpen) {
      document.addEventListener('click', this.handleBlur, false);
    } else {
      document.removeEventListener('click', this.handleBlur, false);
    }

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  plusDropdown = () => {
    const { plusOpen } = this.state;
    if (!plusOpen) {
      document.addEventListener('click', this.plusDropdownBlur, false);
    } else {
      document.removeEventListener('click', this.plusDropdownBlur, false);
    }

    this.setState((prevState) => ({
      plusOpen: !prevState.plusOpen,
    }));
  };

  handleClick = (e) => {
    const { projectId } = this.state;
    const { updateLastCommit, actions: { loadFiles } } = this.props;
    updateLastCommit(e.currentTarget.id);
    loadFiles(
      null,
      encodeURIComponent(e.currentTarget.id),
      projectId,
      true,
    );
  }

  render() {
    const {
      projectId,
      isOpen,
      plusOpen,
      branchSelected,
      branches,
    } = this.state;
    const { branch, path } = this.props;
    return (
      <>
        {branch !== null ? <div id="repo-features">
          <div>
            <div className="reference" ref={this.branchRef}>
              <button
                type="button"
                id="branch-dropdown"
                className="white-button"
                onClick={this.handleBranch}
              >
                <span>{decodeURIComponent(branchSelected)}</span>
                <img id="leftfeature-image" src={arrowDown} alt="" />
              </button>
              {isOpen && (
                <div id="branches-list" className="select-branch">
                  <div
                    style={{ margin: '0 50px', fontSize: '14px', padding: '0 40px' }}
                  >
                    <p>Switch Branches</p>
                  </div>
                  <hr />
                  <div className="search-branch">
                    <input
                      type="text"
                      placeholder="Search branches or tags"
                    />
                    <div className="branches">
                      <ul>
                        <li className="branch-header">Branches</li>
                        {branches && branches.filter((branch) => !branch.name.startsWith('data-pipeline/')
                          && !branch.name.startsWith('experiment/')).map((branch) => {
                          const encoded = encodeURIComponent(branch.name);
                          return (
                            <li key={encoded}>
                              <Link id={branch.name} to={`/my-projects/${projectId}/${encoded}`} onClick={this.handleClick}><p>{branch.name}</p></Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="reference" ref={this.plusRef}>
              <button
                type="button"
                className="white-button"
                style={{ position: 'relative' }}
                onClick={this.plusDropdown}
              >
                <img id="plus" src={plus01} alt="" />
                <img id="leftfeature-image" src={arrowDown} alt="" />
              </button>
              {plusOpen && (
              <div className="plus-dropdown">
                <ul className="plus-list">
                  <li>This directory</li>
                  <li className="plus-option"><Link to="/">Upload file</Link></li>
                  <li className="plus-option"><Link to="/">New directory</Link></li>
                  <hr />
                  <li>This repository</li>
                  <li className="plus-option"><Link to={`/my-projects/${projectId}/new-branch`}>New branch</Link></li>
                </ul>
              </div>
              )}
            </div>
            <button
              type="button"
              className="blue-button"
            >
              <Link to={`/my-projects/${projectId}/empty-data-visualization`}><p>Data Visualisation</p></Link>
            </button>
            <button
              type="button"
              className="blue-button"
            >
              <Link to={`/my-projects/${projectId}/pipe-line`}><p>Data Pipeline</p></Link>
            </button>
          </div>
          <div>
            <button type="button" className="white-button">
              <Link to={`/my-projects/${projectId}/${branch}/commits/${path}`}>History</Link>
            </button>
          </div>
        </div> : null}
      </>
    );
  }
}

RepoFeatures.propTypes = {
  branch: string.isRequired,
  path: string.isRequired,
  projects: shape({
    selectedProject: shape({
      id: number.isRequired,
    }),
  }).isRequired,
  updateLastCommit: func.isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }),
  ).isRequired,
  actions: shape({
    loadFiles: func.isRequired,
    getBranchesList: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...branchesActions, ...fileActions }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RepoFeatures);

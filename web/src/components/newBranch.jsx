import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number, arrayOf, string, shape,
} from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import $ from 'jquery';
import ProjectContainer from './projectContainer';
import Navbar from './navbar/navbar';
import branchesApi from '../apis/BranchesApi';
import ArrowButton from './arrow-button/arrowButton';
import traiangle01 from '../images/triangle-01.png';

class NewBranch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchSelected: null,
      newBranchName: '',
      showBranches: false,
      redirect: false,
    };
    this.handleCreateBranchEv = this.handleCreateBranchEv.bind(this);
  }

  setBranchSelected = (branchSelected) => this.setState(() => ({
    branchSelected,
  }));

  handleCreateBranchEv() {
    const {
      projects: {
        selectedProject: { id },
      },
    } = this.props;
    const {
      branchSelected,
      newBranchName,
    } = this.state;

    if (branchSelected === null || branchSelected === '') {
      toastr.error('Error:', 'Select please a branch from options');
      return;
    }

    if (newBranchName === null || newBranchName === '') {
      toastr.error('Error:', 'Type please a branch name');
      return;
    }

    branchesApi.create(
      id,
      newBranchName,
      branchSelected,
    )
      .then(() => {
        toastr.success('Sucess:', 'The branch was created');
        this.setState({ redirect: true });
      })
      .catch(
        () => toastr.error('Error:', 'An error has ocurred, try later please'),
      );
  }

  render() {
    const { projects: { selectedProject }, branches } = this.props;
    const {
      showBranches,
      branchSelected,
      newBranchName,
      redirect,
    } = this.state;
    const isEnabledCreateBranchButton = (branchSelected !== null && newBranchName.length > 0);

    return redirect ? (
      <Redirect to={`/my-projects/${selectedProject.id}/${newBranchName}`} />
    ) : (
      <>
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={['Group Name', selectedProject.name, 'Data', 'New branch']}
        />
        <div className="main-content">
          <p style={{ marginTop: '2em', fontSize: '1.1em' }}>New branch</p>
          <div
            style={{
              display: 'flex',
              marginLeft: '10%',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '6em' }}>
              <p>
                Branch name
              </p>
            </div>
            <input
              id="branch-name-input"
              className="grey-border"
              style={{
                width: '47.1vw',
                height: '2em',
                marginLeft: '3px',
                padding: '1px 10px',
                borderRadius: '0.3em',
              }}
              onKeyUp={
                (e) => {
                  if (e.currentTarget.value) {
                    e.currentTarget.classList.remove('grey-border');
                    e.currentTarget.classList.add('blue-border-dark-blue-letter');
                  } else {
                    e.currentTarget.classList.remove('blue-border-dark-blue-letter');
                    e.currentTarget.classList.add('grey-border');
                  }
                  this.setState({ newBranchName: e.currentTarget.value });
                }
              }
            />
          </div>
          <br />
          <div
            style={{
              display: 'flex',
              marginLeft: '10%',
            }}
          >
            <div style={{ width: '6em' }}>
              <p>
                Create from
              </p>
            </div>
            <div
              style={{
                width: '49%', borderRadius: '0.5em', marginLeft: '6.3em', position: 'absolute', zIndex: '2', backgroundColor: 'white',
              }}
              className="drop-down-select blue-border-on-hover"
            >
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  $('#branches-drop-down-btn').click();
                }}
              >
                <div style={{ width: '90%' }}>
                  <p className="machines-paragraph">{branchSelected || 'Select a branch...'}</p>
                </div>
                <div style={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                  <ArrowButton
                    imgPlaceHolder={traiangle01}
                    callback={() => {
                      this.setState((prevState) => ({
                        showBranches: !prevState.showBranches,
                      }));
                    }}
                    params={{}}
                    id="branches-drop-down-btn"
                  />
                </div>
              </div>
              {showBranches
                && (
                <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                  <li
                    key="select-opt"
                    id="select-opt"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      $('#branches-drop-down-btn').click();
                      this.setBranchSelected(null);
                    }}
                  >
                    <p style={{ padding: '2px 10px' }}>
                        Select...
                    </p>
                  </li>
                  {branches.map((branch) => (
                    <li
                      key={branch}
                      id={branch}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        $('#branches-drop-down-btn').click();
                        this.setBranchSelected(branch);
                      }}
                    >
                      <p style={{ padding: '2px 10px' }}>
                        {branch}
                      </p>
                    </li>
                  ))}
                </ul>
                )}
            </div>
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: '#e5e5e5',
            padding: '1em 2em',
            justifyContent: 'space-between',
          }}
          >
            <Link
              className="white-button"
              to="/my-projects"
            >
              Cancel
            </Link>
            {isEnabledCreateBranchButton && (
            <button
              id="create-branch-btn"
              className="light-green-button"
              type="button"
              onClick={this.handleCreateBranchEv}
            >
              Create Branch
            </button>
            )}
            {!isEnabledCreateBranchButton && (
            <button
              disabled
              type="button"
            >
              Create Branch
            </button>
            )}
          </div>
        </div>
      </>
    );
  }
}

const project = shape({
  id: number,
  name: string,
});

NewBranch.propTypes = {
  projects: shape({
    all: arrayOf(project),
    selectedProject: project,
  }).isRequired,
  branches: arrayOf(string).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches.map((branch) => branch.name),
  };
}

export default connect(mapStateToProps)(NewBranch);

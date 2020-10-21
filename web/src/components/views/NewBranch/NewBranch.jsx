import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  number, arrayOf, string, shape, func,
} from 'prop-types';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import MInput from 'components/ui/MInput';
import MSelect from 'components/ui/MSelect';
import MButton from 'components/ui/MButton';
import ProjectContainer from 'components/projectContainer';
import Navbar from 'components/navbar/navbar';
import BranchesApi from 'apis/BranchesApi.ts';
import { generateBreadCrumbs } from 'functions/helpers';
import './NewBranch.scss';

const brApi = new BranchesApi();
const bannedCharacters = [' ', '..', '~', '^', ':', '\\', '{', '}', '[', ']', '$', '#', '&', '%', '*', '+', '¨', '"', '!'];

class NewBranch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchSelected: null,
      newBranchName: '',
      redirect: false,
      isWaiting: false,
    };
    this.handleCreateBranchEv = this.handleCreateBranchEv.bind(this);
  }

  setBranchSelected = (branchSelected) => this.setState(() => ({
    branchSelected,
  }));

  validateBranchName = (branchName) => {
    if (!branchName.length > 0) {
      return false;
    }

    if (branchName.startsWith('-')) {
      return false;
    }
    let bannedCharCount = 0;

    if (/^(new|new-branch)$/.test(branchName)) {
      bannedCharCount += 1;
    }

    bannedCharacters.forEach((char) => {
      if (branchName.includes(char)) {
        bannedCharCount += 1;
      }
    });

    return bannedCharCount === 0;
  }

  handleCancel = () => {
    const {
      history,
    } = this.props;

    return history.goBack();
  }

  handleCreateBranchEv() {
    const {
      projects: {
        selectedProject: { gid },
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

    this.setState({ isWaiting: true });

    brApi.create(
      gid,
      newBranchName,
      branchSelected,
    )
      .then(() => {
        this.setState({ redirect: true });
        toastr.success('Success:', 'The branch was created');
      })
      .catch(
        () => {
          this.setState({ isWaiting: false });
          toastr.error('Error:', 'An error has ocurred, try later please');
        },
      );
  }

  render() {
    const {
      branches,
      projects: {
        selectedProject,
      },
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;

    const {
      branchSelected,
      newBranchName,
      redirect,
      isWaiting,
    } = this.state;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Branches',
        href: `/${namespace}/${slug}/-/branches`,
      },
      {
        name: 'New',
      },
    ];

    const isValidBranchName = this.validateBranchName(newBranchName);
    const isEnabledCreateBranchButton = ((branchSelected !== null && branchSelected !== '') && isValidBranchName);

    return redirect ? (
      <Redirect to={`/${namespace}/${slug}/-/tree/${encodeURIComponent(newBranchName)}`} />
    ) : (
      <>
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
        />

        <div className="new-branch-view main-content">
          <div className="new-branch-view-title">
            <h4 className="t-dark">
              New branch
            </h4>
          </div>

          <div className="new-branch-view-content">
            <div className="new-branch-view ml-5">
              <MInput
                className="mb-2"
                id="new-branch-name"
                placeholder="Branch name"
                value={newBranchName}
                onChange={(e) => this.setState({ newBranchName: e.target.value })}
                error={newBranchName !== '' && !isValidBranchName && 'Invalid name.'}
              />

              <MSelect
                id="branches-select"
                label="Create from"
                options={branches.map((b) => ({ label: b, value: b }))}
                value={branchSelected}
                onSelect={this.setBranchSelected}
              />
            </div>
            <div className="new-branch-view-actions">
              <button
                type="button"
                className="btn btn-basic-dark"
                onClick={this.handleCancel}
              >
                Cancel
              </button>
              <MButton
                id="create-branch-btn"
                onClick={this.handleCreateBranchEv}
                disabled={!isEnabledCreateBranchButton}
                waiting={isWaiting}
                className="btn btn-primary"
              >
                Create Branch
              </MButton>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const project = shape({
  gid: number,
  name: string,
});

NewBranch.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    goBack: func.isRequired,
  }).isRequired,
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

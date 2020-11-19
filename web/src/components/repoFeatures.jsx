import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import MDropdown from 'components/ui/MDropdown';
import {
  string,
  shape,
  number,
  arrayOf,
  func,
} from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import NewDirectoryPartial from 'components/layout/NewDirectoryPartial';
import { fireModal, closeModal } from 'actions/actionModalActions';
import MBranchSelector from 'components/ui/MBranchSelector';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

export class RepoFeatures extends Component {
  constructor(props) {
    super(props);

    this.state = {
      branches: [],
    };

    this.showCreateDirectoryModal = this.showCreateDirectoryModal.bind(this);
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

  showCreateDirectoryModal() {
    const {
      actions,
      projectId,
      branch,
      path,
      history,
    } = this.props;

    actions.fireModal({
      type: 'primary',
      closable: true,
      title: 'Create a new directory',
      positiveLabel: 'Create directory',
      noActions: true,
      onPositive: () => {},
      content: (
        <NewDirectoryPartial
          gid={projectId}
          branch={branch}
          targetDir={path}
          onCancel={() => actions.closeModal({ reset: true })}
          onSuccess={() => {
            actions.closeModal();
            history.push('/redirect/back');
          }}
        />
      ),
    });
  }

  render() {
    const {
      projects: {
        selectedProject: {
          namespace,
          slug,
        },
      },
      codeProjectButtonColor,
      history,
    } = this.props;

    const {
      branches,
    } = this.state;

    const { branch: currentBranch, path, searchableType } = this.props;

    const isCodeProject = searchableType === PROJECT_TYPES.CODE_PROJ
      || searchableType === PROJECT_TYPES.CODE;

    return (
      <div id="repo-features">
        <MBranchSelector
          className="mr-2 mt-3"
          branches={branches}
          activeBranch={decodeURIComponent(currentBranch)}
          onBranchSelected={
            (branchName) => history.push(`/${namespace}/${slug}/-/tree/${encodeURIComponent(branchName)}`)
          }
          showDatasets
          showExperiments
          showVisualizations
        />
        <AuthWrapper minRole={30} norender>
          <MDropdown
            className="mr-2 mt-3"
            label={<i className="fa fa-plus" />}
            component={(
              <div className="plus-dropdown">
                <ul className="plus-list">
                  <li>This directory</li>
                  <li className="plus-option">
                    <Link to={`/${namespace}/${slug}/${currentBranch}/upload-file/path/${path}`}>
                      Upload File
                    </Link>
                  </li>
                  <li className="plus-option">
                    <button
                      type="button"
                      className="btn btn-hidden"
                      style={{ fontSize: '1rem' }}
                      onClick={this.showCreateDirectoryModal}
                    >
                      New directory
                    </button>
                  </li>
                  <hr />
                  <li>This repository</li>
                  <li className="plus-option">
                    <Link to={`/${namespace}/${slug}/-/branches/new`}>
                      New branch
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          />
        </AuthWrapper>

        {!isCodeProject && (
          <>
            <AuthWrapper
              minRole={30}
              resource={{ type: 'project' }}
              className="mx-2 mt-3"
            >
              <Link
                className="btn btn-dark px-3 mr-2 mt-3"
                to={`/${namespace}/${slug}/-/datasets/new`}
              >
                Data Ops
              </Link>
            </AuthWrapper>

            <AuthWrapper
              minRole={30}
              className="ml-2 mr-auto mt-3"
            >
              <Link
                className="btn btn-dark px-3 mr-auto mt-3"
                to={`/${namespace}/${slug}/-/visualizations/new`}
              >
                Data Visualization
              </Link>
            </AuthWrapper>
          </>
        )}

        {isCodeProject && (

          <AuthWrapper
            resource={{ type: 'project' }}
            className="mt-3"
          >
            <button
              type="button"
              className="btn px-3 ml-2 mr-auto mt-3"
              onClick={() => history.push(`/${namespace}/${slug}/-/publishing`)}
              style={{
                backgroundColor: codeProjectButtonColor,
                color: 'white',
              }}
            >
              Publish
            </button>
          </AuthWrapper>
        )}
        <Link
          className="btn btn-outline-dark ml-auto mt-3 px-3"
          to={path ? `/${namespace}/${slug}/-/commits/file/${currentBranch}/-/${path}` : `/${namespace}/${slug}/-/commits/${currentBranch}`}
        >
          <span className="d-none d-lg-block mx-3">History</span>
          <span className="fa fa-history d-lg-none" />
        </Link>
      </div>
    );
  }
}

RepoFeatures.propTypes = {
  branch: string.isRequired,
  path: string.isRequired,
  branches: arrayOf(
    shape({
      name: string.isRequired,
    }),
  ).isRequired,
  searchableType: string.isRequired,
  history: shape({ push: func }).isRequired,
  actions: shape({
    fireModal: func.isRequired,
    closeModal: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
    codeProjectButtonColor: state.user.globalColorMarker,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      fireModal,
      closeModal,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RepoFeatures);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';
import {
  number, string, shape, arrayOf, bool,
} from 'prop-types';
import MInput from 'components/ui/MInput';
import MLoadingSpinner from 'components/ui/MLoadingSpinner';
import AuthWrapper from 'components/AuthWrapper';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import './branchesView.css';
import DeleteBranchModal from './deleteBranchModal';
import * as branchesActions from '../../actions/branchesActions';
import BranchesApi from '../../apis/BranchesApi.ts';

class BranchesView extends Component {
  constructor(props) {
    super(props);
    const {
      branches,
    } = this.props;
    this.state = {
      isModalVisible: false,
      branchName: '',
      urlToRedirect: '',
      currentBranches: branches,
    };
  }

  componentDidMount() {
    const {
      branches,
      selectedProject: { gid },
    } = this.props;
    const defaultBranch = branches.filter((branch) => branch.default === true)[0];
    const currentBranchesUpdated = branches;
    const branchesApi = new BranchesApi();
    branches.forEach(async (branch, index) => {
      if (!branch.default) {
        try {
          const behind = await branchesApi.compare(
            gid, branch.name, defaultBranch.name,
          );
          const ahead = await branchesApi.compare(
            gid, defaultBranch.name, branch.name,
          );
          branch.ahead = ahead.commits.length;
          branch.behind = behind.commits.length;
        } catch (error) {
          toastr.error('Error', 'Something went wrong requesting commits');
        }
      }
      currentBranchesUpdated[index] = branch;
      this.setState({
        currentBranches: currentBranchesUpdated,
      });
    });
    this.toggleModalAndUpdateList = this.toggleModalAndUpdateList.bind(this);
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.branches.length !== prevState.currentBranches.length && !prevState.isFiltering) {
      return {
        currentBranches: nextProps.branches,
      };
    }
    return { ...prevState };
  }

  toggleModalAndUpdateList = (branchName, isNeededUpdateBranchesAgain) => {
    if (isNeededUpdateBranchesAgain) this.updateBranchesArr();
    this.setState(
      (prevState) => ({
        branchName,
        isFiltering: false,
        isModalVisible: !prevState.isModalVisible,
      }),
    );
  }

  updateBranchesArr() {
    const { actions, selectedProject: { gid } } = this.props;
    actions.getBranchesList(gid);
  }

  render() {
    const {
      selectedProject,
      location: { pathname },
    } = this.props;

    const {
      isModalVisible,
      branchName,
      urlToRedirect,
      currentBranches,
    } = this.state;

    const {
      gitlabName: projectName,
      gid,
      namespace,
      slug,
    } = selectedProject;

    const today = new Date();
    const commitShortIdLowerLimit = 0;
    const commitShortIdUpperLimit = 9;

    const genQuery = (branch) => `${encodeURIComponent('merge_request[source_branch]')
    }=${encodeURIComponent(branch.name)}`;

    return (
      <>
        {urlToRedirect.length > 0 && <Redirect to={urlToRedirect} />}
        <DeleteBranchModal
          isModalVisible={isModalVisible}
          toggleIsModalVisible={this.toggleModalAndUpdateList}
          projectId={selectedProject.gid}
          branchName={branchName}
        />
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          folders={['Group Name', projectName, 'Data', 'Branches']}
        />
        <div className="main-content">
          <div id="inputs-div" className="my-3">
            <MInput
              className=""
              placeholder="Filter by branch name"
              id="filter-input"
              onChange={(e) => {
                const currentValue = e.currentTarget.value;
                const { branches } = this.props;
                let filteredBranches = branches;
                if (currentValue !== '') {
                  filteredBranches = branches.filter((branch) => branch.name.includes(e.currentTarget.value));
                }
                this.setState({
                  isFiltering: true,
                  currentBranches: filteredBranches,
                });
              }}
            />
            <AuthWrapper minRole={30} norender>
              <button
                className="btn btn-primary mb-auto ml-3"
                id="new-branch"
                type="button"
                onClick={() => this.setState({
                  urlToRedirect: `${pathname}/new`,
                })}
              >
                New branch
              </button>
            </AuthWrapper>

          </div>
          <div id="branches-container">
            <p id="title">Active branches</p>
            {currentBranches.map((branch) => (
              <div key={`key-for-${branch.name}`} className="branch-row">
                <div className="info">
                  <div style={{ display: 'flex' }}>
                    <Link to={`/${namespace}/${slug}/-/tree/${encodeURIComponent(branch.name)}`}>
                      <p className="branch-title t-dark">{branch.name}</p>
                    </Link>
                    {branch.protected && (
                      <>
                        <p className="additional-branch-info t-info">default</p>
                        <p className="additional-branch-info t-danger">protected</p>
                      </>
                    )}
                  </div>
                  <div className="additional-data">
                    <p className="commit-code">
                      <Link
                        className="t-info"
                        to={`/my-projects/${gid}/commit/${branch.commitInfo.id}`}
                      >
                        {branch.commitInfo.id.slice(commitShortIdLowerLimit, commitShortIdUpperLimit)}
                      </Link>
                    </p>
                    <p>-</p>
                    <p className="commit-mss t-dark">{branch.commitInfo.message}</p>
                    <p>-</p>
                    <p className="time-ago t-secondary">
                      {getTimeCreatedAgo(branch.commitInfo.createdAt, today)}
                    </p>
                  </div>
                </div>
                {!branch.protected && (
                  <div className="buttons">
                    {branch.behind >= 0 || branch.ahead >= 0 ? (
                      <p className="mr-2">
                        {`${branch.behind} | ${branch.ahead}`}
                      </p>
                    ) : (
                      <MLoadingSpinner />
                    )}
                    <AuthWrapper minRole={30} norender>
                      <Link
                        className="btn btn-outline-dark my-auto mr-2"
                        to={`/${namespace}/${slug}/-/merge_requests/new?${genQuery(branch)}`}
                      >
                        Merge request
                      </Link>
                      <button
                        type="button"
                        label="delete"
                        className="btn btn-danger btn-icon fa fa-times my-auto"
                        onClick={() => this.toggleModalAndUpdateList(branch.name, false)}
                      />
                    </AuthWrapper>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches.map(
      (branch) => ({
        name: branch.name,
        default: branch.default,
        protected: branch.protected,
        commitInfo: {
          id: branch.commit.id,
          message: branch.commit.message,
          createdAt: branch.commit.created_at,
        },
      }),
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...branchesActions,
    }, dispatch),
  };
}

BranchesView.propTypes = {
  selectedProject: shape({
    gid: number.isRequired,
    gitlabName: string.isRequired,
  }).isRequired,
  branches: arrayOf(shape({
    name: string.isRequired,
    default: bool.isRequired,
    protected: bool.isRequired,
  })).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(BranchesView);

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
import { generateBreadCrumbs } from 'functions/helpers';
import * as branchesActions from 'store/actions/branchesActions';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import './branchesView.css';
import DeleteBranchModal from './deleteBranchModal';
import BranchesApi from '../../apis/BranchesApi.ts';

const branchesApi = new BranchesApi();

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
      nameToFilterBy: '',
    };
    this.toggleModalAndUpdateList = this.toggleModalAndUpdateList.bind(this);
  }


  componentDidMount() {
    this.getBranchesAdditionaInformation();
  }

  componentDidUpdate(prevProps) {
    const { branches } = this.props;
    if (prevProps.branches.length !== branches.length) {
      this.getBranchesAdditionaInformation();
    }
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getBranchesAdditionaInformation() {
    const {
      branches,
      selectedProject: { gid, defaultBranch },
    } = this.props;
    const currentBranchesUpdated = branches;
    branches.forEach(async (branch, index) => {
      if (!branch?.default) {
        try {
          const behind = await branchesApi.compare(
            gid, branch?.name, defaultBranch,
          );
          const ahead = await branchesApi.compare(
            gid, defaultBranch, branch?.name,
          );
          currentBranchesUpdated[index] = {
            ...branch,
            ahead: ahead?.commits?.length || 0,
            behind: behind?.commits?.length || 0,
          };
        } catch (error) {
          toastr.error('Error', error?.message || 'Something went wrong requesting commits');
        }
      }
      this.setState({
        currentBranches: currentBranchesUpdated,
      });
    });
  }

  getBranches() {
    const { actions, selectedProject: { gid } } = this.props;
    actions.getBranchesList(gid);
  }

  toggleModalAndUpdateList = (branchName, isNeededUpdateBranchesAgain) => {
    if (isNeededUpdateBranchesAgain) this.getBranches();
    this.setState(
      (prevState) => ({
        branchName,
        isModalVisible: !prevState.isModalVisible,
      }),
    );
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
      nameToFilterBy,
    } = this.state;

    let filteredBranches = currentBranches;
    const {
      namespace,
      slug,
    } = selectedProject;

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
      {
        name: 'Branches',
        href: `/${namespace}/${slug}/-/branches`,
      },
    ];

    const today = new Date();
    const commitShortIdLowerLimit = 0;
    const commitShortIdUpperLimit = 9;

    const genQuery = (branch) => `${encodeURIComponent('merge_request[source_branch]')
    }=${encodeURIComponent(branch.name)}`;

    if (nameToFilterBy !== '') {
      filteredBranches = currentBranches.filter((branch) => branch.name.includes(nameToFilterBy));
    }

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
          breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
        />
        <div className="main-content">
          <div id="inputs-div" className="my-3">
            <MInput
              className=""
              placeholder="Filter by branch name"
              id="filter-input"
              onChange={(e) => {
                const currentValue = e.currentTarget.value;
                this.setState({
                  isFiltering: true,
                  nameToFilterBy: currentValue,
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
            {filteredBranches.map((branch) => (
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
                        to={`/${namespace}/${slug}/-/commits/${branch.name}/-/${branch.commitInfo.id}`}
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

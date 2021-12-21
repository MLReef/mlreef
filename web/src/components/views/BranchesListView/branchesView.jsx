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
import * as branchesActions from 'store/actions/branchesActions';
import * as projectActions from 'store/actions/projectInfoActions';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import Navbar from 'components/navbar/navbar';
import ProjectContainer from 'components/projectContainer';
import './branchesView.css';
import BranchesApi from 'apis/BranchesApi.ts';
import ACCESS_LEVEL from 'domain/accessLevels';
import { getTimeCreatedAgo } from '../../../functions/dataParserHelpers';
import DeleteBranchModal from './deleteBranchModal';

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
  }

  componentDidMount() {
    const {
      selectedProject,
      actions,
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;
    if (Object.keys(selectedProject).length > 0) {
      this.getBranchesAdditionaInformation();
    } else {
      actions.getProjectDetailsBySlug(namespace, slug)
        .then(({ project }) => {
          actions.setBranchesList([]);

          return project;
        })
        .then((proj) => actions.getBranchesList(proj?.gid))
        .then(() => this.getBranchesAdditionaInformation());
    }
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  getBranchesAdditionaInformation = async () => {
    const {
      branches,
      selectedProject: { gid, defaultBranch },
    } = this.props;
    const currentBranches = await Promise.all(branches.map(async (branch) => {
      if (!branch?.default) {
        try {
          const behind = await branchesApi.compare(
            gid, branch?.name, defaultBranch,
          );
          const ahead = await branchesApi.compare(
            gid, defaultBranch, branch?.name,
          );
          return {
            ...branch,
            ahead: ahead?.commits?.length || 0,
            behind: behind?.commits?.length || 0,
          };
        } catch (error) {
          toastr.error('Error', error?.message || 'Something went wrong requesting commits');
          return branch;
        }
      }

      return branch;
    }));

    this.setState({
      currentBranches,
    });
  }

  getBranches = () => {
    const { actions, selectedProject: { gid } } = this.props;
    actions.getBranchesList(gid);
  }

  updateBranches = (deletedbranchName, isNeededUpdateBranchesAgain) => {
    if (isNeededUpdateBranchesAgain) this.getBranches();
    this.setState(
      (prevState) => ({
        currentBranches: prevState.currentBranches?.filter((br) => br?.name !== deletedbranchName),
        branchName: '',
      }),
    );
  }

  toggleIsModalVisible = () => this.setState((prevState) => ({
    isModalVisible: !prevState.isModalVisible,
  }));

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
      filteredBranches = currentBranches
        .filter((branch) => branch.name.includes(nameToFilterBy));
    }

    if (Object.keys(selectedProject).length === 0) {
      return (
        <MLoadingSpinnerContainer active />
      );
    }
    return (
      <>
        {urlToRedirect.length > 0 && <Redirect to={urlToRedirect} />}
        <DeleteBranchModal
          isModalVisible={isModalVisible}
          toggleIsModalVisible={this.toggleIsModalVisible}
          updateBranches={this.updateBranches}
          projectId={selectedProject.gid}
          branchName={branchName}
        />
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          breadcrumbs={customCrumbs}
        />
        <div className="main-content">
          <div id="inputs-div" className="my-3">
            <MInput
              className=""
              placeholder="Filter by branch name"
              id="filter-input"
              onChange={(e) => this.setState({
                nameToFilterBy: e.target.value,
              })}
            />
            <AuthWrapper minRole={ACCESS_LEVEL.DEVELOPER} norender>
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
            {filteredBranches
              .sort(
                (a, b) => new Date(b?.commitInfo?.createdAt) - new Date(a?.commitInfo?.createdAt),
              )
              .map((branch) => (
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
                          {branch.commitInfo.id.slice(
                            commitShortIdLowerLimit,
                            commitShortIdUpperLimit,
                          )}
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
                    <AuthWrapper minRole={ACCESS_LEVEL.DEVELOPER} norender>
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
                        onClick={() => this.setState((prevState) => ({
                          isModalVisible: !prevState.isModalVisible,
                          branchName: branch.name,
                        }))}
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
      ...projectActions,
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

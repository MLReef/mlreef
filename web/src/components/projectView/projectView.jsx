import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import { CircularProgress } from '@material-ui/core';
import ReadMeComponent from '../readMe/readMe';
import ProjectContainer from '../projectContainer';
import FilesContainer from '../filesContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import * as projectActions from '../../actions/projectInfoActions';
import * as branchesActions from '../../actions/branchesActions';
import '../../css/index.css';
import commitsApi from '../../apis/CommitsApi';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import * as usersActions from '../../actions/usersActions';
import * as jobsActions from '../../actions/jobsActions';
import * as mergeActions from '../../actions/mergeActions';
import ProjectGeneralInfoApi from '../../apis/projectGeneralInfoApi';
import EmptyProject from './emptyProject';

class ProjectView extends React.Component {
  constructor(props) {
    super(props);
    const {
      actions,
      match:
      {
        params:
        { projectId, branch },
      }, users,
    } = this.props;
    actions.getUsersLit(projectId);
    actions.getBranchesList(projectId);
    actions.getJobsListPerProject(projectId);
    actions.getMergeRequestsList(projectId);

    ProjectGeneralInfoApi
      .getProjectInfoApi(projectId)
      .then((project) => {
        this.setState({ selectedProject: project });
        actions.setSelectedProject(project);
        const lastCommitBr = this.isValidBranch(branch)
          ? branch
          : project.default_branch;
        commitsApi.getCommits(projectId, lastCommitBr, '', 1)
          .then(
            (res) => this.setState({ lastCommit: res[0] }),
          ).catch(() => toastr.error('Error setting project'));
      })
      .catch(() => this.props.history.push('/error-page'));

    const decodedBranch = decodeURIComponent(branch);

    this.state = {
      selectedProject: null,
      mergeRequests: [],
      branch: decodedBranch,
      contributors: [],
      lastCommit: null,
      users,
    };
    this.updateLastCommit = this.updateLastCommit.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.mergeRequests.length > 0) {
      return {
        mergeRequests: nextProps.mergeRequests,
      };
    }
    if (nextProps.match.params.branch !== prevState.branch) {
      return {
        branch: decodeURIComponent(nextProps.match.params.branch),
      };
    }
    return prevState;
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined

  updateLastCommit(newBranch) {
    const { selectedProject } = this.state;
    commitsApi.getCommits(selectedProject.id, newBranch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      ).catch((err) => err);
  }

  render() {
    const { match: { params: { path } }, branches } = this.props;
    const {
      lastCommit,
      branch,
      selectedProject,
      users,
      contributors,
      mergeRequests,
    } = this.state;
    if (!selectedProject) {
      return <CircularProgress size={20} />;
    }
    const isEmptyProject = selectedProject.empty_repo;
    const sshUrlToRepo = selectedProject.ssh_url_to_repo;
    const today = new Date();
    const timediff = lastCommit && getTimeCreatedAgo(lastCommit.authored_date, today);
    let encodedBranch = branch.includes('%2F')
      ? branch
      : encodeURIComponent(branch);
    encodedBranch = this.isValidBranch(encodedBranch)
      ? encodedBranch
      : selectedProject.default_branch;
    const projectName = selectedProject.name;
    const groupName = selectedProject.namespace.name;
    const showReadMe = selectedProject.readme_url;
    const committer = lastCommit && users.filter((user) => user.name === lastCommit.author_name)[0];
    return (
      <div className="project-component">
        <Navbar />
        <ProjectContainer
          project={selectedProject}
          activeFeature="data"
          folders={[groupName, projectName, 'Data']}
        />
        <div className="main-content">
          <RepoInfo
            mergeRequests={mergeRequests}
            projectId={selectedProject.id}
            currentBranch={encodedBranch}
            numberOfContributors={contributors.length}
            branchesCount={branches.length}
            dataInstanesCount={
              branches
                .filter(
                  (dInstBranch) => dInstBranch.name.startsWith('data-pipeline'),
                ).length
            }
          />
          {isEmptyProject ? (
            <EmptyProject sshUrlToRepo={sshUrlToRepo} />
          ) : (
            <>
              {lastCommit && (
              <div className="last-commit-info">
                <div className="last-commit-details">
                  <div className="commit-pic-circle" style={{ margin: 0 }}>
                    <img src={committer ? committer.avatar_url : ''} alt="" />
                  </div>
                  <div className="last-commit-name">
                    <p>
                      {lastCommit.message}
                      <br />
                      by
                      {' '}
                      <b>{lastCommit.author_name}</b>
                      {' '}
                      authored
                      {' '}
                      <b>{timediff}</b>
                    </p>
                  </div>
                </div>
                <div className="last-commit-id">
                  <p>{lastCommit.short_id}</p>
                </div>
              </div>
              )}
              <RepoFeatures
                projectId={selectedProject.id}
                branch={encodedBranch}
                path={path || ''}
                updateLastCommit={this.updateLastCommit}
              />
              <FilesContainer
                projectId={selectedProject.id}
                path={path}
                branch={encodedBranch}
              />
              {showReadMe && (
                <ReadMeComponent
                  projectName={selectedProject.name}
                  projectId={selectedProject.id}
                  branch={encodedBranch}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

ProjectView.propTypes = {
  match: shape({
    params: shape({
      projectId: string.isRequired,
      file: string,
      branch: string.isRequired,
      path: string,
    }),
  }).isRequired,
  users: arrayOf(shape({
    name: string.isRequired,
  })).isRequired,
  branches: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,
  actions: shape({
    setSelectedProject: func.isRequired,
    getUsersLit: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    users: state.users,
    branches: state.branches,
    mergeRequests: state.mergeRequests,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...usersActions,
      ...jobsActions,
      ...branchesActions,
      ...mergeActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf,
} from 'prop-types';
import ReadMeComponent from '../readMe/readMe';
import ProjectContainer from '../projectContainer';
import FilesContainer from '../filesContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import * as projectActions from '../../actions/projectInfoActions';
import '../../css/index.css';
import LoadingModal from '../loadingModal';
import contributorsApi from '../../apis/contributorsApi';
import commitsApi from '../../apis/CommitsApi';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';
import * as usersActions from '../../actions/usersActions';
import * as jobsActions from '../../actions/jobsActions';
import * as mergeActions from '../../actions/mergeActions';

class ProjectView extends React.Component {
  constructor(props) {
    super(props);
    const {
      actions,
      match:
      {
        params:
        { projectId, branch },
      }, projects, users,
    } = this.props;
    const project = projects.all.filter((proj) => proj.id === parseInt(projectId, 10))[0];
    actions.setSelectedProject(project);
    actions.getUsersLit(projectId);
    actions.getJobsListPerProject(projectId);
    actions.getMergeRequestsList(projectId);
    const decodedBranch = decodeURIComponent(branch);

    this.state = {
      selectedProject: project,
      mergeRequests: [],
      branch: decodedBranch,
      showLoadingModal: false,
      contributors: [],
      lastCommit: {},
      users,
    };
    commitsApi.getCommits(project.id, branch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      );
    contributorsApi
      .getProjectContributors(
        project.id,
      )
      .then((res) => this.setState({ contributors: res }));

    this.setModalVisibility = this.setModalVisibility.bind(this);
    this.updateLastCommit = this.updateLastCommit.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.mergeRequests.length > 0) {
      return {
        mergeRequests: nextProps.mergeRequests,
      };
    }
    return nextProps.match.params.branch !== prevState.branch
      ? {
        branch: decodeURIComponent(nextProps.match.params.branch),
      }
      : prevState;
  }

  setModalVisibility(modalVisibility) {
    this.setState({ showLoadingModal: modalVisibility });
  }

  updateLastCommit(newBranch) {
    const { selectedProject } = this.state;
    commitsApi.getCommits(selectedProject.id, newBranch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      );
  }

  render() {
    const {
      lastCommit,
      branch,
      selectedProject,
      showLoadingModal,
      users,
      contributors,
      mergeRequests
    } = this.state;
    const today = new Date();
    const timediff = getTimeCreatedAgo(lastCommit.authored_date, today);
    const encodedBranch = branch.includes('%2F')
      ? branch
      : encodeURIComponent(branch);
    const { match: { params: { path } }, branches } = this.props;
    const projectName = selectedProject.name;
    const groupName = selectedProject.namespace.name;
    const showReadMe = !window.location.href.includes('path');
    const committer = users.filter((user) => user.name === lastCommit.author_name)[0];
    return (
      <div className="project-component">
        <LoadingModal isShowing={showLoadingModal} />
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
            setModalVisibility={this.setModalVisibility}
          />
          {showReadMe && (
            <ReadMeComponent
              projectName={selectedProject.name}
              projectId={selectedProject.id}
              branch={encodedBranch}
            />
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
  projects: shape({
    all: shape.isRequired,
  }).isRequired,
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
      ...mergeActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

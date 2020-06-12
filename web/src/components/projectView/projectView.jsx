import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf,
} from 'prop-types';
import forkingImage from 'images/forking.png';
import { OPERATION, ALGORITHM } from 'dataTypes';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import ReadMeComponent from '../readMe/readMe';
import ProjectContainer from '../projectContainer';
import FilesContainer from '../FilesContainer/FilesContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import * as projectActions from '../../actions/projectInfoActions';
import * as branchesActions from '../../actions/branchesActions';
import * as processorActions from '../../actions/processorActions';
import './projectView.css';
import commitsApi from '../../apis/CommitsApi';
import { getTimeCreatedAgo, parseToCamelCase } from '../../functions/dataParserHelpers';
import * as userActions from '../../actions/userActions';
import * as jobsActions from '../../actions/jobsActions';
import * as mergeActions from '../../actions/mergeActions';
import EmptyProject from './emptyProject';
import DataProject from 'domain/project/DataProject';

class ProjectView extends React.Component {
  constructor(props) {
    super(props);
    const {
      match:
      {
        params: { branch },
      }, users,
    } = this.props;

    const decodedBranch = decodeURIComponent(branch);

    this.state = {
      selectedProject: null,
      mergeRequests: [],
      branch: decodedBranch,
      contributors: [],
      lastCommit: null,
      users,
      isForking: false,
    };
    this.updateLastCommit = this.updateLastCommit.bind(this);
    this.setIsForking = this.setIsForking.bind(this);
  }

  componentDidMount() {
    const {
      actions,
      projects: { all },
      match:
      {
        params: { projectId, branch },
      },
    } = this.props;
    actions.getUsersLit(projectId);
    actions.getBranchesList(projectId);
    actions.getJobsListPerProject(projectId);
    actions.getMergeRequestsList(projectId);
    actions.getProcessors(OPERATION);
    actions.getProcessors(ALGORITHM);
    actions.setIsLoading(true);
    
    const projectGeneralInfoApi = new ProjectGeneralInfoApi();
    projectGeneralInfoApi.getProjectInfoApi(projectId)
      .then((rawGitlabProjectInfo) => {
        const gitlabProjectInfo = parseToCamelCase(rawGitlabProjectInfo);
        const backendProjectInformation = all.filter((proj) => proj.gitlabId.toString() === projectId)[0];
        const dp = new DataProject(
          backendProjectInformation.backendId,
          backendProjectInformation.slug,
          backendProjectInformation.url,
          backendProjectInformation.ownerId,
          backendProjectInformation.gitlabGroup,
          backendProjectInformation.experiments,
        );
        dp.avatarUrl = gitlabProjectInfo.avatarUrl;
        dp.defaultBranch = gitlabProjectInfo.defaultBranch;
        dp.description = gitlabProjectInfo.description;
        dp.emptyRepo = gitlabProjectInfo.emptyRepo;
        dp.forksCount = gitlabProjectInfo.forksCount;
        dp.starCount = gitlabProjectInfo.starCount;
        dp.httpUrlToRepo = gitlabProjectInfo.httpUrlToRepo;
        dp.sshUrlToRepo = gitlabProjectInfo.sshUrlToRepo;
        dp.readmeUrl = gitlabProjectInfo.readmeUrl;
        dp.namespace = gitlabProjectInfo.namespace;
        dp.gitlabName = gitlabProjectInfo.name;
        dp.id = gitlabProjectInfo.id;
        const statistics = gitlabProjectInfo.statistics ? parseToCamelCase(gitlabProjectInfo.statistics) : {};
        dp.repositorySize = statistics.repositorySize || 0;
        const lastCommitBr = this.isValidBranch(branch)
          ? branch
          : dp.defaultBranch;
        this.updateLastCommit(dp.id, lastCommitBr);
        this.setState({ selectedProject: dp });
        actions.setSelectedProject(dp);
        actions.setIsLoading(false);
      })
      .catch(() => this.props.history.push('/error-page'));
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      mergeRequests: nextProps.mergeRequests,
      branch: decodeURIComponent(nextProps.match.params.branch)
    };
  }

  componentDidUpdate(prevProps){
    const {
      branch,
      selectedProject,
    } = this.state;
    if(selectedProject && branch !== prevProps.match.params.branch) this.updateLastCommit(selectedProject.id, branch);
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  setIsForking(status) {
    this.setState({ isForking: status });
  }

  isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined

  updateLastCommit(projectId, newBranch) {
    commitsApi.getCommits(projectId, newBranch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      ).catch((err) => err);
  }

  render() {
    const { match: { params: { path, projectId } }, branches, history } = this.props;
    const {
      lastCommit,
      branch,
      selectedProject,
      users,
      contributors,
      mergeRequests,
      isForking,
    } = this.state;
    let isEmptyProject, sshUrlToRepo, projectName, showReadMe, encodedBranch;
    if (selectedProject) {
      isEmptyProject = selectedProject.emptyRepo;
      sshUrlToRepo = selectedProject.sshUrlToTepo;
      projectName = selectedProject.gitlabName;
      showReadMe = selectedProject.readmeUrl;
      encodedBranch = branch.includes('%2F')
        ? branch
        : encodeURIComponent(branch);
      encodedBranch = this.isValidBranch(encodedBranch)
        ? encodedBranch
        : selectedProject.defaultBranch;
    }
    const committer = lastCommit && users.filter((user) => user.name === lastCommit.author_name)[0];
    const avatarUrl = committer ? committer.avatar_url : '';
    const avatarName = committer && committer.name;
    const today = new Date();
    const timediff = lastCommit && getTimeCreatedAgo(lastCommit.authored_date, today);
    return (
      <div className="project-component">
        <Navbar />
        {isForking && (
          <div
            className="mx-auto mt-5 t-center"
            style={{ maxWidth: '250px' }}
          >
            <div>
              <h2 className="t-dark">Froking in process</h2>
              <p className="t-secondary">You may wait while we import the repository for you. You may refresh at will.</p>
            </div>
            <div
              className="bg-image m-auto"
              style={{
                backgroundImage: `url(${forkingImage})`,
                width: '200px',
                height: '160px',
              }}
            />
          </div>
        )}
        <div style={{ display: isForking ? 'none' : 'block' }}>
          <ProjectContainer
            setIsForking={this.setIsForking}
            activeFeature="data"
          />
          {selectedProject && (
          <div className="main-content">
            {isEmptyProject ? (
              <EmptyProject sshUrlToRepo={sshUrlToRepo} projectId={projectId} />
            ) : (
              <>
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
                {lastCommit && (
                <div className="last-commit-info">
                  <div className="last-commit-details">
                    <a href={committer && `/${avatarName}`}>
                      <span style={{ position: 'relative' }}>
                        <img className="avatar-circle mt-2" width="32" height="32" src={avatarUrl} alt="" />
                      </span>
                    </a>
                    <div className="last-commit-name">
                      <p>
                        {lastCommit.message}
                        <br />
                        by
                        {' '}
                        <b>
                          <a href={committer && `/${avatarName}`}>
                            {lastCommit.author_name}
                          </a>
                        </b>
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
                />
                <FilesContainer
                  projectId={selectedProject.id}
                  path={path}
                  branch={encodedBranch}
                  history={history}
                />
                {showReadMe && (
                <ReadMeComponent
                  projectName={projectName}
                  projectId={selectedProject.id}
                  branch={encodedBranch}
                />
                )}
              </>
            )}
          </div>
          )}
        </div>
      </div>
    );
  }
}

ProjectView.propTypes = {
  projects: shape({
    all: arrayOf.isRequired,
  }).isRequired,
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
    user: state.user,
    branches: state.branches,
    mergeRequests: state.mergeRequests,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...userActions,
      ...jobsActions,
      ...branchesActions,
      ...mergeActions,
      ...processorActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

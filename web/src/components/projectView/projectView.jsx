import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf,
} from 'prop-types';
import forkingImage from 'images/forking.png';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import ReadMeComponent from '../readMe/readMe';
import ProjectContainer from '../projectContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import * as projectActions from '../../actions/projectInfoActions';
import * as branchesActions from '../../actions/branchesActions';
import * as processorActions from '../../actions/processorActions';
import './projectView.css';
import { parseToCamelCase } from '../../functions/dataParserHelpers';
import * as userActions from '../../actions/userActions';
import * as jobsActions from '../../actions/jobsActions';
import * as mergeActions from '../../actions/mergeActions';
import EmptyProject from './emptyProject';
import ProjectLastCommitSect from './projectLastCommitSect';
import { toastr } from 'react-redux-toastr';
import FilesContainer from 'components/FilesContainer';

const isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined;

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
      users,
      isForking: false,
    };
    this.setIsForking = this.setIsForking.bind(this);
  }

  componentDidMount() {
    const {
      actions,
      projects: { all },
      match:
      {
        params: { projectId },
      },
    } = this.props;
    actions.getUsersLit(projectId);
    actions.getBranchesList(projectId);
    actions.getJobsListPerProject(projectId);
    actions.getMergeRequestsList(projectId);
    actions.getProcessors(OPERATION);
    actions.getProcessors(ALGORITHM);
    actions.getProcessors(VISUALIZATION);
    actions.setIsLoading(true);
    
    const projectGeneralInfoApi = new ProjectGeneralInfoApi();
    projectGeneralInfoApi.getProjectInfoApi(projectId)
      .then((rawGitlabProjectInfo) => {
        const gitlabProjectInfo = parseToCamelCase(rawGitlabProjectInfo);
        const backendProjectInformation = all.filter((proj) => proj.gitlabId.toString() === projectId)[0];
        const fullProject = { ...backendProjectInformation };
        fullProject.avatarUrl = gitlabProjectInfo.avatarUrl;
        fullProject.defaultBranch = gitlabProjectInfo.defaultBranch;
        fullProject.description = gitlabProjectInfo.description;
        fullProject.emptyRepo = gitlabProjectInfo.emptyRepo;
        fullProject.forksCount = gitlabProjectInfo.forksCount;
        fullProject.starCount = gitlabProjectInfo.starCount;
        fullProject.httpUrlToRepo = gitlabProjectInfo.httpUrlToRepo;
        fullProject.sshUrlToRepo = gitlabProjectInfo.sshUrlToRepo;
        fullProject.readmeUrl = gitlabProjectInfo.readmeUrl;
        fullProject.namespace = gitlabProjectInfo.namespace;
        fullProject.gitlabName = gitlabProjectInfo.name;
        fullProject.id = gitlabProjectInfo.id;
        const statistics = gitlabProjectInfo.statistics ? parseToCamelCase(gitlabProjectInfo.statistics) : {};
        fullProject.repositorySize = statistics.repositorySize || 0;
        fullProject.commitCount = statistics.commitCount || 0;
        actions.setSelectedProject(fullProject);
      })
      .catch(() => toastr.error('Error', 'Error fetching project'))
      .finally(() => actions.setIsLoading(false));
  }

  static getDerivedStateFromProps(nextProps) {
    const { mergeRequests, match: { params: { branch } }, projects: { selectedProject } } = nextProps;
    const isValidBr = isValidBranch(branch);
    return {
      selectedProject,
      mergeRequests,
      branch: isValidBr ? decodeURIComponent(branch): selectedProject.defaultBranch
    };
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  setIsForking(status) {
    this.setState({ isForking: status });
  }

  render() {
    const { match: { params: { path, projectId, branch: urlBranch } }, branches } = this.props;
    const {
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

      if(isValidBranch(branch)){
        encodedBranch = branch.includes('%2F')
          ? branch 
          : encodeURIComponent(branch);
      } else {
        encodedBranch = selectedProject.defaultBranch;
      }
    }
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
                  project={selectedProject}
                  mergeRequests={mergeRequests}
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
                <ProjectLastCommitSect 
                  projectId={selectedProject.id}
                  branch={urlBranch}
                  projectDefaultBranch={selectedProject.defaultBranch}
                  users={users}
                />
                <RepoFeatures
                  projectId={selectedProject.id}
                  branch={encodedBranch}
                  path={path || ''}
                  projectType={selectedProject.projectType}
                />
                <FilesContainer
                  projectId={selectedProject.id}
                  path={path}
                  urlBranch={urlBranch}
                  defaultBranch={selectedProject.defaultBranch}
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

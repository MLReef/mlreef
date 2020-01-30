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
import * as branchesActions from '../../actions/branchesActions';
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
    project && commitsApi.getCommits(project.id, branch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      );
    project && contributorsApi
      .getProjectContributors(
        project.id,
      )
      .then((res) => this.setState({ contributors: res }))
      .catch(err => err);

    this.setModalVisibility = this.setModalVisibility.bind(this);
    this.updateLastCommit = this.updateLastCommit.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    const {
      actions,
      match:
      {
        params:
        { projectId, branch },
      }, projects,
    } = prevProps;
    
    if(!projects.selectedProject){
      const filteredList = projects.all.filter((proj) => proj.id === parseInt(projectId, 10));
      if(filteredList.length > 0){
        const selectedProject = filteredList[0];
        actions.setSelectedProject(selectedProject);
        actions.getBranchesList(selectedProject.id);
        this.setState({ selectedProject });
        commitsApi.getCommits(selectedProject.id, branch, '', 1)
        .then(
          (res) => this.setState({ lastCommit: res[0] }),
        );
      }
    }
    
    if(branch !== prevState.branch){
      this.setState({ branch: decodeURIComponent(prevProps.match.params.branch)});
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.mergeRequests.length > 0) {
      return {
        mergeRequests: nextProps.mergeRequests,
      };
    }
    return nextProps.match.params.branch !== prevState.branch
      && {
        branch: decodeURIComponent(nextProps.match.params.branch),
      };
  }

  componentWillUnmount() {
    this.setState = (state) => (state);
  }

  setModalVisibility(modalVisibility) {
    this.setState({ showLoadingModal: modalVisibility });
  }

  updateLastCommit(newBranch) {
    const { selectedProject } = this.state;
    commitsApi.getCommits(selectedProject.id, newBranch, '', 1)
      .then(
        (res) => this.setState({ lastCommit: res[0] }),
      ).catch(err => err);
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
    let showReadMe;
    let ssh_url_to_repo = selectedProject && selectedProject.ssh_url_to_repo;
    let default_branch = selectedProject && selectedProject.default_branch;
    const today = new Date();
    const timediff = lastCommit && getTimeCreatedAgo(lastCommit.authored_date, today);
    const encodedBranch = branch.includes('%2F')
      ? branch
      : encodeURIComponent(branch);
    const { match: { params: { path } }, branches } = this.props;
    const projectName = selectedProject && selectedProject.name;
    const groupName = selectedProject && selectedProject.namespace.name;
    if (lastCommit) {
      showReadMe = !window.location.href.includes('path');
    }
    const committer = lastCommit && users.filter((user) => user.name === lastCommit.author_name)[0];
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
            projectId={selectedProject && selectedProject.id}
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
          {lastCommit ? <>
          {default_branch ? <div className="last-commit-info">
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
          </div> : null}
          {default_branch ? <RepoFeatures
            projectId={selectedProject && selectedProject.id}
            branch={encodedBranch}
            path={path || ''}
            updateLastCommit={this.updateLastCommit}
          /> : null}
          {lastCommit ? <FilesContainer
            projectId={selectedProject && selectedProject.id}
            path={path}
            branch={encodedBranch}
            setModalVisibility={this.setModalVisibility}
          />: null}{showReadMe && (
            <ReadMeComponent
              projectName={selectedProject && selectedProject.name}
              projectId={selectedProject && selectedProject.id}
              branch={encodedBranch}
            />
          )}</> : 
          <>
            <div style={{width: '100%'}}>
              <h4 style={{fontSize: '1.3125rem', color: '#2e2e2e', marginBottom: '0.5rem'}}>The repository for this project is empty</h4>
            </div>
            <div className='empty-wrapper' style={{marginTop: '3em'}}>
              <h3 style={{margin: '12px 0', lineHeight: '1.3', fontSize: '1.25em', fontWeight: '600'}}>Command line instructions</h3>
              <p>You can also upload existing files from your computer using the instructions below.</p>
              <div style={{marginBottom: '1em'}}>
                <fieldset>
                  <h5>Create a new repository</h5>
                  <pre className='bg-light'>
                    git clone <span>{ssh_url_to_repo}</span>
                    <p>cd test</p>
                    <p>touch README.md</p>
                    <p>git add README.md</p>
                    <p>git commit -m "add README"</p>
                  </pre>
                </fieldset>
                <fieldset>
                  <h5>Push an existing folder</h5>
                  <pre className='bg-light'>
                    cd existing_folder
                    <p>git init</p>
                    <p>git remote add origin <span>{ssh_url_to_repo}</span></p>
                    <p>git add .</p>
                    <p>git commit -m "Initial commit"</p>
                  </pre>
                </fieldset>
                <fieldset>
                  <h5>Push an existing Git repository</h5>
                  <pre className='bg-light'>
                    cd existing_repo
                    <p>git remote rename origin old-origin</p>
                    <p>git remote add origin <span>{ssh_url_to_repo}</span></p>
                  </pre>
                </fieldset>
              </div>
            </div>
          </>
          }
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
      ...branchesActions,
      ...mergeActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

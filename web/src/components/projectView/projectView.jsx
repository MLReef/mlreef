import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf,
} from 'prop-types';
import forkingImage from 'images/forking.png';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import ReadMeComponent from '../readMe/readMe';
import ProjectContainer from '../projectContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import * as projectActions from '../../actions/projectInfoActions';
import * as branchesActions from '../../actions/branchesActions';
import * as processorActions from '../../actions/processorActions';
import './projectView.css';
import * as userActions from '../../actions/userActions';
import * as jobsActions from '../../actions/jobsActions';
import * as mergeActions from '../../actions/mergeActions';
import EmptyProject from './emptyProject';
import ProjectLastCommitSect from './projectLastCommitSect';
import { toastr } from 'react-redux-toastr';
import FilesContainer from 'components/FilesContainer';

const isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined;

class ProjectView extends React.Component {
  state = {
    contributors: [], // disconnected
    users: [], // disconnected
    isForking: false,
  }

  constructor(props) {
    super(props);

    this.setIsForking = this.setIsForking.bind(this);
    this.fetchIfAuthenticated = this.fetchIfAuthenticated.bind(this);
    this.fetchVisitor = this.fetchVisitor.bind(this);
  }

  componentDidMount() {
    const {
      actions,
      user: { auth },
    } = this.props;

    const fetch = auth ? this.fetchIfAuthenticated : this.fetchVisitor;

    actions.setIsLoading(true);

    fetch().finally(() => actions.setIsLoading(false));
  }

  fetchIfAuthenticated() {
    const {
      actions,
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;

    return actions.getProjectDetailsBySlug(namespace, slug)
      .then(({ project }) => {
        const gid = project.gitlabId || project.gitlab?.id;

        actions.getProcessors(OPERATION);
        actions.getProcessors(ALGORITHM);
        actions.getProcessors(VISUALIZATION);

        return Promise.all([
          actions.getBranchesList(gid),
          actions.getMergeRequestsList(gid),
          actions.getUsersLit(gid),
          actions.getJobsListPerProject(gid),
        ])
      })
        .catch(() => toastr.error('Error', 'Error fetching project'));
  }

  fetchVisitor() {
    const {
      actions,
      match: {
        params: {
          namespace,
          slug,
        },
      },
    } = this.props;

    return actions.getProjectDetailsBySlug(namespace, slug, { visitor: true })
      .then(({ project }) => {
        const gid = project.gitlabId || project.gitlab?.id;

        // actions.getProcessors(OPERATION);
        // actions.getProcessors(ALGORITHM);
        // actions.getProcessors(VISUALIZATION);

        return Promise.all([
          actions.getBranchesList(gid),
          actions.getMergeRequestsList(gid),
          actions.getUsersLit(gid),
        ])
      })
        .catch(() => toastr.error('Error', 'Error fetching project'));
  }

  setIsForking(status) {
    this.setState({ isForking: status });
  }

  render() {
    const {
      project,
      project: {
        gid,
        sshUrlToRepo,
        name: projectName,
        readmeUrl: showReadMe,
      },
      match: {
        params: {
          namespace,
          slug,
          path,
          branch,
        },
      },
      mergeRequests,
      branches,
    } = this.props;

    const {
      users,
      contributors,
      isForking,
    } = this.state;

    const currentBranch = isValidBranch(branch) ? branch : project.defaultBranch;
    const decodedBranch = decodeURIComponent(currentBranch);

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
          {gid && (
            <ProjectContainer
              setIsForking={this.setIsForking}
              activeFeature="data"
            />
          )}
          {gid && (
          <div className="main-content">
            {project.emptyRepo ? (
              <EmptyProject sshUrlToRepo={sshUrlToRepo} projectId={gid} />
            ) : (
              <>
                <RepoInfo
                  project={project}
                  mergeRequests={mergeRequests}
                  currentBranch={decodedBranch}
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
                  projectId={gid}
                  branch={currentBranch}
                  projectDefaultBranch={project.defaultBranch}
                  users={users}
                />
                <RepoFeatures
                  projectId={gid}
                  branch={decodedBranch}
                  path={path || ''}
                  searchableType={project.searchableType}
                />
                <FilesContainer
                  projectId={gid}
                  namespace={namespace}
                  slug={slug}
                  path={path}
                  urlBranch={currentBranch}
                  defaultBranch={project.defaultBranch}
                />
                {showReadMe && (
                <ReadMeComponent
                  projectName={projectName}
                  projectId={gid}
                  branch={decodedBranch}
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

ProjectView.defaultProps = {
  mergeRequests: [],
};

ProjectView.propTypes = {
  project: shape({}).isRequired,
  mergeRequests: arrayOf(shape({})),
  projects: shape({
    all: arrayOf.isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
      file: string,
      branch: string,
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
    project: state.projects.selectedProject,
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

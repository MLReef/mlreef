import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf, bool,
} from 'prop-types';
import forkingImage from 'images/forking.png';
import { OPERATION, ALGORITHM, VISUALIZATION } from 'dataTypes';
import FilesContainer from 'components/FilesContainer';
import { generateBreadCrumbs } from 'functions/helpers';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { redirectNotFound } from 'store/actions/errorsActions';
import * as projectActions from 'store/actions/projectInfoActions';
import * as branchesActions from 'store/actions/branchesActions';
import * as processorActions from 'store/actions/processorActions';
import * as userActions from 'store/actions/userActions';
import * as jobsActions from 'store/actions/jobsActions';
import * as mergeActions from 'store/actions/mergeActions';
import ReadMeComponent from '../ReadMe/ReadMe';
import ProjectContainer from '../projectContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import './projectView.css';
import EmptyProject from './emptyProject';
import ProjectLastCommitSect from './LastCommitSect';

const isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined;

class ProjectView extends React.Component {
  constructor(props) {
    super(props);
    // esLint does not like state out of constructor
    this.state = {
      contributors: [], // disconnected
      isForking: false,
    };
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

  setIsForking(status) {
    this.setState({ isForking: status });
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
        return Promise.all([
          actions.getBranchesList(gid),
          actions.getMergeRequestsList(gid),
          actions.getUsersList(gid),
          actions.getProjectStarrers(gid),
        ]);
      })
      .catch(actions.redirectNotFound);
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

        if (project.projectType === PROJECT_TYPES.DATA) {
          actions.getProcessors(OPERATION);
          actions.getProcessors(ALGORITHM);
          actions.getProcessors(VISUALIZATION);
        }

        let promises = [
          actions.getBranchesList(gid),
          actions.getMergeRequestsList(gid),
          actions.getUsersList(gid),
          actions.getJobsListPerProject(gid),
          actions.getProjectStarrers(gid),
        ];

        if (project.searchableType === PROJECT_TYPES.CODE) {
          promises = [...promises, actions.getProjectPipelines(gid)];
        }

        return Promise.all(promises);
      })
      .catch(actions.redirectNotFound);
  }

  render() {
    const {
      project,
      project: {
        gid,
        httpUrlToRepo,
        readmeUrl: showReadMe,
        pipelines,
      },
      match: {
        params: {
          namespace,
          slug,
          path,
          branch,
        },
      },
      history,
      mergeRequests,
      branches,
      users,
    } = this.props;
    const {
      contributors,
      isForking,
    } = this.state;
    const currentBranch = isValidBranch(branch) ? branch : project.defaultBranch;
    const decodedBranch = decodeURIComponent(currentBranch);

    const customCrumbs = [
      {
        name: 'Data',
        href: `/${namespace}/${slug}`,
      },
    ];

    return (
      <div className="project-component">
        <Navbar />
        {isForking && (
          <div
            className="mx-auto mt-5 t-center"
            style={{ maxWidth: '250px' }}
          >
            <div>
              <h2 className="t-dark">Forking in progress</h2>
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
              breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
            />
          )}
          {gid && (
          <div className="main-content">
            {project.emptyRepo ? (
              <EmptyProject httpUrlToRepo={httpUrlToRepo} namespace={namespace} slug={slug} />
            ) : (
              <>
                <RepoInfo
                  project={project}
                  mergeRequests={mergeRequests}
                  currentBranch={decodedBranch}
                  numberOfContributors={contributors.length}
                  branchesCount={branches.length}
                  publicationsCount={pipelines?.length}
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
                  history={history}
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
                  projectId={gid}
                  namespace={namespace}
                  slug={slug}
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
  user: shape({
    auth: bool,
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
    getUsersList: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    users: state.users,
    user: state.user,
    branches: state.branches,
    mergeRequests: state.mergeRequests.list,
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
      redirectNotFound,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

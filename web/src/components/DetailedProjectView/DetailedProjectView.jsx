import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  string, shape, func, arrayOf, bool,
} from 'prop-types';
import forkingImage from 'images/forking.png';
import FilesContainer from 'components/FilesContainer';
import { generateBreadCrumbs } from 'functions/helpers';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { redirectNotFound } from 'store/actions/errorsActions';
import * as projectActions from 'store/actions/projectInfoActions';
import * as branchesActions from 'store/actions/branchesActions';
import * as userActions from 'store/actions/userActions';
import * as jobsActions from 'store/actions/jobsActions';
import * as mergeActions from 'store/actions/mergeActions';
import * as pipelineActions from 'store/actions/pipelinesActions';
import ReadMeComponent from '../ui/ReadMe/ReadMe';
import ProjectContainer from '../projectContainer';
import RepoInfo from '../repoInfo';
import RepoFeatures from '../repoFeatures';
import Navbar from '../navbar/navbar';
import './DetailedProjectView.scss';
import EmptyProject from '../layout/EmptyProject/EmptyProject';
import ProjectLastCommitSect from './LastCommitSect';
import projActions from './ProjectViewactionsAndFunctions';

const isValidBranch = (branch) => branch !== 'null' && branch !== null && branch !== undefined;

const DetailedProjectView = (props) => {
  const {
    project,
    project: {
      gid,
      httpUrlToRepo,
      readmeUrl: showReadMe,
      pipelines,
    },
    history,
    mergeRequests,
    branches,
    actions,
    user: { auth },
    match: {
      params: {
        namespace,
        slug,
        path,
        branch,
      },
    },
  } = props;

  const [isForking, setIsForking] = useState(false);

  useEffect(() => {
    (auth ? projActions.fetchIfAuthenticated(
      namespace,
      slug,
      actions,
    ) : projActions.fetchVisitor(
      namespace,
      slug,
      actions,
    ))
      .finally(() => actions.setIsLoading(false));
    actions.setIsLoading(true);
  }, []);

  const customCrumbs = [
    {
      name: project.searchableType === PROJECT_TYPES.DATA ? 'Data' : 'Code',
      href: `/${namespace}/${slug}`,
    },
  ];

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
          <>
            <ProjectContainer
              isEmptyProject={project.emptyRepo}
              setIsForking={setIsForking}
              activeFeature="data"
              breadcrumbs={generateBreadCrumbs(project, customCrumbs)}
            />
            <div className="main-content">
              {project.emptyRepo ? (
                <EmptyProject httpUrlToRepo={httpUrlToRepo} namespace={namespace} slug={slug} />
              ) : (
                <>
                  <RepoInfo
                    project={project}
                    mergeRequests={mergeRequests}
                    currentBranch={decodedBranch}
                    branchesCount={branches.length}
                    publicationsCount={pipelines?.length}
                  />
                  <ProjectLastCommitSect
                    projectId={gid}
                    branch={currentBranch}
                    projectDefaultBranch={project.defaultBranch}
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
          </>
        )}
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
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
      ...pipelineActions,
      redirectNotFound,
    }, dispatch),
  };
}

DetailedProjectView.defaultProps = {
  mergeRequests: [],
};

DetailedProjectView.propTypes = {
  project: shape({}).isRequired,
  mergeRequests: arrayOf(shape({})),
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
      file: string,
      branch: string,
      path: string,
    }),
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  user: shape({
    auth: bool,
  }).isRequired,
  branches: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,
  actions: shape({
    getUsersList: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailedProjectView);

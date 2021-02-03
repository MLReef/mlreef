import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import {
  func, shape, string, number, bool,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import { plainToClass } from 'class-transformer';
import DataProject from 'domain/project/DataProject';
import MEmptyAvatar from 'components/ui/MEmptyAvatar/MEmptyAvatar';
import MCloneDropdown from 'components/ui/MCloneDropdown';
import MDropdown from 'components/ui/MDropdown';
import SocialLinks from 'components/commons/SocialLinks';
import MWrapper from 'components/ui/MWrapper';
import { useGetOwned, useGetHasRole } from 'customHooks/permissions';
import SEO from 'components/commons/SEO';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CodeProject from 'domain/project/CodeProject';
import * as projectActions from 'store/actions/projectInfoActions';
// import { fixHostname } from 'functions/helpers';
import ProjectGeneralInfoApi from '../apis/ProjectGeneralInfoApi.ts';
import MLoadingSpinner from './ui/MLoadingSpinner';

const projectGeneralInfoApi = new ProjectGeneralInfoApi();

const ProjectTitleNActions = (props) => {
  const {
    project,
    actions,
    isLoading,
    userGid,
  } = props;

  const [isStarred, setIsStarred] = useState(null);
  const [isDisabledStarBtn, setIsDisabledStarBtn] = useState(false);
  const [starsCount, setStarsCount] = useState(project.starsCount);
  const isDataProject = project.projectType === PROJECT_TYPES.DATA_PROJ
    || project.projectType === PROJECT_TYPES.DATA;

  const isOwner = useGetOwned();
  const hasMinRole = useGetHasRole(10, { type: 'project' });
  const forkable = !isOwner && !hasMinRole && true;
  const classProject = isDataProject
    ? plainToClass(DataProject, project)
    : plainToClass(CodeProject, project);

  useEffect(() => {
    const starredByMe = project
      ?.projectStarrers
      ?.filter((starrer) => starrer?.user?.id === userGid)?.length > 0;
    setIsStarred(starredByMe);
    setStarsCount(project.starsCount);

    if (classProject.gid && !project.projectStarrers) {
      actions.getProjectStarrers(classProject.gid);
    }
  }, [classProject.gid, classProject.starsCount, classProject.projectStarrers]);

  function onClickStarBtn() {
    if (isDisabledStarBtn) return;
    setIsDisabledStarBtn(true);
    projectGeneralInfoApi.star(classProject.id, isStarred)
      .then(() => actions.getProjectDetailsBySlug(classProject.namespace, classProject.slug))
      .then(() => actions.getProjectStarrers(classProject.gid))
      .catch(() => toastr.error('Error', 'Something went wrong'))
      .finally(() => setIsDisabledStarBtn(false));
  }

  return (
    <div className="project-info">
      {!isLoading && (
        <SEO
          title={`${classProject.gitlabName} · MLReef`}
          description={classProject.description}
          image={classProject.avatarUrl}
          path={`/${classProject.namespace}/${classProject.slug}`}
          type="object"
        />
      )}
      <div className="project-id">
        {classProject.avatarUrl === null
          ? (
            <div>
              <MEmptyAvatar projectName={classProject.gitlabName} styleClass="avatar-sm" />
            </div>
          )
          : (
            <Link to={`/${project.namespace}/${project.slug}`}>
              <div className="project-pic overflow-hidden">
                <img style={{ minWidth: '100%' }} src={classProject.avatarUrl} alt="" />
              </div>
            </Link>
          )}
        <div className="project-name mb-2">
          <Link to={`/${project.namespace}/${project.slug}`} id="projectName">
            {classProject.gitlabName}
          </Link>
          <p id="projectId">
            Project ID:
            {`${classProject.id} | ${classProject.getRepositorySize()} used`}
          </p>
        </div>
      </div>
      <div className="project-options ml-auto">
        {isStarred === null || isDisabledStarBtn ? (
          <MLoadingSpinner />
        ) : (
          <div className="options d-flex mr-2">
            <button
              id="star-btn"
              type="button"
              className="option-name btn btn-hidden border-rounded-left py-2 px-3 my-0"
              onClick={onClickStarBtn}
            >
              <img
                className="mr-0 mr-lg-1 repo-actions-image"
                id="star-icon"
                src={isStarred ? '/images/stared.png' : '/images/star.png'}
                alt={isStarred ? 'unstar' : 'star'}
                title={isStarred ? 'unstar' : 'star'}
              />
            </button>

            <div className="counter border-rounded-right h-100">
              <span>{starsCount}</span>
            </div>
          </div>
        )}

        <div className="options d-flex mr-2">
          <div className="option-name btn btn-hidden border-rounded-left px-3 my-0">
            <i className="fa fa-share" />
          </div>
          <MDropdown
            label=""
            className="counter border-rounded-right h-100"
            align="right"
            component={(
              <div className="social-links-container">
                <SocialLinks />
              </div>
            )}
          />
        </div>

        {classProject.defaultBranch !== null && forkable && (
          <div className="options d-flex mr-2">
            <Link
              to={`/${project.namespace}/${project.slug}/-/fork`}
              className="option-name btn btn-hidden border-rounded-left border-rounded-right py-2 px-3 my-0"
            >
              <img className="mr-0 mr-lg-1 repo-actions-image" src="/images/svg/fork_01.svg" alt="" />
              <span className="my-auto d-none d-lg-block">Fork</span>
            </Link>

            <MWrapper norender title="Hidding the counter until the feature is ready in the API">
              <div className="counter border-rounded-right h-100">
                <span>{classProject.forksCount}</span>
              </div>
            </MWrapper>
          </div>
        )}
        <div className="options d-flex">
          <div className="option-name border-rounded-left py-2 px-3 my-0">
            <img className="mr-0 mr-lg-1 repo-actions-image" src="/images/svg/clone_01.svg" alt="" />
            <span className="my-auto d-none d-lg-block">Clone</span>
          </div>
          <MCloneDropdown className="border-rounded-right h-100" http={classProject.httpUrlToRepo} />
        </div>
      </div>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
    }, dispatch),
  };
}

function mapStateToProps({ projects: { selectedProject }, user, globalMarker }) {
  return {
    project: selectedProject,
    userNamespace: user.username || '',
    isLoading: globalMarker.isLoading,
    userGid: user?.userInfo?.id,
  };
}

ProjectTitleNActions.propTypes = {
  project: shape({
    avatarUrl: string,
    forksCount: number.isRequired,
    gitlabName: string.isRequired,
    gid: number.isRequired,
    defaultBranch: string,
    starsCount: number.isRequired,
    httpUrlToRepo: string.isRequired,
    sshUrlToRepo: string.isRequired,
  }).isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
  isLoading: bool.isRequired,
  userGid: number.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTitleNActions);

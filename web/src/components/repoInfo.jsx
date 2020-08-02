import React from 'react';
import { Link } from 'react-router-dom';
import { string, number, shape } from 'prop-types';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

const RepoInfo = ({
  project,
  mergeRequests,
  currentBranch,
  branchesCount,
  dataInstanesCount,
}) => {
  const isDataProject = project.searchableType === PROJECT_TYPES.DATA_PROJ
    || project.searchableType === PROJECT_TYPES.DATA;

  return (
  <>
    <div className="repo-info">
    {branchesCount > 0 && (
      <>
      <Link to={`/my-projects/${project.gitlabId}/${currentBranch}/commits`} className="repo-stat" replace>
        <p className="stat-no">{project.commitCount}</p>
        <p className="stat-type">Commits</p>
      </Link>
      <Link to={`/${project.namespace}/${project.slug}/-/branches`} className="repo-stat">
        <p className="stat-no">{branchesCount}</p>
        <p className="stat-type">Branches</p>
      </Link>
      </>
    )}
      <Link to={`/${project.namespace}/${project.slug}/-/merge_requests`} className="repo-stat">
        <p className="stat-no">{mergeRequests.length}</p>
        <p className="stat-type">Merge requests</p>
      </Link>

      {isDataProject ? (
        <>
          <Link className="repo-stat" to={`/my-projects/${project.gitlabId}/visualizations`}>
            <p className="stat-no" />
            <p className="stat-type">Visualizations</p>
          </Link>
          <Link to={`/${project.namespace}/${project.slug}/-/datasets`} className="repo-stat">
            <p className="stat-no">{dataInstanesCount}</p>
            <p className="stat-type">Datasets</p>
          </Link>
        </>
      ) : (
        <div className="repo-stat">
          <p className="stat-no">0</p>
          <p className="stat-type">Publications</p>
        </div>
      )}
    </div>
  </>
)};

RepoInfo.propTypes = {
  project: shape({
    gitlabId: number.isRequired,
    searchableType: string.isRequired,
    commitCount: number.isRequired,
  }),
  numberOfContributors: number.isRequired,
  currentBranch: string.isRequired,
  branchesCount: number.isRequired,
  dataInstanesCount: number.isRequired,
};

export default RepoInfo;

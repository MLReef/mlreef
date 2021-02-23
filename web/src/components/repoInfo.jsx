import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

const calculateSize = (pipeCategoriesArray) => pipeCategoriesArray 
  && pipeCategoriesArray?.length > 0
  ? pipeCategoriesArray.map((cat) => cat.values.length).reduce((a, b) => a + b)
  : 0;

const RepoInfo = ({
  project,
  mergeRequests,
  currentBranch,
  branchesCount,
  publicationsCount,
}) => {
  const isDataProject = project.searchableType === PROJECT_TYPES.DATA_PROJ
    || project.searchableType === PROJECT_TYPES.DATA;

  const datainstances = useSelector((state) => state.datainstances);
  const visualizations = useSelector((state) => state.visualizations);

  const datasetsArrSize = useMemo(() => calculateSize(datainstances), [datainstances]);
  const visualizationsArrSize = useMemo(() => calculateSize(visualizations), [visualizations]);

  const openedMergeRequests = mergeRequests.filter(({ state }) => state === 'opened');
  return (
    <>
      <div className="repo-info">
        {branchesCount > 0 && (
          <>
            <Link to={`/${project.namespace}/${project.slug}/-/commits/${currentBranch}`} className="repo-stat">
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
          <p className="stat-no">{openedMergeRequests.length}</p>
          <p className="stat-type">Merge requests</p>
        </Link>

        {isDataProject ? (
          <>
            <AuthWrapper minRole={10}>
              <Link className="repo-stat" to={`/${project.namespace}/${project.slug}/-/visualizations`}>
                <p className="stat-type">
                  {visualizationsArrSize}
                  {' '}
                  Visualizations
                </p>
              </Link>
            </AuthWrapper>
            <AuthWrapper minRole={10}>
              <Link disabled to={`/${project.namespace}/${project.slug}/-/datasets`} className="repo-stat">
                <p className="stat-type">
                  {datasetsArrSize}
                  {' '}
                  Datasets
                </p>
              </Link>
            </AuthWrapper>
          </>
        ) : (
          <Link className="repo-stat" to={`/${project.namespace}/${project.slug}/-/publications`}>
            <p className="stat-no">{publicationsCount}</p>
            <p className="stat-type">Publications</p>
          </Link>
        )}
      </div>
    </>
  );
};

RepoInfo.defaultProps = {
  mergeRequests: [],
  publicationsCount: 0,
};

RepoInfo.propTypes = {
  mergeRequests: PropTypes.arrayOf(PropTypes.shape({
    state: PropTypes.string.isRequired,
  })),
  project: PropTypes.shape({
    gitlabId: PropTypes.number.isRequired,
    searchableType: PropTypes.string.isRequired,
    namespace: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    commitCount: PropTypes.number.isRequired,
  }).isRequired,
  currentBranch: PropTypes.string.isRequired,
  branchesCount: PropTypes.number.isRequired,
  publicationsCount: PropTypes.number,
};

export default RepoInfo;

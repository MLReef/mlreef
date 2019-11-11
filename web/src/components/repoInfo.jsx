import React from 'react';
import { Link } from 'react-router-dom';
import { string, number } from 'prop-types';

const RepoInfo = ({
  projectId,
  numberOfContributors,
  currentBranch,
  branchesCount,
  dataInstanesCount,
}) => (
  <>
    <div className="repo-info">
      <Link to={`/my-projects/${projectId}/${currentBranch}/commits`} className="repo-stat" replace>
        <p className="stat-no" />
        <p className="stat-type">Commits</p>
      </Link>
      <div className="repo-stat">
        <p className="stat-no">{branchesCount}</p>
        <p className="stat-type">Branches</p>
      </div>
      <div className="repo-stat">
        <p className="stat-no" />
        <p className="stat-type">Visualizations</p>
      </div>
      <Link to={`/my-projects/${projectId}/${currentBranch}/data-instances`} className="repo-stat" replace>
        <p className="stat-no">{dataInstanesCount}</p>
        <p className="stat-type">Data Instances</p>
      </Link>
      <div className="repo-stat">
        <p className="stat-no">{numberOfContributors}</p>
        <p className="stat-type">Contributers</p>
      </div>
      <div className="repo-stat">
        <p className="stat-no" />
        <p className="stat-type">MIT License</p>
      </div>
    </div>
  </>
);

RepoInfo.propTypes = {
  projectId: number.isRequired,
  numberOfContributors: number.isRequired,
  currentBranch: string.isRequired,
  branchesCount: number.isRequired,
  dataInstanesCount: number.isRequired,
};

export default RepoInfo;

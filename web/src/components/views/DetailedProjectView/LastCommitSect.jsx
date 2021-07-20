import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import {
  string, number,
} from 'prop-types';
import { parseToCamelCase, getTimeCreatedAgo } from 'functions/dataParserHelpers';
import { getCommits } from 'functions/apiCalls';
import UserApi from 'apis/UserApi';
import CommitsApi from 'apis/CommitsApi';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';

const userApi = new UserApi();
const commitApi = new CommitsApi();

const ProjectLastCommitSect = ({
  projectId,
  branch: urlBranch,
  projectDefaultBranch,
  commitId,
}) => {
  const [lastCommit, setLastCommit] = useState(null);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (projectId) {
      // In some cases developer does not want to get a list of branch commits but a specific one,
      // so this conditional set the course of action require for each case.

      if (commitId) {
        commitApi.getCommitDetails(projectId, commitId)
          .then(parseToCamelCase)
          .then((res) => {
            const lastComm = parseToCamelCase(res);
            setLastCommit(lastComm);

            return lastComm;
          })
          .then((commitInfo) => userApi.getUserByUsername(commitInfo.authorName))
          .then((userArr) => setUserInfo(userArr.length > 0 ? userArr[0] : {}))
          .catch((err) => toastr.error('Error', err?.message));
      } else {
        const commitBranch = urlBranch !== '' && urlBranch !== 'null'
          ? urlBranch
          : projectDefaultBranch;

        getCommits(projectId, commitBranch)
          .then((res) => {
            const lastComm = parseToCamelCase(res[0]);
            setLastCommit(lastComm);

            return lastComm;
          }).then((commitInfo) => userApi.getUserByUsername(commitInfo.authorName))
          .then((userArr) => setUserInfo(userArr.length > 0 ? userArr[0] : {}))
          .catch((err) => toastr.error('Error', err?.message));
      }
    }
  }, [projectId, urlBranch, projectDefaultBranch]);

  const avatarName = userInfo.name || '';
  const today = new Date();
  const timediff = getTimeCreatedAgo(lastCommit?.authoredDate, today);

  return (
    <div className="last-commit-info">
      <div className="last-commit-details">
        {avatarName ? (
          <Link to={`/${avatarName}`}>
            <span style={{ position: 'relative' }}>
              <img className="avatar-circle mt-2" width="32" height="32" src={userInfo.avatar_url} alt="avatar" />
            </span>
          </Link>
        ) : (
          <MEmptyAvatar styleClass="avatar-sm" projectName={lastCommit?.authorName || ''} />
        )}
        <div className="last-commit-name">
          <p>
            {lastCommit?.message}
            <br />
            {' '}
            by
            {' '}
            <b>
              {avatarName ? (
                <Link to={`/${avatarName}`}>
                  {lastCommit?.authorName}
                </Link>
              ) : (
                lastCommit?.authorName
              )}
            </b>
            {' '}
            authored
            {' '}
            <b>{timediff}</b>
            {' '}
            ago
          </p>
        </div>
      </div>
      <div className="last-commit-id">
        <p>{lastCommit?.shortId}</p>
      </div>
    </div>
  );
};

ProjectLastCommitSect.propTypes = {
  projectId: number.isRequired,
  branch: string.isRequired,
  projectDefaultBranch: string.isRequired,
};

export default ProjectLastCommitSect;

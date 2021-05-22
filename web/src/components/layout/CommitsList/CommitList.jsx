import React from 'react';
import {
  arrayOf, number, shape, string,
} from 'prop-types';
import { pluralize } from 'functions/dataParserHelpers';
import CommitDiv from 'components/layout/CommitDiv/CommitDiv';
import './CommitList.scss';

const CommitsList = (props) => {
  const {
    commits,
    users,
    projectId,
    changesNumber,
    namespace,
    slug,
    branch,
  } = props;

  function extractColaborators(commitToExtractUsers) {
    const setOfUniqueNames = new Set(commitToExtractUsers.map((commit) => commit.author_name));
    return setOfUniqueNames.size;
  }
  const distinct = [
    ...new Set(
      commits.map(
        (x) => new Date(x.committed_date)
          .toLocaleString(
            'en-eu', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            },
          ),
      ),
    )];

  const colaborators = extractColaborators(commits);
  return (
    <div className="commit-list">
      <div className="commit-list-summary">
        <p>
          <b>
            {`${commits.length} commit${pluralize(commits.length)}`}
          </b>
        </p>
        <p>
          <b>
            {`${changesNumber} file${pluralize(changesNumber)} changed`}
          </b>
        </p>
        <p>
          <b>
            {`${colaborators} contributor${pluralize(colaborators)}`}
          </b>
        </p>
      </div>
      <div>
        {distinct.map((commit, index) => (
          <div key={index.toString()} className="commit-list-per-date">
            <div className="commit-list-per-date-header">
              <p>
                {` Commits on ${commit}`}
              </p>
            </div>
            {commits.map((item) => {
              let avatarImage;
              let userName;
              if (users) {
                users.forEach((user) => {
                  const { name } = user;
                  const avatarUrl = user.avatar_url;
                  if (name === item.author_name) {
                    avatarImage = avatarUrl;
                    userName = name;
                  }
                });
              }
              return (
                new Date(item.committed_date).toLocaleString('en-eu', { day: 'numeric', month: 'short', year: 'numeric' }) === commit
                  ? (
                    <CommitDiv
                      key={item.short_id}
                      projectId={projectId}
                      commitid={item.id}
                      title={item.title}
                      name={item.author_name}
                      id={item.short_id}
                      time={item.committed_date}
                      avatarImage={avatarImage}
                      userName={userName}
                      namespace={namespace}
                      slug={slug}
                      branch={branch}
                    />
                  )
                  : ''
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

CommitsList.propTypes = {
  commits: arrayOf(shape({

  })).isRequired,
  changesNumber: number.isRequired,
  users: arrayOf(shape({
    name: string.isRequired,
    avatar_url: string.isRequired,
  })).isRequired,
  projectId: number.isRequired,
  namespace: string.isRequired,
  slug: string.isRequired,
  branch: string.isRequired,
};

export default CommitsList;

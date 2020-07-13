import React from 'react';
import {
  arrayOf, number, shape, string,
} from 'prop-types';
import { pluralize } from 'functions/dataParserHelpers';
import { CommitDiv } from './commits-view/commitsView';

const CommitsList = ({
  commits, users, projectId, changesNumber,
}) => {
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
  return (
    <div style={{
      borderTopLeftRadius: '1em',
      borderTopRightRadius: '1em',
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '3px 5em',
        color: 'white',
        backgroundColor: '#32AFC3',
        borderRadius: 'inherit',
      }}
      >
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
            {`${extractColaborators(commits)} contributor${pluralize(extractColaborators(commits))}`}
          </b>
        </p>
      </div>
      <div>
        {distinct.map((commit, index) => (
          <div key={index.toString()} className="commit-per-date">
            <div className="commit-header">
              <p>
                {` Commits on ${commit}`}
              </p>
            </div>
            {commits.map((item) => {
              let avatarImage = 'https://assets.gitlab-static.net/uploads/-/system/user/avatar/3839940/avatar.png';
              let userName = '';
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
};

export default CommitsList;

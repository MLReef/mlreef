import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import iconGrey from 'images/icon_grey-01.png';
import MProjectCardTypes from './MProjectCardTypes';
import './MProjectCard.scss';

const MProjectCard = (props) => {
  const {
    projectId,
    title,
    description,
    branch,
    starCount,
    forkCount,
    namespace,
    inputDataTypes,
    outputDataTypes,
    push,
    users,
  } = props;

  return (
    <div className="card">
      <div
        role="button"
        tabIndex="0"
        className="card-container project-card-container"
        onClick={() => push(`/my-projects/${projectId}/${branch}`)}
        onKeyPress={() => push(`/my-projects/${projectId}/${branch}`)}
      >
        <p className="card-title">
          {title}
        </p>

        {namespace && (
          <div
            className="project-card-container-autor pb-3 mt-2"
          >
            <p>{namespace}</p>
          </div>
        )}

        <div className="card-content">
          <MProjectCardTypes input types={inputDataTypes} />
          <MProjectCardTypes output types={outputDataTypes} />

          {description && description.length === 0 ? (
            <div className="d-flex noelement-found-div" style={{ marginTop: '1rem' }}>
              <img src={iconGrey} alt="" style={{ maxHeight: '30px' }} />
              <p style={{ height: 'unset' }}>No description</p>
            </div>
          ) : (
            <p className="t-dark">{description}</p>
          )}

          <div className="d-flex t-secondary">
            <div className="mr-3">
              {!!starCount && (
                <i className="fa fa-star">
                  <span className="label">{` ${starCount}`}</span>
                </i>
              )}
            </div>
            <div className="mr-3">
              {!!forkCount && (
                <i className="fa fa-code-branch">
                  <span className="label">{` ${forkCount}`}</span>
                </i>
              )}
            </div>
          </div>
        </div>

        <div className="card-actions">
          {users && (
            <div className="avatars-reversed">
              {[...users].reverse().map((ava) => (
                <Link
                  key={`ava-cont-${ava.id}`}
                  to={`/${ava.username}`}
                  className="avatar-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={ava.avatar_url}
                    title={ava.username}
                    alt={ava.username}
                    className="project-card-avatar"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MProjectCard.defaultProps = {
  branch: 'master',
  description: null,
  starCount: null,
  forkCount: null,
  users: [],
  inputDataTypes: [],
  outputDataTypes: [],
};

MProjectCard.propTypes = {
  projectId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  branch: PropTypes.string,
  starCount: PropTypes.number,
  forkCount: PropTypes.number,
  namespace: PropTypes.string.isRequired,
  push: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
    avatar_id: PropTypes.string,
  })),
  inputDataTypes: PropTypes.arrayOf(PropTypes.string),
  outputDataTypes: PropTypes.arrayOf(PropTypes.string),
};

export default MProjectCard;

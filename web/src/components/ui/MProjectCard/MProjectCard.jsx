import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'router';
import iconGrey from 'images/icon_grey-01.png';
import MParagraph from 'components/ui/MParagraph';
import { PUBLIC } from 'dataTypes';
import publicIcon from 'images/public-01.svg';
import lockIcon from 'images/Lock-01.svg';
import MProjectCardTypes from './MProjectCardTypes';
import './MProjectCard.scss';

const MProjectCard = (props) => {
  const {
    title,
    description,
    starCount,
    forkCount,
    slug,
    namespace,
    inputDataTypes,
    visibility,
    /* outputDataTypes, */
    /* dataProcessor, */
    users,
    owner,
  } = props;

  const [avatars, setAvatars] = useState([]);

  /*
  const hasOutputTypes = !['ALGORITHM', 'VISUALIZATION']
    .some((t) => dataProcessor?.type === t); */

  useEffect(
    () => {
      let isMounted = true;

      if (users instanceof Promise) {
        users.then((results) => {
          if (isMounted) setAvatars(results);
        });
      }

      if (Array.isArray(users)) setAvatars(users);

      return () => { isMounted = false; };
    },
    [users],
  );

  return (
    <div className="card">
      {owner && (
        <div className="icon-visibility" style={{ fontSize: '1.2rem', borderRadius: '3px', right: '4rem', color: '#fff', backgroundColor: 'var(--lessWhite)' }}>
          <span className="p-2">Owner</span>
        </div>
      )}
      <img
        src={visibility === PUBLIC ? publicIcon : lockIcon}
        alt={visibility === PUBLIC ? 'public' : 'private'}
        width="24"
        height="24"
        className="icon-visibility"
        aria-hidden="true"
      />
      <div className="card-container project-card-container">
        <Link className="project-card-link" to={`/${namespace}/${slug}`}>
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
            {!description ? (
              <div className="d-flex noelement-found-div" style={{ marginTop: '1rem' }}>
                <img src={iconGrey} alt="" style={{ maxHeight: '30px' }} />
                <p style={{ height: 'unset' }}>No description</p>
              </div>
            ) : (
              <MParagraph className="card-content-description" text={description} />
            )}

            <div className="d-flex t-secondary">
              <div className="mr-3">
                <i className="fa fa-star">
                  <span className="label">{` ${starCount}`}</span>
                </i>
              </div>
              <div className="mr-3">
                <i className="fa fa-code-branch">
                  <span className="label">{` ${forkCount}`}</span>
                </i>
              </div>
            </div>
          </div>
        </Link>
        <div className="card-actions">
          <div className="avatars-reversed">
            {avatars.map((ava) => (
              <Link
                key={`ava-cont-${ava.id}`}
                to={`/${ava.username}`}
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
        </div>
      </div>
    </div>
  );
};

MProjectCard.defaultProps = {
  description: null,
  starCount: null,
  forkCount: null,
  users: [],
  inputDataTypes: [],
  visibility: null,
  owner: false,
  // outputDataTypes: [],
  dataProcessor: {},
};

MProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  starCount: PropTypes.number,
  forkCount: PropTypes.number,
  slug: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  // users: PropTypes.object,
  users: PropTypes.oneOfType([
    PropTypes.instanceOf(Object),
    PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      avatar_id: PropTypes.string,
    })),
  ]),
  inputDataTypes: PropTypes.arrayOf(PropTypes.string),
  // outputDataTypes: PropTypes.arrayOf(PropTypes.string),
  dataProcessor: PropTypes.shape({
    type: PropTypes.string,
  }),
  visibility: PropTypes.string,
  owner: PropTypes.bool,
};

export default MProjectCard;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'router';
import MParagraph from 'components/ui/MParagraph';
import { PUBLIC } from 'dataTypes';
import MProjectCardTypes from './MProjectCardTypes';
import './MProjectCard.scss';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

const publicIcon = '/images/public-01.svg';
const lockIcon = '/images/Lock-01.svg';
const iconGrey = '/images/icon_grey-01.png';

const MProjectCard = (props) => {
  const {
    title,
    description,
    starCount,
    forkCount,
    experimentsCount,
    slug,
    namespace,
    inputDataTypes,
    visibility,
    users,
    owner,
    published,
    classification,
    coverUrl,
    searchableType,
  } = props;

  const [avatars, setAvatars] = useState([]);

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
        <div
          className="icon-visibility"
          style={{
            fontSize: '1.2rem',
            borderRadius: '3px',
            right: '4rem',
            color: '#fff',
            backgroundColor: 'var(--lessWhite)',
          }}
        >
          <span className="p-2">Owner</span>
        </div>
      )}
      {published && <div className={`card-marker ${classification}-marker`} style={{ right: '4rem' }}>Published</div>}
      <img
        src={visibility === PUBLIC ? publicIcon : lockIcon}
        alt={visibility === PUBLIC ? 'public' : 'private'}
        width="24"
        height="24"
        className="icon-visibility"
        aria-hidden="true"
      />
      <div className={`card-container project-card-container ${classification}`}>
        <Link className="project-card-link" to={`/${namespace}/${slug}`}>
          {coverUrl && (
            <div className="card-image" style={{ backgroundImage: `url(${coverUrl})` }} />
          )}
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
              {searchableType === PROJECT_TYPES.DATA && (
                <div className="mr-3">
                  <i className="fa fa-flask">
                    <span className="label">{` ${experimentsCount}`}</span>
                  </i>
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="card-actions project-card-actions">
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
  dataProcessor: {},
  coverUrl: '',
};

MProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  starCount: PropTypes.number,
  forkCount: PropTypes.number,
  slug: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  users: PropTypes.oneOfType([
    PropTypes.instanceOf(Object),
    PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      avatar_id: PropTypes.string,
    })),
  ]),
  inputDataTypes: PropTypes.arrayOf(PropTypes.string),
  dataProcessor: PropTypes.shape({
    type: PropTypes.string,
  }),
  visibility: PropTypes.string,
  owner: PropTypes.bool,
  coverUrl: PropTypes.string,
};

export default MProjectCard;

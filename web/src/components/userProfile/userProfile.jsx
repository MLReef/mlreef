import React, { useEffect, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { getProfile } from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import './userProfile.scss';

const UserProfile = (props) => {
  const {
    match: {
      params: { user: username },
    },
  } = props;

  const dispatch = useDispatch();
  const { inspectedProfile: profile } = useSelector((state) => state.user);

  useEffect(
    () => {
      dispatch(getProfile(username));
    },
    [username, dispatch],
  );

  const {
    avatar_url: avatarImage,
    name,
    state,
    created_at: createdAt,
    status,
  } = profile;

  const since = useMemo(
    () => dayjs(createdAt).format('MMMM YYYY'),
    [createdAt],
  );

  return (
    <>
      <Navbar />
      <div className="layout-page">
        <div className="content-wrapper">
          <div className="user-profile t-dark">
            <img src={avatarImage} alt="avatar" />
            <h3 className="t-dark">
              {name}
            </h3>

            {status && status.message_html ? (
              // eslint-disable-next-line
              <div dangerouslySetInnerHTML={{ __html: status.message_html }} />
            ) : (status && status.message && (
              <p>
                {status.message}
              </p>
            ))}
            <p>
              {`@${username} | Member since ${since}`}
            </p>
            <p className="t-secondary my-2">
              {`status: ${state}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

UserProfile.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      user: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UserProfile;

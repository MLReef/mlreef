import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Link } from 'router';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import clock from 'images/clock.png';
import calender from 'images/calender.png';
import actionsAndFunctions from './PublicationActionsAndFunctions';

const PublicationInfoRow = ({ namespace, slug, pipe }) => {
  const link = `/${namespace}/${slug}/-/publications/${pipe.id}`;
  return (
    <tr key={pipe.id} className="publications-content-bottom-table-content">
      <td>
        <Link className="publications-content-bottom-table-content-link-to-publication" to={link}>
          <p style={{
            color: actionsAndFunctions.getColor(pipe.status),
          }}
          >
            <b>{pipe.status}</b>
          </p>
        </Link>
      </td>
      <td><Link className="publications-content-bottom-table-content-link-to-publication" to={link}><p>Latest</p></Link></td>
      <td><Link className="publications-content-bottom-table-content-link-to-publication" to={link}><p>Yes</p></Link></td>
      <td><Link className="publications-content-bottom-table-content-link-to-publication" to={link}><p>{pipe.ref}</p></Link></td>
      <td>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <p className="mr-2">{`#${pipe.id} by `}</p>
          <Link className="publications-content-bottom-table-content-link-to-user" to={`/${pipe?.user?.username}`}>
            <img
              src={pipe?.user?.avatarUrl}
              title={pipe?.user?.name}
              alt={`${pipe?.user?.name}`}
              className="project-card-avatar"
            />
          </Link>
        </div>
      </td>
      <td>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <img src={clock} alt="clock" height="15" />
          <p className="ml-1">
            {dayjs(pipe.createdAt).format('HH:mm:ss')}
          </p>
        </div>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <img src={calender} alt="calender" height="15" />
          <p className="ml-1">
            {getTimeCreatedAgo(pipe.createdAt)}
          </p>
        </div>
      </td>
    </tr>
  );
};

PublicationInfoRow.propTypes = {
  namespace: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  pipe: PropTypes.shape({
    id: PropTypes.number,
    status: PropTypes.string,
    ref: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      username: PropTypes.string,
      avatarUrl: PropTypes.string,
      name: PropTypes.string,
    })
  }).isRequired,
};

export default PublicationInfoRow;

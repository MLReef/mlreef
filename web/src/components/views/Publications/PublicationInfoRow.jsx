import React from 'react';
import dayjs from 'dayjs';
import { number, shape, string } from 'prop-types';
import { Link } from 'router';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import clock from 'images/clock.png';
import { getColorForStatus } from 'domain/Publications/metaData';
import calender from 'images/calender.png';
import MEmptyAvatar from 'components/ui/MEmptyAvatar';

const PublicationInfoRow = ({
  gid, namespace, slug, publication,
}) => {
  const link = `/${namespace}/${slug}/-/publications/${publication?.pipeline?.id}`;
  return (
    <tr key={publication.id} className="publications-content-bottom-table-content">
      <td>
        <Link className="publications-content-bottom-table-content-link-to-publication" to={link}>
          <p style={{
            color: `var(--${getColorForStatus(publication.status)})`,
          }}
          >
            <b>{publication.status}</b>
          </p>
        </Link>
      </td>
      <td>
        <p>{publication.version}</p>
      </td>
      <td><Link className="publications-content-bottom-table-content-link-to-publication" to={link}><p>Yes</p></Link></td>
      <td><Link className="publications-content-bottom-table-content-link-to-publication" to={link}><p>{publication.branch}</p></Link></td>
      <td>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <p className="mr-2">{publication?.pipeline?.id ? `#${publication?.pipeline?.id} by` : '---'}</p>
          <Link className="publications-content-bottom-table-content-link-to-user" to={`/${publication?.pipeline?.user?.username}`}>
            {publication?.pipeline?.user ? (
              <img
                src={publication?.pipeline?.user?.avatar_url}
                title={publication?.pipeline?.user?.name}
                alt={`${publication?.pipeline?.user?.name}`}
                className="project-card-avatar"
              />
            ) : (
              <MEmptyAvatar />
            )}
          </Link>
        </div>
      </td>
      <td>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <img src={clock} alt="clock" height="15" />
          <p className="ml-1">
            {dayjs(publication.jobStartedAt).format('HH:mm:ss')}
          </p>
        </div>
        <div className="d-flex" style={{ alignItems: 'center' }}>
          <img src={calender} alt="calender" height="15" />
          <p className="ml-1">
            {getTimeCreatedAgo(publication.jobStartedAt)}
          </p>
        </div>
      </td>
    </tr>
  );
};

PublicationInfoRow.propTypes = {
  namespace: string.isRequired,
  slug: string.isRequired,
  publication: shape({
    id: string,
    status: string,
    branch: string,
    createdAt: string,
    version: string.isRequired,
    jobStartedAt: string.isRequired,
    pipeline: shape({
      id: number.isRequired,
    }),
    user: shape({
      username: string,
      avatarUrl: string,
      name: string,
    }),
  }).isRequired,
};

export default PublicationInfoRow;

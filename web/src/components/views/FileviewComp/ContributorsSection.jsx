import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import MAvatar from 'components/ui/MAvatar';
import { Link } from 'react-router-dom';
import UserApi from 'apis/UserApi.ts';
import FilesApi from 'apis/FilesApi.ts';
import { number } from 'prop-types';

const userApi = new UserApi();

const filesApi = new FilesApi();

const ContributorsSection = (props) => {
  const {
    gid,
  } = props;
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    filesApi.getContributors(gid)
      .then((conts) => Promise.all(conts.map((c) => userApi.getAvatar(c.email)
        .then((av) => ({ ...c, avatarUrl: av.avatar_url })))))
      .then(setContributors)
      .catch((err) => toastr.error('Error: ', err.message));
  }, [gid]);

  return (
    <div className="fileview-commit-container-contributors">
      <div className="d-flex" style={{ alignItems: 'center' }}>
        {contributors.map((c) => (
          <Link key={c.name} to={`/${c.name}`}>
            <MAvatar
              imgBase={c.avatarUrl}
              projectName={c.name}
              styleClass="responsiveAvatar"
              width="30"
              height="30"
            />
          </Link>
        ))}
        <p className="m-0">
          <b>
            {contributors.length}
            {' '}
            contributor(s)
          </b>
        </p>
      </div>
    </div>
  );
};

ContributorsSection.propTypes = {
  gid: number.isRequired,
};

export default ContributorsSection;

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toastr } from 'react-redux-toastr';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import './SettingsViewMembers.scss';
import MDropdown from 'components/ui/MDropdown';
import MInput from 'components/ui/MInput';
import MSimpleSelect from 'components/ui/MSimpleSelect';
import MButton from 'components/ui/MButton';
import SearchApi from 'apis/MLSearchApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { parseDate } from 'functions/dataParserHelpers';

const projectApi = new ProjectGeneralInfoApi();
const searchApi = new SearchApi();
const today = parseDate(new Date());
const roleList = [
  { label: 'Guest', value: 'GUEST' },
  { label: 'Reporter', value: 'REPORTER' },
  { label: 'Developer', value: 'DEVELOPER' },
  { label: 'Maintainer', value: 'MAINTAINER' },
];

const SettingsViewMembers = (props) => {
  const {
    projectId,
    ownerId,
  } = props;

  const [queryUser, setQueryUser] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [role, setRole] = useState('GUEST');
  const [expiration, setExpiration] = useState('');
  const [waiting, setWaiting] = useState(false);

  // filter from search results
  const filterExistingMembers = useCallback((users) => users
    .filter((user) => !members.some((member) => member.gitlab_id === user.id)),
  [members]);

  // get members from project
  const populateMembers = useCallback(() => projectApi.getMembers(projectId)
    .then(setMembers),
  [projectId]);

  const addSelectedUser = () => {
    setWaiting(true);

    const formData = {
      gitlab_id: selectedUser.id,
      level: role,
      expires_at: new Date(expiration),
    };

    return projectApi.addMember(projectId, formData)
      .then(populateMembers)
      .then(() => {
        setQueryUser('');
        setSelectedUser({});
        setRole('GUEST');
        setExpiration('');
      })
      .catch((err) => {
        toastr.error('Failed adding member', err.message);
      })
      .finally(() => setWaiting(false));
  };

  const removeUser = (user) => {
    projectApi.removeMember(projectId, user.id)
      .then(populateMembers);
  };

  // handle search input
  const handleSetQueryUser = (e) => {
    setQueryUser(e.target.value);
  };

  // handle click
  const handleSelectUser = (result) => () => {
    setSelectedUser(result);
    setQueryUser(result.username);
  };

  const handleSetExpiration = (e) => {
    setExpiration(e.target.value);
  };

  // handle button
  const handleAddUser = () => addSelectedUser();

  // handle button
  const handleRemoveUser = (user) => () => removeUser(user);

  // TODO once API update es ready
  // const handleUpdateRole = (id, newRole) => () => {
  // };

  const handleUpdateExpiration = () => () => {
    // TODO once API update es ready, id => e => api-request
  };

  useEffect(
    () => { populateMembers(); },
    [populateMembers],
  );

  useEffect(
    () => {
      searchApi.getUsers(queryUser)
        .then(filterExistingMembers)
        .then(setUserSearchResults);
    },
    [queryUser, filterExistingMembers],
  );

  return (
    <div className="settings-view-members">
      <MSimpleTabs
        key="members"
        border
        sections={[
          {
            label: 'Invite member',
            content: (
              <div id="settigs-members-users">
                <div className="settings-view-search">
                  <MInput
                    id="settings-view-search-input search-users"
                    className="mt-2"
                    value={queryUser}
                    label={(<b>MLReef member or email address</b>)}
                    placeholder="Search for members to update or invite"
                    onChange={handleSetQueryUser}
                  />
                  <div className="settings-view-search-results">
                    <ul className="search-list box-shadow">
                      {userSearchResults.map((result) => (
                        // eslint-disable-next-line
                        <li
                          key={`user-${result.username}`}
                          className="search-list-item"
                          onClick={handleSelectUser(result)}
                        >
                          <div className="user-avatar">
                            <img src={result.avatar_url} alt={result.name} />
                          </div>
                          <div className="user-info">
                            <div className="user-info-name">
                              {result.name}
                            </div>
                            <div className="user-info-username">
                              {`@${result.username}`}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <MSimpleSelect
                  onChange={setRole}
                  footer="Read more about role permissions"
                  label="Choose a role permission"
                  options={roleList}
                  value={role}
                />

                <MInput
                  id="exp-date-users"
                  className="mt-3"
                  value={expiration}
                  type="date"
                  label={(<b>Access expiration date</b>)}
                  placeholder="Expiration date"
                  onChange={handleSetExpiration}
                  onBlur={() => {}}
                  min={today}
                />

                <MButton
                  className="btn btn-outline-primary"
                  onClick={handleAddUser}
                  waiting={waiting}
                  disabled={!selectedUser.id}
                  label="Add"
                />
              </div>
            ),
          },
          {
            disabled: true,
            label: 'Invite group',
            content: (
              <div id="settigs-members-groups">
                <MInput
                  id="search-groups"
                  className="mt-2"
                  value=""
                  label="Search a group to invite"
                  placeholder="Search for a group"
                  onChange={() => {}}
                />

                <MSimpleSelect
                  onChange={() => {}}
                  footer="Read more about role permissions"
                  label="Max access level"
                  options={[]}
                  value=""
                />

                <MInput
                  id="exp-groups"
                  className="mt-3"
                  value=""
                  type="date"
                  label="Access expiration date"
                  placeholder="Expiration date"
                  onChange={() => {}}
                  onBlur={() => {}}
                />
                <button type="button" className="btn btn-outline-primary">
                  Invite
                </button>
              </div>
            ),
          },
        ]}
      />
      <div className="panel mt-4">
        <div className="panel-header">
          Existing members and groups
        </div>
        <div className="panel-content">
          {members.map((member) => (
            <div key={`members-${member.id}`} className="panel-content-item">
              <div className="avatar d-none" />
              <div className="info">
                <div className="info-title">
                  <Link to={`/${member.user_name}`}>
                    <b>{`@${member.user_name}`}</b>
                  </Link>
                </div>
                <div className="info-subtitle">
                  {member.email}
                </div>
              </div>
              <div className="actions">
                {member.expired_at && (
                  <div className="date mr-2 border-rounded">
                    Until
                    <input
                      type="date"
                      min={today}
                      readOnly
                      value={parseDate(new Date())}
                      onChange={handleUpdateExpiration(member.id)}
                    />
                  </div>
                )}
                <MDropdown
                  className="mr-2"
                  label={member.access_level}
                  items={[]}
                />
                {ownerId !== member.id && (
                  <button
                    type="button"
                    onClick={handleRemoveUser(member)}
                    label="close"
                    className="btn btn-danger btn-icon fa fa-times my-auto"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SettingsViewMembers.propTypes = {
  projectId: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
};

// fragment for later use
// roleList.map((r) => ({
//   content: (
//     // eslint-disable-next-line
//     <div onClick={handleUpdateRole(member.id, r.value)}>
//       {r.label}
//     </div>
//   ),
// }))

export default SettingsViewMembers;

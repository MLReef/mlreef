import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import './SettingsViewMembers.scss';
import MInput from 'components/ui/MInput';
import MSimpleSelect from 'components/ui/MSimpleSelect';
import MButton from 'components/ui/MButton';
import SearchApi from 'apis/SearchApi';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';

// const logAndGo = (payload) => console.log(payload) || payload;

const projectApi = new ProjectGeneralInfoApi();

const SettingsViewMembers = (props) => {
  const {
    projectId,
    ownerId,
  } = props;

  const [queryUser, setQueryUser] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
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

    return projectApi.addMember(projectId, selectedUser.id)
      .then(populateMembers)
      .then(() => {
        setQueryUser('');
        setSelectedUser({});
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

  // handle button
  const handleAddUser = () => addSelectedUser();

  // handle button
  const handleRemoveUser = (user) => () => removeUser(user);

  useEffect(
    () => { populateMembers(); },
    [populateMembers],
  );

  useEffect(
    () => {
      SearchApi.getUsers(queryUser)
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
                    label="MLReef member or email address"
                    placeholder="Search for members to update or invite"
                    onChange={handleSetQueryUser}
                  />
                  <div className="settings-view-search-results">
                    <ul className="search-list">
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
                <MButton
                  className="btn btn-outline-primary"
                  onClick={handleAddUser}
                  waiting={waiting}
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
              <div className="avatar" />
              <div className="info">
                <div className="info-title">
                  <b>{`@${member.user_name}`}</b>
                </div>
                <div className="info-subtitle">
                  {member.email}
                </div>
              </div>
              <div className="actions">
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

export default SettingsViewMembers;

import React, { useEffect } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import MEmptyAvatar from 'components/ui/MEmptyAvatar/MEmptyAvatar';
import { bindActionCreators } from 'redux';
import Navbar from 'components/navbar/navbar';
import * as groupsActions from 'actions/groupsActions';
import MParagraph from 'components/ui/MParagraph';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import PropTypes from 'prop-types';
import GroupProjects from './GroupProjects';

const GroupsView = (props) => {
  const { groups, match: { params: { groupPath } }, actions } = props;
  const selectedGroup = groups?.filter((grp) => grp.path === groupPath)[0];
  const groupName = selectedGroup?.name;
  const breadcrumbs = [
    {
      name: 'Groups',
      href: '/groups',
    },
    {
      name: 'Overview',
    },
  ];

  const routes = [
    {
      path: `/groups/${selectedGroup?.path}`,
      exact: true,
      main: () => (
        <GroupProjects
          groupName={groupName}
          groupPath={groupPath}
          projects={selectedGroup?.projects}
        />
      ),
    },
  ];

  useEffect(() => {
    actions.getGroupsList(true);
  }, [actions]);

  return (
    <div>
      <Navbar />
      <div className="project-container" style={{ backgroundColor: 'var(--almostWhite)' }}>
        <div className="project-details main-content">
          <MBreadcrumb items={breadcrumbs} />
          <div className="project-id">
            {selectedGroup?.avatar_url === null
              ? (
                <div>
                  <MEmptyAvatar projectName={selectedGroup?.name} styleClass="avatar-sm" />
                </div>
              )
              : (
                <Link to={`/groups/${selectedGroup?.path}`}>
                  <div className="project-pic overflow-hidden">
                    <img style={{ minWidth: '100%' }} src={selectedGroup?.avatar_url} alt="" />
                  </div>
                </Link>
              )}
            <div className="project-name mb-2">
              <Link to={`/groups/${selectedGroup?.name}`} id="projectName">
                {selectedGroup?.name}
              </Link>
              <p id="projectId">
                Group ID:
                {`${selectedGroup?.id}`}
              </p>
            </div>
          </div>
          <MParagraph
            className="project-desc"
            text={selectedGroup?.description || ''}
            emptyMessage="No description"
          />
          <div className="feature-list">
            <Link to={`/groups/${groupPath}`} className="feature active" id="projects">
              Projects
            </Link>
          </div>
        </div>
      </div>
      <div style={{ alignItems: 'center' }} className="w-75 m-auto">
        <Switch>
          {routes.map((route, index) => (
            <Route
              key={index.toString()}
              path={route.path}
              exact={route.exact}
              component={route.main}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
};

GroupsView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      groupPath: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({}).isRequired,
  ).isRequired,
  actions: PropTypes.shape({
    getGroupsList: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    groups: state.groups,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...groupsActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsView);

import React from 'react';
import './SettingsView.scss';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ProjectContainer from 'components/projectContainer';
import Navbar from 'components/navbar/navbar';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import SettingsViewMembers from './SettingsViewMembers';
import SettingsViewGeneral from './SettingsViewGeneral';

const SettingsView = (props) => {
  const { project, history } = props;
  return (
    <div>
      <Navbar />
      <ProjectContainer
        setIsForking={() => {}}
        activeFeature="settings"
        viewName="Settings"
      />
      <div className="settings-view main-content">
        <div className="settings-view-content">
          <MSimpleTabs
            vertical
            pills
            tabStyle={{
              marginTop: '1rem',
              borderRadius: '5px',
            }}
            sections={[
              {
                label: 'General',
                content: (
                  <SettingsViewGeneral
                    id={project.id}
                    branch={project.defaultBranch}
                    projectName={project.gitlabName}
                    description={project.description}
                    avatar={project.avatarUrl}
                    ownerId={project.ownerId}
                    projectId={project.backendId}
                    history={history}
                  />
                ),
                defaultActive: true,
              },
              {
                label: 'Members',
                content: (
                  <SettingsViewMembers
                    ownerId={project.ownerId}
                    projectId={project.backendId}
                  />
                ),
              },
              {
                label: 'Storage',
                content: (<div>TODO storage</div>),
              },
              {
                label: 'Resources',
                content: (<div>TODO Resources</div>),
              },
              {
                label: 'Audit Events',
                content: (<div>TODO Audit Events</div>),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
SettingsView.propTypes = {
  project: PropTypes.shape({
    backendId: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    gitlabName: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state) => ({
  project: state.projects?.selectedProject,
});

export default connect(mapStateToProps)(SettingsView);

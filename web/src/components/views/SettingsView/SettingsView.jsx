import React from 'react';
import './SettingsView.scss';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ProjectContainer from 'components/projectContainer';
import Navbar from 'components/navbar/navbar';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import SettingsViewMembers from './SettingsViewMembers';

const SettingsView = (props) => {
  const { project } = props;

  return (
    <div>
      <Navbar />
      <ProjectContainer
        setIsForking={() => {}}
        activeFeature="settings"
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
                content: (<div>TODO general</div>),
              },
              {
                label: 'Members',
                content: (
                  <SettingsViewMembers
                    ownerId={project.ownerId}
                    projectId={project.backendId}
                  />
                ),
                defaultActive: true,
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
  }).isRequired,
};

const mapStateToProps = (state) => ({
  project: state.projects?.selectedProject,
});

export default connect(mapStateToProps)(SettingsView);

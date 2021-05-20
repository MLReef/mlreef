import React from 'react';
import './SettingsView.scss';
import PropTypes from 'prop-types';
import ProjectContainer from 'components/projectContainer';
import hooks from 'customHooks/useSelectedProject';
import Navbar from 'components/navbar/navbar';
import MSimpleTabs from 'components/ui/MSimpleTabs';
import SettingsViewMembers from './SettingsViewMembers';
import SettingsViewGeneral from './SettingsViewGeneral';

const SettingsView = (props) => {
  const {
    match: { 
      params : {
        namespace,
        slug,
      }
    },
    history,
  } = props;
  const customCrumbs = [
    {
      name: 'Settings',
      href: `/${namespace}/${slug}/-/settings`,
    },
  ];

  const [selectedProject,] = hooks.useSelectedProject(namespace, slug);

  return (
    <div>
      <Navbar />
      <ProjectContainer
        setIsForking={() => {}}
        activeFeature="settings"
        breadcrumbs={customCrumbs}
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
                    namespace={selectedProject.namespace}
                    slug={selectedProject.slug}
                    projectName={selectedProject.gitlabName}
                    description={selectedProject.description}
                    avatar={selectedProject.avatarUrl}
                    ownerId={selectedProject.ownerId}
                    projectId={selectedProject.id}
                    history={history}
                  />
                ),
                defaultActive: true,
              },
              {
                label: 'Members',
                content: (
                  <SettingsViewMembers
                    ownerId={selectedProject?.ownerId}
                    projectId={selectedProject?.id}
                  />
                ),
              },
              {
                label: 'Storage',
                disabled: true,
                content: (<div>TODO storage</div>),
              },
              {
                label: 'Resources',
                disabled: true,
                content: (<div>TODO Resources</div>),
              },
              {
                label: 'Audit Events',
                disabled: true,
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
    gid: PropTypes.number.isRequired,
    defaultBranch: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    gitlabName: PropTypes.string.isRequired,
    description: PropTypes.string,
    namespace: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
};

export default SettingsView;

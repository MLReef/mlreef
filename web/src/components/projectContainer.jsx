import React, { useEffect } from 'react';
import { Link } from 'router';
import {
  string, objectOf, shape, arrayOf,
} from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import MParagraph from 'components/ui/MParagraph';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import { connect } from 'react-redux';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import ProjectInfo from './ProjectTitleNActions';
import ProjectNav from './project-nav/projectNav';

const ProjectContainer = (props) => {
  const {
    activeFeature,
    globalColorMarker,
    project,
    project: { namespace, slug },
    forceShowExperimentList,
    viewName,
    breadcrumbs,
  } = props;
  useEffect(() => {
    const activeFeatureNode = document.getElementById(activeFeature);
    if (activeFeatureNode) {
      activeFeatureNode.classList.add('active');
      activeFeatureNode.style.borderBottom = `4px solid ${globalColorMarker}`;
    }
  }, [activeFeature, globalColorMarker]);

  const isDataProject = project.projectType === PROJECT_TYPES.DATA_PROJ
      || project.projectType === PROJECT_TYPES.DATA;

  let id; let description;
  let projectName;

  projectName = '--';
  if (project) {
    id = project.gid;
    description = project.description;
    projectName = project.gitlabName;
  }

  const projectRoute = { name: 'project', params: { namespace, slug } };

  return (
    <div className="project-container" style={{ backgroundColor: '#e5e5e5' }}>
      <div className="project-details main-content">
        {breadcrumbs.length > 0 ? (
          <MBreadcrumb items={breadcrumbs} />
        ) : ( // legacy
          <ProjectNav
            key={`project-key-${id}`}
            folders={[
              namespace,
              projectName,
              viewName,
            ]}
          />
        )}

        <ProjectInfo />
        <MParagraph
          className="project-desc"
          text={description}
          emptyMessage="No description"
        />
        <div className="feature-list">
          <Link to={projectRoute} className="feature" id="data">
            {isDataProject ? 'Data' : 'Code'}
          </Link>

          {isDataProject && (
          <AuthWrapper className="tab-disabled">
            <Link
              onClick={forceShowExperimentList}
              to={`/${namespace}/${slug}/-/experiments`}
              className="feature"
              id="experiments"
            >
              Experiments
            </Link>
          </AuthWrapper>
          )}
          {isDataProject && (
          <AuthWrapper className="tab-disabled">
            <Link to={`/${namespace}/${slug}/insights/-/jobs`} className="feature" id="insights">
              Insights
            </Link>
          </AuthWrapper>
          )}
          <AuthWrapper
            owneronly
            norender
            className="feature"
          >
            <Link
              onClick={forceShowExperimentList}
              to={`/${namespace}/${slug}/-/settings`}
              className="feature"
              id="settings"
            >
              Settings
            </Link>
          </AuthWrapper>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  const { user: { globalColorMarker }, projects: { selectedProject: project } } = state;
  return {
    globalColorMarker,
    project,
  };
}
ProjectContainer.defaultProps = {
  viewName: 'Data',
  breadcrumbs: [],
};

ProjectContainer.propTypes = {
  project: objectOf(shape).isRequired,
  activeFeature: string.isRequired,
  viewName: string,
  breadcrumbs: arrayOf(shape),
};

export default connect(mapStateToProps)(ProjectContainer);

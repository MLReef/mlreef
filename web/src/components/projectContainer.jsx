import React, { useEffect } from 'react';
import { Link } from 'router';
import {
  string, objectOf, shape, arrayOf, bool,
} from 'prop-types';
import AuthWrapper from 'components/AuthWrapper';
import MParagraph from 'components/ui/MParagraph';
import { generateBreadCrumbs } from 'functions/helpers';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import { connect } from 'react-redux';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { projectClassificationsProps } from 'dataTypes';
import ProjectInfo from './ProjectTitleNActions';

const ProjectContainer = (props) => {
  const {
    activeFeature,
    globalColorMarker,
    project,
    project: { namespace, slug },
    breadcrumbs,
    auth,
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

  let description;

  if (project) {
    description = project.description;
  }

  const projectRoute = { name: 'project', params: { namespace, slug } };

  const customBreadcrumbs = generateBreadCrumbs(project, breadcrumbs || [], auth);

  return (
    <div className="project-container" style={{ backgroundColor: '#e5e5e5' }}>
      <div className="project-details main-content">
        <MBreadcrumb items={customBreadcrumbs} />
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

          {(isDataProject && !project.emptyRepo) && (
            <>
              <Link
                to={`/${namespace}/${slug}/-/experiments`}
                className="feature"
                id="experiments"
              >
                Experiments
              </Link>
              <AuthWrapper className="tab-disabled">
                <Link to={`/${namespace}/${slug}/insights/-/jobs`} className="feature" id="insights">
                  Insights
                </Link>
              </AuthWrapper>
            </>
          )}
          <AuthWrapper
            owneronly
            norender
            className="feature"
          >
            <Link
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
  const { user: { globalColorMarker, auth }, projects: { selectedProject: project } } = state;
  return {
    auth,
    globalColorMarker,
    project,
  };
}
ProjectContainer.defaultProps = {
  breadcrumbs: [],
};

ProjectContainer.propTypes = {
  project: objectOf(shape).isRequired,
  activeFeature: string.isRequired,
  breadcrumbs: arrayOf(shape),
  globalColorMarker: string,
  auth: bool.isRequired,
};

ProjectContainer.defaultProps = {
  globalColorMarker: projectClassificationsProps[0].color,
};

export default connect(mapStateToProps)(ProjectContainer);

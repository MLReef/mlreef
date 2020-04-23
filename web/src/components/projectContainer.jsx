import React from 'react';
import { Link } from 'react-router-dom';
import {
  string, arrayOf, objectOf, shape,
} from 'prop-types';
import ProjectInfo from './projectInfo';
import ProjectNav from './project-nav/projectNav';
import { connect } from 'react-redux';

class ProjectContainer extends React.Component {
  componentDidMount() {
    const { activeFeature, globalColorMarker, } = this.props;
    const activeFeatureNode = document.getElementById(activeFeature);
    if (activeFeatureNode) { 
      activeFeatureNode.classList.add('active');
      activeFeatureNode.style.borderBottom = `4px solid ${globalColorMarker}`;
    };

  }

  render() {
    const { project, folders, forceShowExperimentList, setIsForking } = this.props;
    let id; let description; let
      defaultBranch;
    if (project) {
      id = project.id;
      description = project.description;
      defaultBranch = project.default_branch;
    }
    return (
      <div className="project-container" style={{ backgroundColor: '#e5e5e5' }}>
        <div className="project-details main-content">
          <ProjectNav key={`project-key-${id}`} projectId={id} folders={folders} />

          <ProjectInfo project={project} setIsForking={setIsForking} />
          <p className="project-desc">
            {description || 'No description'}
          </p>
          <div className="feature-list">
            <Link to={`/my-projects/${id}/${defaultBranch}`} className="feature" id="data">
              Data
            </Link>
            <Link
              onClick={forceShowExperimentList}
              to={`/my-projects/${id}/experiments-overview`}
              className="feature"
              id="experiments"
            >
              <p>Experiments</p>
            </Link>
            <Link to={`/my-projects/${id}/insights/-/jobs`} className="feature" id="insights">
              Insights
            </Link>
          </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  const { user: { globalColorMarker }, projects: { selectedProject: project } } = state;
  return {
    globalColorMarker,
    project,
  };
}

ProjectContainer.propTypes = {
  project: objectOf(shape).isRequired,
  activeFeature: string.isRequired,
  folders: arrayOf(string).isRequired,
};

export default connect(mapStateToProps)(ProjectContainer);

import React from 'react';
import { Link } from 'react-router-dom';
import { string, arrayOf, objectOf, shape } from 'prop-types';
import ProjectInfo from './projectInfo';
import ProjectNav from './projectNav';

class ProjectContainer extends React.Component {
  componentDidMount() {
    const { activeFeature } = this.props;
    if(document.getElementById(activeFeature)) document.getElementById(activeFeature).classList.add('active');
  }

  render() {
    const { project, folders } = this.props;
    let id, description, default_branch;
    if (project) {
      id = project.id;
      description = project.description;
      default_branch = project.default_branch;
    }
    return (
      <div className="project-container">
        <div className="project-details main-content">
          <ProjectNav key={`project-key-${id}`} projectId={id} folders={folders} />

          <ProjectInfo project={project} />
          <p className="project-desc">
            {description ? description : 'No description'}
          </p>
          <div className="feature-list">
            <Link to={`/my-projects/${id}/${default_branch}`} className="feature" id="data">
              Data
            </Link>
            <Link to={`/my-projects/${id}/experiments-overview`} className="feature" id="experiments">
              <p>Experiments</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

ProjectContainer.propTypes = {
  project: objectOf(shape).isRequired,
  activeFeature: string.isRequired,
  folders: arrayOf(string).isRequired,
};

export default ProjectContainer;

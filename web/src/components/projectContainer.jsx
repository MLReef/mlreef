import React from 'react';
import { Link } from 'react-router-dom';
import { string, arrayOf, objectOf, shape } from 'prop-types';
import ProjectInfo from './projectInfo';
import ProjectNav from './projectNav';

class ProjectContainer extends React.Component {
  componentDidMount() {
    const { activeFeature } = this.props;
    document.getElementById(activeFeature).classList.add('active');
  }

  render() {
    const { project, folders } = this.props;
    return (
      <div className="project-container">
        <div className="project-details main-content">
          <ProjectNav key={`project-key-${project.id}`} projectId={project.id} folders={folders} />

          <ProjectInfo info={project} />
          <p className="project-desc">
            {project.description ? project.description : 'No description'}
          </p>
          <div className="feature-list">
            <Link to={`/my-projects/${project.id}/${project.default_branch}`} className="feature" id="data">
              Data
            </Link>
            <Link to={`/my-projects/${project.id}/experiments-overview`} className="feature" id="experiments">
              <p>Experiments</p>
            </Link>
            <div className="feature ">
              <p>Inference</p>
            </div>
            <div className="feature ">
              <p>Insights</p>
            </div>
            <div className="feature ">
              <p>Pull Requests</p>
            </div>
            <div className="feature ">
              <p>Settings</p>
            </div>
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

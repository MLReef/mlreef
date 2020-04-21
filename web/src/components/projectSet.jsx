import React from 'react';
import {
  arrayOf, shape, string,
} from 'prop-types';
import MProjectCard from './ui/MProjectCard';
import iconGrey from '../images/icon_grey-01.png';

class ProjectSet extends React.Component {
  handleScreen = (screen) => () => {
    const {
      changeScreen,
    } = this.props;

    return changeScreen(screen);
  }

  render() {
    const {
      allProjects,
      personalProjects,
      starredProjects,
      handleShowModal,
      screen,
      push,
    } = this.props;
    let finalProjectsArray = [];
    switch (screen) {
      case '#personal':
        finalProjectsArray = personalProjects;
        break;
      case '#starred':
        finalProjectsArray = starredProjects;
        break;
      default:
        finalProjectsArray = allProjects;
        break;
    }
    return (
      <div id="cards-section">
        {finalProjectsArray.length > 0 ? finalProjectsArray.map((proj) => (
          <MProjectCard
            key={`proj-${screen}-key-${proj.name}`}
            push={push}
            owner={proj.id}
            title={proj.name}
            projectId={proj.id}
            branch={proj.default_branch}
            description={proj.description}
            starCount={proj.star_count}
            forkCount={proj.forks_count}
            namespace={proj.namespace}
            updatedAt={proj.last_activity_at}
            projects={allProjects}
            handleShowModal={handleShowModal}
          />
        )) : (
          <div className="d-flex noelement-found-div">
            <img src={iconGrey} alt="" style={{ maxHeight: '100px' }} />
            <p>No projects found</p>
          </div>
        )}
      </div>
    );
  }
}

ProjectSet.defaultProps = {
  screen: '#personal',
};

ProjectSet.propTypes = {
  screen: string,
  allProjects: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,

  starredProjects: arrayOf(shape({}).isRequired).isRequired,

  personalProjects: arrayOf(shape({}).isRequired).isRequired,

};

export default ProjectSet;

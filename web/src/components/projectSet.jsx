import React, { Component } from 'react';
import {
  arrayOf, shape, string, bool,
} from 'prop-types';
import MBricksWall from 'components/ui/MBricksWall';
import MProjectCard from './ui/MProjectCard';
import iconGrey from '../images/icon_grey-01.png';

class ProjectSet extends Component {
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
      isLoading,
      screen,
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

    if (isLoading) {
      return (
        <div id="cards-section">
          <div className="loading-image">
            <div style={{ backgroundImage: 'url(/images/MLReef_loading.gif)' }} />
          </div>
        </div>
      );
    }

    return (
      <div id="cards-section">
        {finalProjectsArray.length > 0 ? (
          <MBricksWall
            className="w-100"
            animated
            bricks={finalProjectsArray.map((proj) => (
              <MProjectCard
                key={`proj-${proj.gitlabNamespace}-${proj.slug}-${proj.id}`}
                slug={proj.slug}
                owner={proj.id}
                title={proj.name}
                projectId={proj.gitlabId}
                description={proj.description}
                starCount={proj.starCount || 0}
                forkCount={proj.forksCount || 0}
                namespace={proj.gitlabNamespace}
                updatedAt={proj.lastActivityat}
                projects={allProjects}
                dataProcessor={proj.dataProcessor}
                inputDataTypes={proj.inputDataTypes}
                outputDataTypes={proj.inputDataTypes}
                handleShowModal={handleShowModal}
                users={proj.members}
              />
            ))}
          />
        ) : (
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
  isLoading: false,
};

ProjectSet.propTypes = {
  screen: string,
  allProjects: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,
  isLoading: bool,
  starredProjects: arrayOf(shape({}).isRequired).isRequired,
  personalProjects: arrayOf(shape({}).isRequired).isRequired,
};

export default ProjectSet;

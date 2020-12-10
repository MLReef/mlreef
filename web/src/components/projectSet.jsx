import React from 'react';
import { connect } from 'react-redux';
import {
  arrayOf, shape,
} from 'prop-types';
import MBricksWall from 'components/ui/MBricksWall';
import MProjectCard from './ui/MProjectCard';
import iconGrey from '../images/icon_grey-01.png';

const ProjectSet = (props) => {
  const {
    allProjects,
    user: { id: userId },
    classification,
  } = props;
  return (
    <div id="cards-section">
      {allProjects.length > 0 ? (
        <MBricksWall
          className="w-100"
          animated
          bricks={allProjects.map((proj) => (
            <MProjectCard
              key={`proj-${proj.gitlabNamespace}-${proj.slug}-${proj.id}`}
              slug={proj.slug}
              title={proj.name}
              projectId={proj.gitlabId}
              description={proj.description}
              starCount={proj.starsCount || 0}
              forkCount={proj.forksCount || 0}
              namespace={proj.gitlabNamespace}
              updatedAt={proj.lastActivityat}
              projects={allProjects}
              dataProcessor={proj.dataProcessor}
              inputDataTypes={proj.inputDataTypes}
              outputDataTypes={proj.inputDataTypes}
              users={proj.members}
              visibility={proj.visibilityScope}
              owner={proj.ownerId === userId}
              classification={classification}
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
};

ProjectSet.propTypes = {
  allProjects: arrayOf(
    shape({
    }).isRequired,
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(ProjectSet);

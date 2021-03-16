import React, { useMemo } from 'react';
import { arrayOf, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import MBricksWall from 'components/ui/MBricksWall';
import MProjectCard from './ui/MProjectCard';
import iconGrey from '../images/icon_grey-01.png';

const comparingFunctions = {
  ALL: (PA, PB) => (PA.name.toLowerCase() > PB.name.toLowerCase()),
  POPULAR: (PA, PB) => (PB.starsCount > PA.starsCount),
};

const ProjectSet = (props) => {
  const {
    sorting,
    projects,
    user: { id: userId },
    classification,
  } = props;

  const sortedProject = useMemo(
    () => projects.sort(comparingFunctions[sorting]),
    [projects, sorting],
  );

  return (
    <div id="cards-section">
      {projects.length > 0 ? (
        <MBricksWall
          className="w-100"
          animated
          bricks={sortedProject.map((proj) => (
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
              projects={projects}
              dataProcessor={proj.dataProcessor}
              inputDataTypes={proj.inputDataTypes}
              outputDataTypes={proj.inputDataTypes}
              users={proj.members}
              visibility={proj.visibilityScope}
              owner={proj.ownerId === userId}
              published={proj.published}
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
  sorting: string.isRequired,
  projects: arrayOf(shape({})),
  user: shape({ id: string }).isRequired,
  classification: string.isRequired,
};

ProjectSet.defaultProps = {
  projects: [],
};

function mapStateToProps(state) {
  return {
    sorting: state.projects.sorting,
    projects: state.projects.all,
    user: state.user,
  };
}

export default connect(mapStateToProps)(ProjectSet);

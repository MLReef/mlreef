import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import MProjectCard from 'components/ui/MProjectCard';
import MBricksWall from 'components/ui/MBricksWall';
import iconGrey from 'images/icon_grey-01.png';

const ExploreViewProjectSet = (props) => {
  const {
    started,
    projects,
  } = props;

  const loadingSection = useMemo(
    () => (
      <div className="loading-image">
        <div style={{ backgroundImage: 'url(/images/MLReef_loading.gif)' }} />
      </div>
    ),
    [],
  );

  const projectList = useMemo(
    () => (
      <MBricksWall
        className="w-100"
        animated
        bricks={projects.map((proj) => (
          <MProjectCard
            className="bg-white"
            key={`proj-${proj.gitlabNamespace}-${proj.slug}`}
            slug={proj.slug}
            owner={proj.id}
            title={proj.name}
            projectId={proj.gitlabId}
            description={proj.description}
            starCount={proj.starCount || 0}
            forkCount={proj.forksCount || 0}
            namespace={proj.gitlabNamespace}
            updatedAt={proj.lastActivityat}
            projects={projects}
            dataProcessor={proj.dataProcessor}
            inputDataTypes={proj.inputDataTypes}
            outputDataTypes={proj.inputDataTypes}
            users={proj.members}
            visibility={proj.visibilityScope}
          />
        ))}
      />
    ),
    [projects],
  );

  const checkEmpty = useMemo(
    () => projects.length > 0 ? projectList : (
      <div className="d-flex noelement-found-div">
        <img src={iconGrey} alt="" style={{ maxHeight: '100px' }} />
        <p>No projects found</p>
      </div>
    ),
    [projects, projectList],
  );

  return !started ? loadingSection : checkEmpty;
};

ExploreViewProjectSet.defaultProps = {
  projects: [],
};

ExploreViewProjectSet.propTypes = {
  started: PropTypes.bool.isRequired,
  projects: PropTypes.arrayOf(PropTypes.shape({})),
};

export default ExploreViewProjectSet;

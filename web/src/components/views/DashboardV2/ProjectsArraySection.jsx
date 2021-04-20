import React, {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import { toastr } from 'react-redux-toastr';
import { bindActionCreators } from 'redux';
import {
  bool, func, shape, string,
} from 'prop-types';
import { connect } from 'react-redux';
import MBricksWall from 'components/ui/MBricksWall';
import * as userActions from 'store/actions/userActions';
import iconGrey from 'images/icon_grey-01.png';
import MProjectCard from 'components/ui/MProjectCard';
import dashboardActions from './dashBoardActions';
import { DashboardContext } from './DashboardContext';
import { dataTypes } from './constants';

const comparingFunctions = {
  0: (PA, PB) => (PA.name.toLowerCase() > PB.name.toLowerCase() ? 1 : -1), // All
  1: (PA, PB) => PB.starsCount > PA.starsCount ? 1 : -1, // Popular
};

const ProjectsArraySection = (props) => {
  const {
    classification1, classification2, actions, isLoading,
  } = props;
  const [projects, setProjects] = useState([]);
  const [{
    selectedDataTypes, minimumStars, publishState, sorting,
  }] = useContext(DashboardContext);

  const executeFetch = useCallback(() => dashboardActions.getProjects(
    classification2.toUpperCase(),
    dashboardActions.buildProjectsRequestBodyV2(
      classification1,
      dashboardActions.getDataTypeNames(dataTypes, selectedDataTypes),
      minimumStars,
      dashboardActions.getValuesStateOptions(publishState),
    ),
    0,
    25,
  ).then((res) => setProjects(res.projects))
    .catch((err) => {
      toastr.error('Error', err.message);
    })
    .finally(() => actions.setIsLoading(false)),
  [classification1, classification2, selectedDataTypes, dataTypes, minimumStars, publishState]);

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  const sortedProjects = useMemo(
    () => projects.sort(comparingFunctions[sorting]),
    [projects, sorting],
  );

  return (
    <div className="dashboard-v2-content-projects">
      <div className="dashboard-v2-content-projects-count">
        <p>
          {sortedProjects.length}
          {' '}
          projects found
        </p>
      </div>
      <div className="dashboard-v2-content-projects-margin-div">
        {sortedProjects.length > 0 && !isLoading ? (
          <MBricksWall
            animated
            bricks={sortedProjects.map((proj) => (
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
                projects={sortedProjects}
                dataProcessor={proj.dataProcessor}
                inputDataTypes={proj.inputDataTypes}
                outputDataTypes={proj.inputDataTypes}
                users={proj.members}
                visibility={proj.visibilityScope}
                owner={proj.ownerId === ''}
                published={proj.published}
                classification={classification2}
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
    </div>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.globalMarker?.isLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...userActions,
    }, dispatch),
  };
}

ProjectsArraySection.propTypes = {
  classification1: string.isRequired,
  classification2: string.isRequired,
  isLoading: bool.isRequired,
  actions: shape({ setIsLoading: func }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsArraySection);

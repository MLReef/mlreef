import React, {
  useCallback,
  useContext, useEffect, useMemo, useRef, useState,
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
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import dashboardActions from './dashBoardActions';
import { DashboardContext } from './DashboardContext';

const comparingFunctions = {
  0: (PA, PB) => (PA.name.toLowerCase() > PB.name.toLowerCase() ? 1 : -1), // All
  1: (PA, PB) => PB.starsCount > PA.starsCount ? 1 : -1, // Popular
};

const ProjectsArraySection = (props) => {
  const {
    classification1, classification2, actions, isLoading,
  } = props;
  const [projects, setProjects] = useState([]);
  const scrolling = useRef(false);
  const [page, setPage] = useState(0);
  const isLast = useRef(false);
  const [{
    selectedDataTypes, minimumStars, publishState, sorting,
  }] = useContext(DashboardContext);

  const fetch = () => dashboardActions.getProjects(
    classification2,
    classification1,
    selectedDataTypes,
    minimumStars,
    publishState,
    page,
    10,
  ).then((res) => {
    scrolling.current = false;
    isLast.current = res.last;
    setProjects(
      page === 0
        ? res.projects
        : [...projects, ...res.projects],
    );
  })
    .catch((err) => {
      toastr.error('Error', err.message);
    })
    .finally(() => actions.setIsLoading(false));

  const executeFetch = useCallback(() => {
    scrolling.current = true;
    setPage(0);
    fetch();
  },
  [
    classification1,
    classification2,
    selectedDataTypes,
    minimumStars,
    publishState,
  ]);

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  const executeFetchOnMore = useCallback(() => {
    scrolling.current = true;
    fetch();
  },
  [page]);

  useEffect(() => {
    executeFetchOnMore();
  }, [executeFetchOnMore]);

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
          <MScrollableSection
            className="w-100"
            handleOnScrollDown={() => {
              if (scrolling.current) return;
              if (isLast.current) return;
              setPage(page + 1);
            }}
          >
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
          </MScrollableSection>
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

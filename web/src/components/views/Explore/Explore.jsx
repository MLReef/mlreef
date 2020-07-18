import React, { useState, useCallback, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar from 'components/navbar/navbar';
import MTabs from 'components/ui/MTabs';
import MDataFilters from 'components/ui/MDataFilters';
import MProjectCard from 'components/ui/MProjectCard';
import { projectClassificationsProps } from 'dataTypes';
import * as projectActions from 'actions/projectInfoActions';
import { suscribeRT, onlyDataProject, onlyCodeProject } from 'functions/apiCalls';
import './Explore.scss';

const { classification } = projectClassificationsProps[2];

const dataTypes = [
  { name: `${classification} data-types`, label: 'Text' },
  { name: `${classification} data-types`, label: 'Image' },
  { name: `${classification} data-types`, label: 'Audio' },
  { name: `${classification} data-types`, label: 'Video' },
  { name: `${classification} data-types`, label: 'Tabular' },
];

const Explore = (props) => {
  const {
    actions,
    allProjects,
  } = props;

  const [isFetching, setIsFetching] = useState(true);

  const fetch = useCallback(
    () => {
      return Promise.all([
        actions.getProjectsList(),
        // actions.getGroupsList(),
      ])
        .catch(() => {
        })
        .finally(() => {
          setIsFetching(false);
          // actions.setIsLoading(false);
        });
    },
    [actions, setIsFetching],
  );

  useEffect(
    () => {
      const unsuscribeServices = suscribeRT({ timeout: 30000 })(fetch);
      return unsuscribeServices;
    },
    [fetch],
  );

  return (
    <div className="explore-view">
      <Navbar />

      <div className="explore-view-content">
        <MTabs>
          <MTabs.Section
            defaultActive
            id={projectClassificationsProps[0].classification}
            label="ML Projects"
            color={projectClassificationsProps[0].color}
          >
            <div className="explore-view-content-container">
              <MTabs left pills className="w-100">
                <MTabs.Section defaultActive wide id="allProjects" label="All" className="project-list">
                  {!isFetching ? allProjects.filter(onlyDataProject).map((proj) => (
                    <MProjectCard
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
                      projects={allProjects}
                      inputDataTypes={proj.inputDataTypes}
                      outputDataTypes={proj.inputDataTypes}
                      users={proj.members}
                    />
                  )) : (
                    <div className="">
                      Loading...
                    </div>
                  )}
                </MTabs.Section>
                <MTabs.Section id="popular" label="Popular">
                  ufo
                </MTabs.Section>
              </MTabs>
              <MDataFilters types={dataTypes} />
            </div>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[1].classification}
            label="Models"
            color={projectClassificationsProps[1].color}
          >
          <div className="explore-view-content-container">
            <MTabs left pills>
              <MTabs.Section defaultActive wide id="allProjects" label="All" className="project-list">
                {!isFetching ? allProjects.filter(onlyCodeProject).map((proj) => (
                  <MProjectCard
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
                    projects={allProjects}
                    inputDataTypes={proj.inputDataTypes}
                    outputDataTypes={proj.inputDataTypes}
                    users={proj.members}
                  />
                )) : (
                  <div className="">
                    Loading...
                  </div>
                )}
              </MTabs.Section>
              <MTabs.Section id="popular" label="Popular">
                ufo
              </MTabs.Section>
            </MTabs>
            <MDataFilters types={dataTypes} />
          </div>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[2].classification}
            label="Data Operations"
            color={projectClassificationsProps[2].color}
          >
            <div className="explore-view-content-container">
              TODO
            </div>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[3].classification}
            label="Data visualizations"
            color={projectClassificationsProps[3].color}
          >
            <div className="explore-view-content-container">
              TODO
            </div>
          </MTabs.Section>
        </MTabs>

      </div>
    </div>
  );
};

Explore.defaultProps = {
  allProjects: [],
};

Explore.propTypes = {
  allProjects: PropTypes.arrayOf(PropTypes.shape({})),
  actions: PropTypes.shape({
    getProjectsList: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  allProjects: state.projects.all,
  // groups: state.groups,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...projectActions,
    // ...groupsActions,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Explore);

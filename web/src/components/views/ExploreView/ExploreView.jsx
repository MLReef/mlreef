import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar from 'components/navbar/navbar';
import MWrapper from 'components/ui/MWrapper';
import MTabs from 'components/ui/MTabs';
import MSimpleTabs from 'components/ui/MSimpleTabs/MSimpleTabsRouted';
import MDataFilters from 'components/ui/MDataFilters';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { projectClassificationsProps } from 'dataTypes';
import * as projectActions from 'actions/projectInfoActions';
import { setIsLoading } from 'actions/globalMarkerActions';
import { onlyDataProject } from 'functions/apiCalls';
import ExploreViewProjectSet from './ExploreViewProjectSet';
import './ExploreView.scss';

// const { classification } = projectClassificationsProps[2];

const dataTypes = [
  // { name: `${classification} data-types`, label: 'Text' },
  // { name: `${classification} data-types`, label: 'Image' },
  // { name: `${classification} data-types`, label: 'Audio' },
  // { name: `${classification} data-types`, label: 'Video' },
  // { name: `${classification} data-types`, label: 'Tabular' },
];

const ExploreView = (props) => {
  const {
    actions,
    allProjects,
    codeProjects,
    pagination,
  } = props;

  const [started, setStarted] = useState(false);

  const fetch = useCallback(
    () => {
      const handleFinally = () => {
        setStarted(true);
        actions.setIsLoading(false);
      };

      if (pagination.last) return handleFinally();

      actions.setIsLoading(true);

      const execRequest = (type) => actions
        .getDataProcessorsAndCorrespondingProjects(type, {}, { explore: true });

      const nextPage = typeof pagination.number === 'number' ? pagination.number + 1 : 0;

      return Promise.all([
        actions.getProjectsList(nextPage, 20),
        // actions.getGroupsList(),
        execRequest(PROJECT_TYPES.ALGORITHM),
        execRequest(PROJECT_TYPES.OPERATION),
        execRequest(PROJECT_TYPES.VISUALIZATION),
      ])
        .catch(() => {
        })
        .finally(handleFinally);
    },
    [actions, setStarted, pagination],
  );

  useEffect(
    () => {
      // commented because fetch() now depends on pagination.
      // suscribeRT must be rethough.
      // const unsuscribeServices = suscribeRT({ timeout: 60000 })(fetch);
      // return unsuscribeServices;
      fetch();
    },
    [fetch],
  );

  // This filter can be removed because we only fetch now data projects
  const dataProjects = useMemo(
    () => allProjects.filter(onlyDataProject),
    [allProjects],
  );

  const modelProjects = codeProjects[PROJECT_TYPES.ALGORITHM];

  const processorProjects = codeProjects[PROJECT_TYPES.OPERATION];

  const visualizationProjects = codeProjects[PROJECT_TYPES.VISUALIZATION];

  const filtersSection = (
    <MWrapper disable title="No available yet.">
      <MDataFilters filters={dataTypes} className="d-none d-lg-block" />
    </MWrapper>
  );

  return (
    <div className="explore-view">
      <Navbar />

      <div className="explore-view-content">
        <MSimpleTabs
          original
          border
          sections={[
            {
              label: 'ML Projects',
              defaultActive: true,
              color: projectClassificationsProps[0].color,
              content: (
                <div className="explore-view-content-container mx-auto mx-lg-4">
                  <MTabs left pills className="flex-1">
                    <MTabs.Section defaultActive id="allProjects" label="All" className="project-list">
                      <ExploreViewProjectSet
                        started={started}
                        projects={dataProjects}
                      />
                    </MTabs.Section>
                    <MTabs.Section id="popular" label="Popular">
                      <ExploreViewProjectSet
                        started={started}
                        projects={[]}
                      />
                    </MTabs.Section>
                  </MTabs>
                  {filtersSection}
                </div>
              ),
            },
            {
              label: 'models',
              color: projectClassificationsProps[1].color,
              content: (
                <div className="explore-view-content-container mx-auto mx-lg-4">
                  <MTabs left pills className="flex-1">
                    <MTabs.Section defaultActive id="allProjects" label="All" className="project-list">
                      <ExploreViewProjectSet
                        started={started}
                        projects={modelProjects.all}
                      />
                    </MTabs.Section>
                    <MTabs.Section id="popular" label="Popular">
                      <ExploreViewProjectSet
                        started={started}
                        projects={[]}
                      />
                    </MTabs.Section>
                  </MTabs>
                  {filtersSection}
                </div>
              ),

            },
            {
              label: 'processors',
              color: projectClassificationsProps[2].color,
              content: (
                <div className="explore-view-content-container mx-auto mx-lg-4">
                  <MTabs left pills className="flex-1">
                    <MTabs.Section defaultActive id="allProjects" label="All" className="project-list">
                      <ExploreViewProjectSet
                        started={started}
                        projects={processorProjects.all}
                      />
                    </MTabs.Section>
                    <MTabs.Section id="popular" label="Popular">
                      <ExploreViewProjectSet
                        started={started}
                        projects={[]}
                      />
                    </MTabs.Section>
                  </MTabs>
                  {filtersSection}
                </div>
              ),
            },
            {
              label: 'visualizations',
              color: projectClassificationsProps[3].color,
              content: (
                <div className="explore-view-content-container mx-auto mx-lg-4">
                  <MTabs left pills className="flex-1">
                    <MTabs.Section defaultActive id="allProjects" label="All" className="project-list">
                      <ExploreViewProjectSet
                        started={started}
                        projects={visualizationProjects.all}
                      />
                    </MTabs.Section>
                    <MTabs.Section id="popular" label="Popular">
                      <ExploreViewProjectSet
                        started={started}
                        projects={[]}
                      />
                    </MTabs.Section>
                  </MTabs>
                  {filtersSection}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

ExploreView.defaultProps = {
  allProjects: [],
};

ExploreView.propTypes = {
  allProjects: PropTypes.arrayOf(PropTypes.shape({})),
  codeProjects: PropTypes.shape({
    [PROJECT_TYPES.ALGORITHM]: PropTypes.shape({}),
    [PROJECT_TYPES.OPERATION]: PropTypes.shape({}),
    [PROJECT_TYPES.VISUALIZATION]: PropTypes.shape({}),
  }).isRequired,
  actions: PropTypes.shape({
    getProjectsList: PropTypes.func.isRequired,
    getDataProcessorsAndCorrespondingProjects: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
  }).isRequired,
  pagination: PropTypes.shape({
    last: PropTypes.bool,
    number: PropTypes.number,
    totalPages: PropTypes.number,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  pagination: state.projects.paginationInfo,
  allProjects: state.projects.all,
  // groups: state.groups,
  codeProjects: state.projects.codeProjects,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...projectActions,
    // ...groupsActions,
    setIsLoading,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExploreView);

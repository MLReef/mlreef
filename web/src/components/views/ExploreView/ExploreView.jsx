import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Navbar from 'components/navbar/navbar';
// import MWrapper from 'components/ui/MWrapper';
import TabsRouted from 'components/commons/TabsRouted';
// import MDataFilters from 'components/ui/MDataFilters';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { projectClassificationsProps } from 'dataTypes';
import * as projectActions from 'store/actions/projectInfoActions';
import { setIsLoading, setColor } from 'store/actions/globalMarkerActions';
import ExploreViewProjectSet from './ExploreViewProjectSet';
import './ExploreView.scss';

// const { classification } = projectClassificationsProps[2];

const colors = {
  dataProjects: projectClassificationsProps[0].color,
  models: projectClassificationsProps[1].color,
  operations: projectClassificationsProps[2].color,
  visualizations: projectClassificationsProps[3].color,
};

// const dataTypes = [
//   { name: `${classification} data-types`, label: 'Text' },
//   { name: `${classification} data-types`, label: 'Image' },
//   { name: `${classification} data-types`, label: 'Audio' },
//   { name: `${classification} data-types`, label: 'Video' },
//   { name: `${classification} data-types`, label: 'Tabular' },
// ];

const SIZE = 10;

const filterPopular = (ps) => ps.filter((p) => p.gitlabNamespace === 'mlreef');

const ExploreView = (props) => {
  const {
    actions,
    dataProjects,
    codeProjects,
  } = props;

  const [started, setStarted] = useState(false);

  const fetchDataProjects = useCallback(
    (page = 0) => actions.getDataProjects(page, SIZE),
    [actions],
  );

  const fetchCodeProjects = useCallback(
    (type, page = 0) => actions.getCodeProjects(type, { page, size: SIZE }),
    [actions],
  );

  const checkHasStoredProjects = useCallback(
    (type) => {
      const {
        projects,
        pagination: { current },
      } = type ? codeProjects[type] : dataProjects;

      return projects.length && current !== undefined;
    },
    [dataProjects, codeProjects],
  );

  const fetchInitials = useCallback(
    () => {
      const handleFinally = () => {
        setStarted(true);
        actions.setIsLoading(false);
      };

      const algo = PROJECT_TYPES.ALGORITHM;
      const oper = PROJECT_TYPES.OPERATION;
      const vis = PROJECT_TYPES.VISUALIZATION;

      actions.setColor('var(--context)');
      actions.setIsLoading(true);

      return Promise.all([]
        .concat(checkHasStoredProjects() ? [] : fetchDataProjects())
        .concat(checkHasStoredProjects(algo) ? [] : fetchCodeProjects(algo))
        .concat(checkHasStoredProjects(oper) ? [] : fetchCodeProjects(oper))
        .concat(checkHasStoredProjects(vis) ? [] : fetchCodeProjects(vis)))
        .finally(handleFinally);
    },
    // don't add checkHasStoredProjects as dependency because conflicts due to async fetching
    // eslint-disable-next-line
    [actions, setStarted, fetchDataProjects, fetchCodeProjects],
  );

  const fetchMore = (type) => {
    if (type === 'DATA') {
      const { current, size, last } = dataProjects.pagination;

      const dataCallback = () => {
        if (size !== SIZE) throw new Error(`API size ${SIZE} is different than ${size}`);

        return actions.getDataProjects(current + 1, SIZE);
      };

      return last ? null : dataCallback;
    }

    const { current, size, total } = codeProjects[type].pagination;

    const codeCallback = () => {
      if (size !== SIZE) throw new Error(`API size ${SIZE} is different than ${size}`);

      return actions.getCodeProjects(type, { page: current + 1, size: SIZE });
    };

    return current >= total ? null : codeCallback;
  };

  useEffect(
    () => {
      // commented because fetch() now depends on pagination.
      // suscribeRT must be rethough.
      // const unsuscribeServices = suscribeRT({ timeout: 60000 })(fetch);
      // return unsuscribeServices;
      fetchInitials();
    },
    [fetchInitials],
  );

  const modelSet = codeProjects[PROJECT_TYPES.ALGORITHM];

  const processorSet = codeProjects[PROJECT_TYPES.OPERATION];

  const visualizationSet = codeProjects[PROJECT_TYPES.VISUALIZATION];

  // const filtersSection = (
  //   <MWrapper disable title="No available yet.">
  //     <MDataFilters filters={dataTypes} className="d-none d-lg-block" />
  //   </MWrapper>
  // );

  return (
    <div className="explore-view">
      <Navbar />

      <div className="explore-view-content">
        <TabsRouted
          baseURL="/explore"
          original
          sections={[
            {
              label: 'Data Projects',
              slug: 'data-projects',
              color: colors.dataProjects,
              content: (
                <TabsRouted
                  className="mt-3"
                  pills
                  baseURL="/explore/data-projects"
                  sections={[
                    {
                      defaultActive: true,
                      label: 'All',
                      slug: 'all',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            onMore={fetchMore('DATA')}
                            started={started}
                            projects={dataProjects.projects}
                          />
                        </div>
                      ),
                    },
                    {
                      slug: 'popular',
                      label: 'Popular',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={filterPopular(dataProjects.projects)}
                            onMore={fetchMore('DATA')}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: 'Models',
              slug: 'models',
              color: colors.models,
              content: (
                <TabsRouted
                  className="mt-3"
                  pills
                  baseURL="/explore/models"
                  sections={[
                    {
                      label: 'All',
                      slug: 'all',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={modelSet.projects}
                            onMore={fetchMore(PROJECT_TYPES.ALGORITHM)}
                          />
                        </div>
                      ),
                    },
                    {
                      label: 'Popular',
                      slug: 'popular',
                      content: (
                        <div className="mt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={filterPopular(modelSet.projects)}
                            onMore={fetchMore(PROJECT_TYPES.ALGORITHM)}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: 'Data Processors',
              slug: 'processors',
              color: colors.operations,
              content: (
                <TabsRouted
                  className="mt-3"
                  pills
                  baseURL="/explore/processors"
                  sections={[
                    {
                      label: 'All',
                      slug: 'all',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={processorSet.projects}
                          />
                        </div>
                      ),
                    },
                    {
                      label: 'Popular',
                      slug: 'popular',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={filterPopular(processorSet.projects)}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: 'Visualizations',
              slug: 'visualizations',
              color: colors.visualizations,
              content: (
                <TabsRouted
                  className="mt-3"
                  pills
                  baseURL="/explore/visualizations"
                  sections={[
                    {
                      label: 'All',
                      slug: 'all',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={visualizationSet.projects}
                          />
                        </div>
                      ),
                    },
                    {
                      label: 'Popular',
                      slug: 'popular',
                      content: (
                        <div className="pt-3 mt-3">
                          <ExploreViewProjectSet
                            started={started}
                            projects={filterPopular(visualizationSet.projects)}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

ExploreView.defaultProps = {

};

const setType = PropTypes.shape({
  projects: PropTypes.arrayOf(PropTypes.shape({})),
  pagination: PropTypes.shape({
    current: PropTypes.number,
    size: PropTypes.number,
    last: PropTypes.bool,
  }),
});

ExploreView.propTypes = {
  dataProjects: setType.isRequired,
  codeProjects: PropTypes.shape({
    [PROJECT_TYPES.ALGORITHM]: setType.isRequired,
    [PROJECT_TYPES.OPERATION]: setType.isRequired,
    [PROJECT_TYPES.VISUALIZATION]: setType.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    getDataProjects: PropTypes.func.isRequired,
    getCodeProjects: PropTypes.func.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    setColor: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  // groups: state.groups,
  dataProjects: state.marketplace.dataProjects,
  codeProjects: state.marketplace.codeProjects,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...projectActions,
    // ...groupsActions,
    setIsLoading,
    setColor,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExploreView);

import React, { useRef } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import hooks from 'customHooks/useSelectedProject';
import { shape } from 'prop-types';
import { generateBreadCrumbs } from 'functions/helpers';
import MLoadingSpinnerContainer from 'components/ui/MLoadingSpinner/MLoadingSpinnerContainer';
import TabularData from 'components/commons/TabularData';
import Navbar from 'components/navbar/navbar';
import ProjectContainer from 'components/projectContainer';
import JobLogById from './InsightMenu/JoblogsById';
import './insights.scss';
import Jobs from './InsightMenu/jobs';

const Insights = (props) => {
  const {
    match: { params: { logId, namespace, slug } },
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { gid } = selectedProject;

  const tabs = useRef(null);

  // When creating any features in the future such
  // as Contributors, Resources etc. add a route
  // into this array and attach the respective component
  const routes = [
    {
      path: `/${namespace}/${slug}/insights/-/jobs`,
      exact: true,
      main: () => <Jobs namespace={namespace} slug={slug} />,
    },
    {
      path: `/${namespace}/${slug}/insights/-/jobs/graphs`,
      exact: true,
      main: () => <TabularData />,
    },
    {
      path: `/${namespace}/${slug}/insights/-/jobs/${logId}`,
      exact: true,
      main: () => <JobLogById projectId={gid} logId={parseInt(logId, 10)} />,
    },
  ];

  function menuBtnHandler(e) {
    tabs.current.childNodes
      .forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
  }

  const customCrumbs = [
    {
      name: 'Insights',
      href: `/${namespace}/${slug}/insights/-/jobs`,
    },
  ];

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="insights"
        breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
      />

      <div className="main-content py-4">
        <div className="simple-tabs">
          <div className="simple-tabs-container vertical">
            <ul ref={tabs} className="simple-tabs-menu vertical">
              <li className="simple-tabs-menu-tab pills">
                <Link
                  role="button"
                  id="jobs-btn"
                  onClick={menuBtnHandler}
                  className="simple-tabs-menu-tab-btn active"
                  to={`/${namespace}/${slug}/insights/-/jobs`}
                >
                  Jobs
                </Link>
              </li>
              <li className="simple-tabs-menu-tab pills mt-2">
                <Link
                  role="button"
                  id="jobs-btn"
                  onClick={menuBtnHandler}
                  className="simple-tabs-menu-tab-btn active"
                  to={`/${namespace}/${slug}/insights/-/jobs/graphs`}
                >
                  Graphs
                </Link>
              </li>

            </ul>
            <section id="insights-menu" className="simple-tabs-content pt-0">
              <Switch>
                {routes.map((route, index) => (
                  <Route
                    key={index.toString()}
                    path={route.path}
                    exact={route.exact}
                    component={route.main}
                  />
                ))}
              </Switch>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

Insights.propTypes = {
  match: shape({
    params: shape({}),
  }).isRequired,
};

export default Insights;

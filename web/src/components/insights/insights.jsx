import React, { useRef } from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { shape, number, string } from 'prop-types';
import JobLogById from 'components/insights/insights-menu/jobLogById';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './insights.scss';
import Jobs from './insights-menu/jobs';

const Insights = (props) => {
  const {
    selectedProject, selectedProject: { id },
    match: { params: { logId } },
  } = props;

  const tabs = useRef(null);

  // When creating any features in the future such
  // as Contributors, Resources etc. add a route
  // into this array and attach the respective component
  const routes = [
    {
      path: `/my-projects/${id}/insights/-/jobs`,
      exact: true,
      main: () => <Jobs />,
    },
    {
      path: `/my-projects/${id}/insights/-/jobs/${logId}`,
      exact: true,
      main: () => <JobLogById projectId={id} logId={logId} />,
    },
  ];

  function menuBtnHandler(e) {
    tabs.current.childNodes
      .forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="insights"
        viewName="Insights"
      />
      <div className="main-content web-box">
        <div ref={tabs} className="insights-menu">
          <Link role="button" id="jobs-btn" onClick={menuBtnHandler} className="mbtn active" to={`/my-projects/${id}/insights/-/jobs`}>
            Jobs
          </Link>
        </div>
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
      </div>
    </>
  );
};

Insights.propTypes = {
  selectedProject: shape({
    id: number.isRequired,
    gitlabName: string.isRequired,
  }).isRequired,
  match: shape({
    params: shape({}),
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(Insights);

import React, { useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Navbar from 'components/navbar/navbar';
import { projectClassificationsProps } from 'dataTypes';
import * as userActions from 'store/actions/userActions';
import { func, shape } from 'prop-types';
import FiltersSection from 'components/layout/Dashboard/FiltersSections';
import TagSection from 'components/layout/Dashboard/TagSection';
import 'components/layout/Dashboard/DashboardV2.scss';
import ProjectsArraySection from 'components/layout/Dashboard/ProjectsArraySection';
import DashboardProvider from 'components/layout/Dashboard//DashboardContext';
import ProjectsDropDown from 'components/layout/Dashboard/ProjectsDropDown';
import useHistory from 'router/useHistory';

const DashboardExplore = (props) => {
  const { actions, isLoading } = props;

  const projectNameRef = useRef();

  const params = useParams();
  const { classification1, classification2, repoName } = params;

  const location = useLocation();

  const hist = useHistory();

  const class1 = classification1 || 'public';

  const class2 = classification2 || 'data_project';

  const starredClass = class1 === 'starred' ? 'active' : '';

  const publicClass = class1 === 'public' ? 'active' : '';

  const setLoadingStatus = () => actions.setIsLoading(true);

  useEffect(() => {
    const color = projectClassificationsProps
      .filter(({ searchableType }) => searchableType.toLowerCase() === class2)[0]?.color;
    actions.setGlobalMarkerColor(color);
    actions.setIsLoading(true);
  }, []);

  return (
    <div className="dashboard-v2">
      <Navbar />
      <div className="dashboard-v2-content">
        <div className="dashboard-v2-content-search-bar">
          <input
            ref={projectNameRef}
            placeholder="Type a repository name and hit enter"
            type="text"
            defaultValue={repoName}
            onKeyUp={(e) => {
              const locationBase = location.pathname.split('/')[1];
              const baseUrl = `/${locationBase}/${class1}/${class2}`;
              if (e.key === 'Enter' && !isLoading) {
                const completeUrl = projectNameRef.current.value.length === 0
                  ? baseUrl
                  : `${baseUrl}/repository-name/${encodeURIComponent(projectNameRef.current.value)}`;
                setLoadingStatus();
                hist.push(completeUrl);
              }
            }}
          />
          <ProjectsDropDown />
        </div>
        <div className="dashboard-v2-content-links-section-1">
          <div className={starredClass}>
            <Link
              className={`tab-link ${starredClass}`}
              to={`/explore/starred/${class2}`}
              onClick={setLoadingStatus}
            >
              Starred
            </Link>
          </div>
          <div className={publicClass}>
            <Link
              className={`tab-link ${publicClass}`}
              to={`/explore/public/${class2}`}
              onClick={setLoadingStatus}
            >
              Public
            </Link>
          </div>
        </div>
        <div className="dashboard-v2-content-links-section-2">
          {projectClassificationsProps.map(({ label, searchableType, color }) => {
            const lowerCaseST = searchableType.toLowerCase();
            const isIsClass2 = class2 === lowerCaseST;
            const finalColor = isIsClass2 ? color : 'var(--dark)';

            return (
              <div key={lowerCaseST} style={isIsClass2 ? { borderBottom: `2px solid ${finalColor}` } : {}}>
                <Link
                  id={lowerCaseST}
                  className="tab-link-2"
                  style={{ color: finalColor, fontWeight: class2 === lowerCaseST ? 'bold' : 'normal' }}
                  to={`/explore/${class1}/${lowerCaseST}`}
                  onClick={() => {
                    actions.setGlobalMarkerColor(color);
                    actions.setIsLoading(true);
                  }}
                >
                  {`${label}s`}
                </Link>
              </div>
            );
          })}
        </div>
        <DashboardProvider>
          <FiltersSection />
          <TagSection />
          <ProjectsArraySection />
        </DashboardProvider>
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

DashboardExplore.propTypes = {
  actions: shape({
    setGlobalMarkerColor: func.isRequired,
    setIsLoading: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardExplore);

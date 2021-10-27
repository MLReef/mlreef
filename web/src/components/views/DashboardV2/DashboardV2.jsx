import React, { useCallback, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { func, shape } from 'prop-types';
import Navbar from 'components/navbar/navbar';
import { projectClassificationsProps } from 'dataTypes';
import * as userActions from 'store/actions/userActions';
import FiltersSection from 'components/layout/Dashboard/FiltersSections';
import TagSection from 'components/layout/Dashboard/TagSection';
import 'components/layout/Dashboard/DashboardV2.scss';
import ProjectsArraySection from 'components/layout/Dashboard/ProjectsArraySection';
import DashboardProvider from 'components/layout/Dashboard//DashboardContext';
import ProjectsDropDown from 'components/layout/Dashboard/ProjectsDropDown';
import { useHistory } from 'router';
import NewMLProject from 'components/layout/Dashboard/NewMLProject';

const DashboardV2 = (props) => {
  const { actions, isLoading } = props;

  const location = useLocation();

  const params = useParams();
  const { classification1, classification2, repoName } = params;

  const hist = useHistory();

  const class1 = classification1 || 'public';

  const class2 = classification2 || 'data_project';

  const myReposActivClass = class1 === 'my-repositories' ? 'active' : '';

  const starredClass = class1 === 'starred' ? 'active' : '';

  const publicClass = class1 === 'public' ? 'active' : '';

  const isMLProjectsOption = class2 === "data_project";

  const changeColorAndSetLoadingStatus = useCallback(() => {
    const color = projectClassificationsProps
      .filter(({ searchableType }) => searchableType.toLowerCase() === class2)[0]?.color || "#91A945";
    actions.setGlobalMarkerColor(color);
    actions.setIsLoading(true);
  }, [actions, class2]);

  useEffect(() => {
    changeColorAndSetLoadingStatus();
  }, [changeColorAndSetLoadingStatus]);

  return (
    <div className="dashboard-v2">
      <Navbar />
      <div className="dashboard-v2-content">
        <div className="dashboard-v2-content-search-bar">
          <input
            disabled={class1 === 'recent'}
            data-testid="search-bar-input"
            className="dashboard-v2-content-search-bar-input"
            placeholder="Type a repository name and hit enter"
            type="text"
            defaultValue={repoName}
            onKeyUp={(e) => {
              const locationBase = location.pathname.split('/')[1];
              const baseUrl = `/${locationBase}/${class1}/${class2}`;
              if (e.key === 'Enter' && !isLoading) {
                const completeUrl = e.target.value.length === 0
                  ? baseUrl
                  : `${baseUrl}/repository-name/${encodeURIComponent(e.target.value)}`;
                changeColorAndSetLoadingStatus();
                hist.push(completeUrl);
              }
            }}
          />
          {isMLProjectsOption ?
            <NewMLProject />
            :
            <ProjectsDropDown />
          }
        </div>
        <div className="dashboard-v2-content-links-section-1">
          <div className={myReposActivClass}>
            <Link
              className={`tab-link ${myReposActivClass}`}
              to={`/dashboard/my-repositories/${class2}`}
              onClick={changeColorAndSetLoadingStatus}
            >
              My repositories
            </Link>
          </div>
          <div className={starredClass}>
            <Link
              className={`tab-link ${starredClass}`}
              to={`/dashboard/starred/${class2}`}
              onClick={changeColorAndSetLoadingStatus}
            >
              Starred
            </Link>
          </div>
          <div className={publicClass}>
            <Link
              className={`tab-link ${publicClass}`}
              to={`/dashboard/public/${class2}`}
              onClick={changeColorAndSetLoadingStatus}
            >
              Public
            </Link>
          </div>
        </div>
        {!isMLProjectsOption && <div className="dashboard-v2-content-links-section-2">
          {projectClassificationsProps.slice(1).map(({ label, searchableType, color }) => {
            const lowerCaseST = searchableType.toLowerCase();
            const isIsClass2 = class2 === lowerCaseST;
            const finalColor = isIsClass2 ? color : 'var(--dark)';
            return class1 === 'recent'
              ? (
                <div
                  key={lowerCaseST}
                  style={isIsClass2 ? { borderBottom: `2px solid ${finalColor}` } : {}}
                  className="tab-link-2"
                >
                  {`${label}s`}
                </div>
              ) : (
                <div key={lowerCaseST} style={isIsClass2 ? { borderBottom: `2px solid ${finalColor}` } : {}}>
                  <Link
                    id={lowerCaseST}
                    className="tab-link-2"
                    style={{ color: finalColor, fontWeight: class2 === lowerCaseST ? 'bold' : 'normal' }}
                    to={`/dashboard/${class1}/${lowerCaseST}`}
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
        </div>}
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

DashboardV2.propTypes = {
  actions: shape({
    setGlobalMarkerColor: func.isRequired,
    setIsLoading: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardV2);

import React, { useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Navbar from 'components/navbar/navbar';
import Instruction from 'components/instruction/instruction';
import { projectClassificationsProps } from 'dataTypes';
import * as userActions from 'store/actions/userActions';
import TagSection from './TagSection';
import FiltersSection from './FiltersSections';
import './DashboardV2.scss';
import ProjectsArraySection from './ProjectsArraySection';
import DashboardProvider from './DashboardContext';
import ProjectsDropDown from './ProjectsDropDown';

const DashboardV2 = (props) => {
  const { actions } = props;

  const { classification1, classification2 } = useParams();

  const class1 = classification1 || 'my-repositories';

  const class2 = classification2 || 'data_project';

  const myReposActivClass = class1 === 'my-repositories' ? 'active' : '';

  const starredClass = class1 === 'starred' ? 'active' : '';

  const publicClass = class1 === 'public' ? 'active' : '';

  const setLoadingStatus = () => () => actions.setIsLoading(true);

  useEffect(() => {
    const color = projectClassificationsProps
      .filter(({ searchableType }) => searchableType.toLowerCase() === class2)[0]?.color;
    actions.setGlobalMarkerColor(color);
  }, []);

  return (
    <div className="dashboard-v2">
      <Navbar />
      <Instruction
        id="dashboard-inst"
        titleText=""
        htmlParagraph={(
          <>
            <p className="m-0">This is your dashboard. You will find different types of repositories:</p>
            <p className="m-0">
              <b>- ML projects:</b>
              {' '}
              These host your data and all your ML pipelines, 
              from data pre-processing to creating and tracking experiments.
            </p>
            <p className="m-0">
              <b>- Models, Data Ops</b>
              and
              {' '}
              <b>Data visualizations</b>
              {' '}
              are code repos.
              When published the hosted scripts within
              are containerized and accessible in the ML pipelines.
            </p>

            <p>Start by forking a ML project or by creating your own ML work.</p>
          </>
        )}
      />
      <div className="dashboard-v2-content">
        <ProjectsDropDown />
        <div className="dashboard-v2-content-links-section-1">
          <div className={myReposActivClass}>
            <Link
              className={`tab-link ${myReposActivClass}`}
              to={`/dashboard/my-repositories/${class2}`}
              onClick={setLoadingStatus}
            >
              My repositories
            </Link>
          </div>
          <div className={starredClass}>
            <Link
              className={`tab-link ${starredClass}`}
              to={`/dashboard/starred/${class2}`}
              onClick={setLoadingStatus}
            >
              Starred
            </Link>
          </div>
          <div className={publicClass}>
            <Link
              className={`tab-link ${publicClass}`}
              to={`/dashboard/public/${class2}`}
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
        </div>
        <DashboardProvider>
          <FiltersSection />
          <TagSection />
          <ProjectsArraySection
            classification1={class1}
            classification2={class2}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardV2);

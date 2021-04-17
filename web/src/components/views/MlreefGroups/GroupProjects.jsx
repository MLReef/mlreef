import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import MBricksWall from 'components/ui/MBricksWall';
import ArrowButton from 'components/arrow-button/arrowButton';
import MWrapper from 'components/ui/MWrapper';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import iconGrey from '../../../images/icon_grey-01.png';
import MProjectCard from '../../ui/MProjectCard';
import './GroupView.scss';
import useDropdown from 'customHooks/useDropdown';

const GroupProjects = (props) => {
  const { allProjects, projects, groupPath, groupName, user: { id: userId }, } = props;
  const [dropDownRef, toggleShow, isDropdownOpen] = useDropdown();
  const finalGroupProjects = allProjects
    ?.filter((obj) => projects.some((obj2) => obj.gitlabId === obj2.id));

  const projectTypes = [
    { label: 'ML project' },
    { label: 'Model' },
    { label: 'Data operation' },
    { label: 'Data visualization' },
  ].map((dT) => ({ ...dT, name: `${groupPath}-projectType` }));

  const visibility = [
    { label: 'Private' },
    { label: 'Public' },
  ].map((dT) => ({ ...dT, name: `${groupPath}-visibility` }));

  return (
    <div className="cards-section p-3 mx-5">
      <Helmet>
        <title>
          {`${groupName} · MLReef`}
        </title>
      </Helmet>
      <div className="pt-2">
        <div id="navigation-div">
          <div className='flex-1' id="filter-div">
            <button
              id='personal-btn'
              type="button"
              className="btn btn-basic-dark"
            >
              Own
            </button>
          </div>
          <div ref={dropDownRef} className="dropdown" style={{ float: 'right' }}>
            <button onClick={toggleShow} className="btn btn-primary project-dropdown-btn">
              New Project
            </button>
            <button className="dropdown-btn-arrow" onClick={toggleShow}>
              <i className={`fa fa-chevron-${isDropdownOpen ? 'up' : 'down'} t-primary p-1 my-auto`} />
            </button>
            {isDropdownOpen && 
              <div className="dropdown-content mt-1">
                <Link to={`/new-project/classification/ml-project/${groupPath}`}>
                  <h5 className="t-primary m-0 mb-1">New ML project</h5>
                  <span>Create a ML project in this group</span>
                </Link>
                <hr className="m-0"/>
                <MWrapper disable title="Not available yet.">
                <Link to="/">
                  <h5 className="t-warning m-0 mb-1">New Model</h5>
                  <span>Create a model in this group</span>
                </Link>
                <hr className="m-0"/>
                <Link to="/">
                  <h5 className="t-danger m-0 mb-1">New Data operation</h5>
                  <span>Create a data operation in this group</span>
                </Link>
                <Link to="/">
                  <h5 style={{ color: "rgb(115, 93, 168)" }} className="m-0 mb-1">New Data operation</h5>
                  <span>Create a data operation in this group</span>
                </Link>
                </MWrapper>
              </div>}
          </div>
        </div>
        <div className="group-projects d-flex mt-2">
          <div className="flex-row" style={{ flex: '4 1' }}>
            {finalGroupProjects && finalGroupProjects.length > 0
            ? <MBricksWall
              className="w-100"
              animated
              bricks={finalGroupProjects?.map((proj) => (
                <MProjectCard
                  key={`proj-${proj?.gitlabNamespace}-${proj?.slug}-${proj?.id}`}
                  slug={proj?.slug}
                  title={proj?.name}
                  projectId={proj?.gitlabId}
                  description={proj?.description}
                  starCount={proj?.starsCount || 0}
                  forkCount={proj?.forksCount || 0}
                  namespace={groupPath}
                  projects={allProjects}
                  updatedAt={proj?.lastActivityat}
                  inputDataTypes={proj?.inputDataTypes}
                  users={proj?.members}
                  visibility={proj?.visibilityScope}
                  owner={proj.ownerId === userId}
                />
              ))}
            /> : (
              <div className="d-flex noelement-found-div">
                <img src={iconGrey} alt="" style={{ maxHeight: '100px' }} />
                <p>No projects found</p>
              </div>
            )}
          </div>
          <div className="d-none d-lg-block" id="side-filters">
            <div id="input-div">
              <p>Refine by</p>
              <button>Clear filters</button>
            </div>
            <br />
            <>
              <div className="name-filter-section">
                <p>
                  Project Type
                </p>
                <ArrowButton />
              </div>
              {projectTypes.map((dtype) => (
                <MCheckBox
                  key={`${dtype.name} ${dtype.label} comp`}
                  name={dtype.name}
                  labelValue={dtype.label}
                  callback={(name, labelValue, newValue) => {}}
                />
              ))
              }
            </>
            <>
              <div className="name-filter-section">
                <p>
                  Visibility
                </p>
                <ArrowButton />
              </div>
              {visibility.map((dtype) => (
                <MCheckBox
                  key={`${dtype.name} ${dtype.label} comp`}
                  name={dtype.name}
                  labelValue={dtype.label}
                  callback={(name, labelValue, newValue) => {}}
                />
              ))
              }
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    allProjects: state.projects.all,
    user: state.user,
  };
}

export default connect(mapStateToProps)(GroupProjects);

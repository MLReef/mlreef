import React, {
  createRef, useEffect, useState,
} from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { arrayOf, shape, func } from 'prop-types';
import './groupsOverview.scss';
import Navbar from 'components/navbar/navbar';
import MTabs from 'components/ui/MTabs';
import { Link } from 'react-router-dom';
import ArrowButton from 'components/ui/MArrowButton/arrowButton';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import * as groupsActions from 'store/actions/groupsActions';
import * as projectActions from 'store/actions/projectInfoActions';
import * as userActions from 'store/actions/userActions';
import GroupCard from './GroupCard';

const UnconnectedGroupsOverview = (props) => {
  const ownButtonRef = createRef();

  const exploreButtonRef = createRef();

  const {
    actions,
    projects,
    groups: grps,
  } = props;

  const [isHasProjectsVisible, setVisible] = useState(true);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    actions.setIsLoading(true);
    actions.getGroupsList(true);
    actions.getProjectsList(0, 100);
  }, []);

  useEffect(() => {
    const newGroupArr = grps.map((grp) => {
      let groupProjects = [];
      grp.projects.forEach((grpProj) => {
        const grpProjects = projects.filter((pro) => grpProj.id === pro.gitlabId);
        if (grpProjects.length > 0) {
          groupProjects = [...groupProjects, ...grpProjects];
        }
      });
      return { ...grp, projects: groupProjects };
    });
    actions.setIsLoading(false);

    setGroups(newGroupArr);
  }, [projects, grps]);

  const showProjectsHandler = () => setVisible(!isHasProjectsVisible);

  const exploreClickHandler = () => {
    actions.setIsLoading(true);
    actions.getGroupsList(false);
    if (!ownButtonRef.current) return;
    ownButtonRef.current.classList.replace('btn-basic-info', 'btn-basic-dark');
    exploreButtonRef.current.classList.replace('btn-basic-dark', 'btn-basic-info');
  };

  const ownClickHandler = () => {
    actions.getGroupsList(true);
    actions.setIsLoading(true);
    if (!ownButtonRef.current) return;
    ownButtonRef.current.classList.replace('btn-basic-dark', 'btn-basic-info');
    exploreButtonRef.current.classList.replace('btn-basic-info', 'btn-basic-dark');
  };

  const projectFilters = [
    { label: 'ML projects' },
    { label: 'Algorithm' },
    { label: 'Data operations' },
    { label: 'Data visualizations' },
  ].map((pF) => ({ ...pF, name: `${pF.label} dataTypes` }));
  return (
    <>
      <Helmet>
        <title>
          Groups · MLReef
        </title>
      </Helmet>
      <Navbar />
      <div className="groups-overview">
        <MTabs>
          <MTabs.Section
            id="groups-tab"
            defaultActive
            label="Groups"
          >
            <div>
              <br />
              <div className="buttons-div">
                <div className="filter-div">
                  <button ref={ownButtonRef} id="own" className="btn btn-basic-info" type="button" onClick={ownClickHandler}>
                    Own
                  </button>
                  <button ref={exploreButtonRef} id="explore" disabled className="btn btn-basic-dark ml-auto" type="button" onClick={exploreClickHandler}>
                    Explore
                  </button>
                </div>
                <div className="new-group ml-auto">
                  <Link
                    id="new-group-link"
                    to="/groups/new"
                    className="btn btn-primary"
                  >
                    New group
                  </Link>
                </div>
              </div>
              <div className="cards-and-sort-section">
                <div className="cards">
                  {groups.map((gr) => (
                    <GroupCard
                      key={`group-id-${gr.id}`}
                      groupId={gr.id}
                      groupName={gr.name}
                      groupAvatar={gr.avatar_url}
                      groupPath={gr.path}
                      groupDescription={gr.description}
                      groupProjects={gr.projects}
                    />
                  ))}
                </div>

                <div className="sort">
                  <div id="input-div">
                    <p>Refine by</p>
                    <button type="button">Clear filters</button>
                  </div>
                  <br />
                  <>
                    <div className="name-filter-section">
                      <p>
                        Has projects in:
                      </p>
                      <ArrowButton id="show-projects-filter" callback={showProjectsHandler} />
                    </div>
                    {isHasProjectsVisible && (
                      projectFilters.map((dtype) => (
                        <MCheckBox
                          key={`${dtype.name} ${dtype.label} comp`}
                          name={dtype.name}
                          labelValue={dtype.label}
                          callback={() => {}}
                        />
                      ))
                    )}
                  </>
                </div>
              </div>
            </div>
          </MTabs.Section>
        </MTabs>
      </div>
    </>
  );
};

function mapStateToProps(state) {
  return {
    projects: state.projects.all,
    groups: state.groups,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...groupsActions,
      ...projectActions,
      ...userActions,
    }, dispatch),
  };
}

UnconnectedGroupsOverview.propTypes = {
  projects: arrayOf(shape({})).isRequired,
  groups: arrayOf(shape({})).isRequired,
  actions: shape({
    setIsLoading: func.isRequired,
    getGroupsList: func.isRequired,
    getProjectsList: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(UnconnectedGroupsOverview);

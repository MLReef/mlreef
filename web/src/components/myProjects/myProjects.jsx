import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { arrayOf, shape, func } from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import { suscribeRT } from 'functions/apiCalls';
import {
  projectClassificationsProps,
} from 'dataTypes';
import Navbar from '../navbar/navbar';
import './myProjects.scss';
import ProjectDeletionModal from '../project-deletion-modal/projectDeletionModal';
import * as projectActions from '../../actions/projectInfoActions';
import * as groupsActions from '../../actions/groupsActions';
import * as userActions from '../../actions/userActions';
// import AuthWrapper from 'components/AuthWrapper';

class Myprojects extends React.Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  constructor(props) {
    super(props);
    this.fetch = this.fetch.bind(this);
    const { actions } = this.props;
    actions.setGlobalMarkerColor(projectClassificationsProps[0].color);
    this.state = {
      showModal: false,
      projectName: '',
      owner: '',
      isFetching: false,
      unsuscribeServices: null,
    };
  }

  componentDidMount() {
    this.setState({ isFetching: true });

    // polling every 10 seconds (it is the default value, it's just for demostration)
    const unsuscribeServices = suscribeRT({ timeout: 10000 })(this.fetch);
    // keep this for clear timeouts
    this.setState({ unsuscribeServices });

    /* Add some event listeners */
    this.addEventListeners();
  }

  componentWillUnmount() {
    // clean timeouts
    const { unsuscribeServices } = this.state;
    if (unsuscribeServices) unsuscribeServices();
  }

  addEventListeners = () => projectClassificationsProps
    .map((obj) => obj.classification).forEach((id) => {
      document
        .getElementById(`tab-${id}`)
        .addEventListener('click', (e) => {
          const { actions } = this.props;
          const node = e.target;
          if (node.nodeName === 'BUTTON') {
            const { color } = projectClassificationsProps.filter((idsColor) => `${idsColor.classification}` === id)[0];
            actions.setGlobalMarkerColor(color);
            this.setState({ bandColor: color });
          }
        });
    });

  fetch() {
    const { actions } = this.props;

    // fetch 3 list of projects using a fetching flag
    return Promise.all([
      actions.getUserProjects(),
      actions.getStarredProjects(),
      actions.getProjectsList(),
      actions.getGroupsList(),
    ])
      .catch(() => {
      })
      .finally(() => {
        this.setState({ isFetching: false });
      });
  }

  render() {
    const {
      isFetching,
      showModal,
      projectName,
      owner,
    } = this.state;

    const {
      userProjects,
      starredProjects,
      allProjects,
      history,
    } = this.props;

    return (
      <div style={{ backgroundColor: '#f2f2f2' }}>
        <ProjectDeletionModal
          isShowing={showModal}
          projectName={projectName}
          owner={owner}
          hideModal={() => {}}
          projectsList={userProjects}
        />
        <Navbar />
        {/* isATabActiveByDefault && <div style={{ height: '0.35rem', backgroundColor: bandColor }} /> */}
        <br />
        <br />
        <br />
        <MTabs>
          <MTabs.Section defaultActive id={projectClassificationsProps[0].classification} label="ML Projects" color={projectClassificationsProps[0].color}>
            <MProjectClassification
              classification={projectClassificationsProps[0].classification}
              isFetching={isFetching}
              history={history}
              userProjects={userProjects}
              starredProjects={starredProjects}
              allProjects={allProjects}
            />
          </MTabs.Section>
          <MTabs.Section id={projectClassificationsProps[1].classification} label="Models" color={projectClassificationsProps[1].color}>
            <MProjectClassification
              classification={projectClassificationsProps[1].classification}
              isFetching={false}
              history={history}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[2].classification}
            label="Data Operations"
            color={projectClassificationsProps[2].color}
          >
            <MProjectClassification
              classification={projectClassificationsProps[2].classification}
              isFetching={false}
              history={history}
            />
          </MTabs.Section>
          <MTabs.Section id={projectClassificationsProps[3].classification} label="Data visualizations" color={projectClassificationsProps[3].color}>
            <MProjectClassification
              classification={projectClassificationsProps[3].classification}
              isFetching={false}
              history={history}
            />
          </MTabs.Section>
        </MTabs>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    allProjects: state.projects.all,
    userProjects: state.projects.userProjects,
    starredProjects: state.projects.starredProjects,
    groups: state.groups,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
      ...groupsActions,
      ...userActions,
    }, dispatch),
  };
}

Myprojects.propTypes = {
  allProjects: arrayOf(
    shape({}).isRequired,
  ).isRequired,

  starredProjects: arrayOf(
    shape({}).isRequired,
  ).isRequired,

  userProjects: arrayOf(
    shape({}).isRequired,
  ).isRequired,

  actions: shape({
    getProjectsList: func.isRequired,
    getUserProjects: func.isRequired,
    getStarredProjects: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);

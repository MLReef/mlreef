import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { arrayOf, shape, func } from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import { suscribeRT } from 'functions/apiCalls';
import Navbar from '../navbar/navbar';
import './myProjects.scss';
import ProjectDeletionModal from '../project-deletion-modal/projectDeletionModal';
import * as projectActions from '../../actions/projectInfoActions';
// import AuthWrapper from 'components/AuthWrapper';

class Myprojects extends React.Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  tabsIds = [
    'ml-projects',
    'models',
    'data-operations',
    'data-visualizations',
  ];

  idsXColors = [
    { id: this.tabsIds[0], color: '#91BD44' },
    { id: this.tabsIds[1], color: '#E99444' },
    { id: this.tabsIds[2], color: '#D2519D' },
    { id: this.tabsIds[3], color: '#735DA8' },
  ];

  constructor(props) {
    super(props);
    this.fetch = this.fetch.bind(this);

    this.state = {
      showModal: false,
      projectName: '',
      owner: '',
      isFetching: false,
      unsuscribeServices: null,
      bandColor: null,
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

  addEventListeners = () => this.tabsIds.forEach((id) => {
    document
      .getElementById(`tab-${id}`)
      .addEventListener('click', (e) => {
        const node = e.target;
        if (node.nodeName === 'BUTTON') {
          const { color } = this.idsXColors.filter((idsColor) => `${idsColor.id}` === id)[0];
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
      bandColor,
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
        {bandColor && <div style={{ height: '0.35rem', backgroundColor: bandColor }} />}
        <br />
        <br />
        <br />
        <MTabs>
          <MTabs.Section defaultActive id={this.idsXColors[0].id} label="ML Projects" color={this.idsXColors[0].color}>
            <MProjectClassification
              classification="ml-projects"
              isFetching={isFetching}
              history={history}
              userProjects={userProjects}
              starredProjects={starredProjects}
              allProjects={allProjects}
            />
          </MTabs.Section>
          <MTabs.Section id={this.idsXColors[1].id} label="Models" color={this.idsXColors[1].color}>
            <MProjectClassification
              classification="models"
              isFetching={false}
              history={history}
            />
          </MTabs.Section>
          <MTabs.Section
            id={this.idsXColors[2].id}
            label="Data Operations"
            color={this.idsXColors[2].color}
          >
            <MProjectClassification
              classification="data-operations"
              isFetching={false}
              history={history}
            />
          </MTabs.Section>
          <MTabs.Section id={this.idsXColors[3].id} label="Data visualizations" color={this.idsXColors[3].color}>
            <MProjectClassification
              classification="data-visualizations"
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...projectActions,
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

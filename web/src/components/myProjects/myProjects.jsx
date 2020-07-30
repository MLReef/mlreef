import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { arrayOf, shape, func } from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import {
  projectClassificationsProps
} from 'dataTypes';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import * as processorActions from 'actions/processorActions';
import { onlyDataProject } from 'functions/apiCalls';
import Navbar from '../navbar/navbar';
import './myProjects.scss';
import * as projectActions from '../../actions/projectInfoActions';
import * as groupsActions from '../../actions/groupsActions';
import * as userActions from '../../actions/userActions';

class Myprojects extends React.Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  constructor(props) {
    super(props);
    this.fetch = this.fetch.bind(this);

    // the constructor is not the place for actions and state update
    // that leads to memory leaks and console warnings.

    this.state = {
      /* unsuscribeServices: null, */
      allProjects: [],
      userProjects: [],
      starredProjects: [],
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.setIsLoading(true);
    actions.setGlobalMarkerColor(projectClassificationsProps[0].color);
    this.fetch();
    // polling every 10 seconds (it is the default value, it's just for demostration)
    // const unsuscribeServices = suscribeRT({ timeout: 200000 })(this.fetch);
    // keep this for clear timeouts
    // this.setState({ unsuscribeServices });

    /* Add some event listeners */
    this.addEventListeners();
  }

  static getDerivedStateFromProps(nextProps){
    const {
      allProjects,
      userProjects,
      starredProjects
    } = nextProps;
    const {actions} = nextProps;
    actions.setIsLoading(false);
    return {
      allProjects,
      userProjects,
      starredProjects
    }
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
          }
        });
    });

  fetch() {
    const { actions } = this.props;
    return Promise.all([
      /* actions.getUserProjects(), */
      /* actions.getStarredProjects(), */
      actions.getProjectsList(PROJECT_TYPES.DATA_PROJ),
    ])
      .catch(() => {
      })
      .finally(() => {
        actions.setIsLoading(false);
      });
  }

  render() {
    const {
      allProjects,
      userProjects,
      starredProjects,
    } = this.state;
    const {
      history,
      actions,
    } = this.props;

    return (
      <div style={{ backgroundColor: '#f2f2f2' }}>
        <Navbar />
        <br />
        <br />
        <br />
        <MTabs>
          <MTabs.Section
            defaultActive
            id={projectClassificationsProps[0].classification}
            label="ML Projects"
            color={projectClassificationsProps[0].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getProjectsList();
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MProjectClassification
              classification={projectClassificationsProps[0].classification}
              history={history}
              userProjects={userProjects.filter(onlyDataProject)}
              starredProjects={starredProjects.filter(onlyDataProject)}
              allProjects={allProjects.filter(onlyDataProject)}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[1].classification}
            label="Models"
            color={projectClassificationsProps[1].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.ALGORITHM);
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MProjectClassification
              classification={projectClassificationsProps[1].classification}
              history={history}
              userProjects={userProjects}
              starredProjects={starredProjects}
              allProjects={allProjects}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[2].classification}
            label="Data Operations"
            color={projectClassificationsProps[2].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.OPERATION);
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MProjectClassification
              classification={projectClassificationsProps[2].classification}
              history={history}
              userProjects={userProjects}
              starredProjects={starredProjects}
              allProjects={allProjects}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[3].classification}
            label="Data visualizations"
            color={projectClassificationsProps[3].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.VISUALIZATION);
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MProjectClassification
              classification={projectClassificationsProps[3].classification}
              history={history}
              userProjects={userProjects}
              starredProjects={starredProjects}
              allProjects={allProjects}
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
      ...processorActions,
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
    /* getUserProjects: func.isRequired, */
    /* getStarredProjects: func.isRequired, */
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);

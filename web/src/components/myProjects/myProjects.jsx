import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { Helmet } from 'react-helmet';
import {
  arrayOf, shape, func, bool,
} from 'prop-types';
import MProjectClassification from 'components/ui/MProjectClassification/MProjectClassification';
import MTabs from 'components/ui/MTabs';
import {
  projectClassificationsProps,
} from 'dataTypes';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import * as processorActions from 'actions/processorActions';
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import Navbar from '../navbar/navbar';
import './myProjects.scss';
import * as projectActions from '../../actions/projectInfoActions';
import * as groupsActions from '../../actions/groupsActions';
import * as userActions from '../../actions/userActions';

class Myprojects extends React.Component {
  projFilterBtnsList = ['own', 'starred', 'explore'];

  constructor(props) {
    super(props);
    // the constructor is not the place for actions and state update
    // that leads to memory leaks and console warnings.

    this.state = {
      /* unsuscribeServices: null, */
      allProjects: [],
      userProjects: [],
      starredProjects: [],
      page: 0,
      isLastPage: false,
      scrolling: false,
    };

    this.fetch = this.fetch.bind(this);
  }

  componentDidMount() {
    const { actions: { setGlobalMarkerColor } } = this.props;
    setGlobalMarkerColor(projectClassificationsProps[0].color);
    this.fetch();
    // polling every 10 seconds (it is the default value, it's just for demostration)
    // const unsuscribeServices = suscribeRT({ timeout: 200000 })(this.fetch);
    // keep this for clear timeouts
    // this.setState({ unsuscribeServices });

    /* Add some event listeners */
    this.addEventListeners();
  }

  static getDerivedStateFromProps(nextProps) {
    const {
      allProjects,
      userProjects,
      starredProjects,
    } = nextProps;
    const lastPage = nextProps?.paginationInfo?.last;
    return {
      allProjects,
      userProjects,
      starredProjects,
      isLastPage: lastPage,
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.setPaginationInfoSuccessfully({});
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

  handleOnScrollEvent = () => {
    const { scrolling, isLastPage } = this.state;
    if (isLastPage) return null;
    if (scrolling) return null;

    this.setState((prevState) => ({
      page: prevState.page + 1,
      scrolling: true,
    }), this.fetch);

    return null;
  }

  fetch() {
    const { actions: { setIsLoading, getProjectsList } } = this.props;
    const { page } = this.state;
    setIsLoading(true);
    try {
      Promise.all([
        getProjectsList(page, 10),
      ])
        .finally(() => {
          setIsLoading(false);
          this.setState({ scrolling: false });
        });
    } catch (error) {
      toastr.error('Error', error?.message);
    }
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
      isLoading,
    } = this.props;

    return (
      <div style={{ backgroundColor: '#f2f2f2' }}>
        <Helmet>
          <title>
            Dashboard · MLReef
          </title>
        </Helmet>
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
              actions.setProjectsInfoSuccessfully([]);
              actions.setStarredProjectsSuccessfully([]);
              actions.setUserProjectsSuccessfully([]);
              this.setState(() => ({
                page: 0,
              }), this.fetch);
            }}
          >
            <MScrollableSection handleOnScrollDown={this.handleOnScrollEvent}>
              <MProjectClassification
                classification={projectClassificationsProps[0].classification}
                history={history}
                userProjects={userProjects}
                starredProjects={starredProjects}
                allProjects={allProjects}
                isLoading={isLoading}
              />
            </MScrollableSection>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[1].classification}
            label="Models"
            color={projectClassificationsProps[1].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.ALGORITHM)
                  .finally(() => actions.setIsLoading(false));
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
              isLoading={isLoading}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[2].classification}
            label="Data Operations"
            color={projectClassificationsProps[2].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.OPERATION)
                  .finally(() => actions.setIsLoading(false));
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
              isLoading={isLoading}
            />
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[3].classification}
            label="Data visualizations"
            color={projectClassificationsProps[3].color}
            callback={() => {
              try {
                actions.setIsLoading(true);
                actions.getDataProcessorsAndCorrespondingProjects(PROJECT_TYPES.VISUALIZATION)
                  .finally(() => actions.setIsLoading(false));
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
              isLoading={isLoading}
            />
          </MTabs.Section>
        </MTabs>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    paginationInfo: state.projects.paginationInfo,
    allProjects: state.projects.all,
    userProjects: state.projects.userProjects,
    starredProjects: state.projects.starredProjects,
    groups: state.groups,
    isLoading: state.globalMarker?.isLoading,
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

  isLoading: bool.isRequired,

  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);

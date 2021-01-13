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
import MScrollableSection from 'components/ui/MScrollableSection/MScrollableSection';
import * as processorActions from 'store/actions/processorActions';
import * as projectActions from 'store/actions/projectInfoActions';
import * as groupsActions from 'store/actions/groupsActions';
import * as userActions from 'store/actions/userActions';
import Navbar from '../navbar/navbar';
import './myProjects.scss';

class Myprojects extends React.Component {
  constructor(props) {
    super(props);
    // the constructor is not the place for actions and state update
    // that leads to memory leaks and console warnings.

    this.state = {
      /* unsuscribeServices: null, */
      allProjects: [],
      page: 0,
      isLastPage: false,
      scrolling: false,
      projectType: PROJECT_TYPES.DATA,
    };

    this.fetchCodeProjects = this.fetchCodeProjects.bind(this);
    this.fetchDataProjects = this.fetchDataProjects.bind(this);
  }

  componentDidMount() {
    const { actions: { setGlobalMarkerColor } } = this.props;
    setGlobalMarkerColor(projectClassificationsProps[0].color);
    this.fetchDataProjects();
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
    const {
      scrolling, isLastPage, projectType, page,
    } = this.state;
    if (isLastPage) return null;
    if (scrolling) return null;

    const newPage = page + 1;
    this.setState(() => ({
      page: newPage,
      scrolling: true,
    }), projectType === PROJECT_TYPES.DATA
      ? this.fetchDataProjects(newPage)
      : this.fetchCodeProjects(newPage, projectType));

    return null;
  }

  setPage = (page = 0) => this.setState({ page });

  fetchCodeProjects(page, codeProjectType = PROJECT_TYPES.VISUALIZATION) {
    // The bug is in this function, I must distinguish between code and data projects
    const {
      actions: {
        setIsLoading,
        getProcessorsPaginated,
      },
      userInfo: { username },
    } = this.props;
    setIsLoading(true);
    const body = {
      namespace: username,
    };
    try {
      Promise.all([
        getProcessorsPaginated(
          codeProjectType,
          body,
          page,
          10,
        ),
      ])
        .finally(() => {
          setIsLoading(false);
          this.setState({ scrolling: false, projectType: codeProjectType });
        });
    } catch (error) {
      toastr.error('Error', error?.message);
    }
  }

  fetchDataProjects(page = 0) {
    const {
      actions: {
        setIsLoading,
        getPaginatedProjectsByQuery,
      },
      location: {
        hash,
      },
    } = this.props;
    setIsLoading(true);

    let projectUrl = '/own';
    if (hash === '#explore') {
      projectUrl = '';
    }

    if (hash === '#starred') {
      projectUrl = '/starred';
    }

    try {
      Promise.all([
        getPaginatedProjectsByQuery(`${projectUrl}?page=${page}&size=${10}`, page === 0),
      ])
        .finally(() => {
          setIsLoading(false);
          this.setState({ scrolling: false, projectType: PROJECT_TYPES.DATA });
        });
    } catch (error) {
      toastr.error('Error', error?.message);
    }
  }

  cleanPreviousParams = () => {
    const {
      actions,
      history,
    } = this.props;

    actions.setProjectsInfoSuccessfully([]);
    actions.setStarredProjectsSuccessfully([]);
    actions.setUserProjectsSuccessfully([]);
    history.push('/#personal');
    actions.setIsLoading(true);
  }

  render() {
    const {
      allProjects,
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
              this.cleanPreviousParams();
              this.setState(() => ({
                page: 0,
              }), this.fetchDataProjects);
            }}
          >
            <MScrollableSection handleOnScrollDown={this.handleOnScrollEvent}>
              <MProjectClassification
                classification={projectClassificationsProps[0].classification}
                history={history}
                allProjects={allProjects}
                isLoading={isLoading}
                setPage={this.setPage}
              />
            </MScrollableSection>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[1].classification}
            label="Models"
            color={projectClassificationsProps[1].color}
            callback={() => {
              this.cleanPreviousParams();
              try {
                this.setState(() => ({
                  page: 0,
                }), this.fetchCodeProjects(0, PROJECT_TYPES.ALGORITHM));
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MScrollableSection handleOnScrollDown={this.handleOnScrollEvent}>
              <MProjectClassification
                classification={projectClassificationsProps[1].classification}
                history={history}
                allProjects={allProjects}
                isLoading={isLoading}
                setPage={this.setPage}
              />
            </MScrollableSection>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[2].classification}
            label="Data Operations"
            color={projectClassificationsProps[2].color}
            callback={() => {
              try {
                this.cleanPreviousParams();
                this.setState(() => ({
                  page: 0,
                }), this.fetchCodeProjects(0, PROJECT_TYPES.OPERATION));
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MScrollableSection handleOnScrollDown={this.handleOnScrollEvent}>
              <MProjectClassification
                classification={projectClassificationsProps[2].classification}
                history={history}
                allProjects={allProjects}
                isLoading={isLoading}
                setPage={this.setPage}
              />
            </MScrollableSection>
          </MTabs.Section>
          <MTabs.Section
            id={projectClassificationsProps[3].classification}
            label="Data visualizations"
            color={projectClassificationsProps[3].color}
            callback={() => {
              try {
                this.cleanPreviousParams();
                this.setState(() => ({
                  page: 0,
                }), this.fetchCodeProjects(0));
              } catch (error) {
                toastr.error('Error', error);
              }
            }}
          >
            <MScrollableSection handleOnScrollDown={this.handleOnScrollEvent}>
              <MProjectClassification
                classification={projectClassificationsProps[3].classification}
                history={history}
                allProjects={allProjects}
                isLoading={isLoading}
                setPage={this.setPage}
              />
            </MScrollableSection>
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
    userInfo: state.user.userInfo,
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

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { arrayOf, shape, func } from 'prop-types';
import { Link } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import ProjectSet from '../projectSet';
import './myProjects.css';
import ProjectDeletionModal from '../project-deletion-modal/projectDeletionModal';
import * as projectActions from '../../actions/projectInfoActions';
// import AuthWrapper from 'components/AuthWrapper';

class Myprojects extends React.Component {
  constructor(props) {
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.state = {
      showModal: false,
      projectName: '',
      owner: '',
      isFetching: false,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    this.setState({ isFetching: true });

    // fetch 3 list of projects using a fetching flag
    Promise.all([
      actions.getUserProjects(),
      actions.getStarredProjects(),
      actions.getProjectsList(),
    ])
      .catch((err) => {
        // eslint-disable-next-line
        console.warn('Myprojects error (prov)', err);
      })
      .finally(() => {
        this.setState({ isFetching: false });
      });
  }

  handleShowModal(projectName, owner) {
    this.setState({
      showModal: true,
      projectName,
      owner,
    });
  }

  hideModal() {
    this.setState({
      showModal: false,
    });
  }

  // this change tabs in projectSet
  changeScreen = (screen) => {
    const {
      history: {
        push,
        location: {
          pathname,
        },
      }
    } = this.props;

    push(`${pathname}${screen}`);
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
      history: {
        location: {
          hash: screen,
        },
      }
    } = this.props;

    return (
      <div>
        <ProjectDeletionModal
          isShowing={showModal}
          projectName={projectName}
          owner={owner}
          hideModal={this.hideModal}
          projectsList={userProjects}
        />
        <Navbar />
        <div className="project-content">
          <NewProject />
          <hr />
          {isFetching
            ? (
              <div className="project-content-loader">
                <CircularProgress size={40} />
              </div>
            )
            : (
              <ProjectSet
                screen={screen || '#personal'}
                changeScreen={this.changeScreen}
                allProjects={allProjects}
                personalProjects={userProjects}
                starredProjects={starredProjects}
                handleShowModal={this.handleShowModal}
              />
            )}
        </div>
      </div>
    );
  }
}

const NewProject = () => (
  <div className="new-project">
    <p id="title">Projects</p>
      <Link
        to="/new-project"
        type="button"
        className="btn btn-primary"
      >
          New Project
      </Link>
  </div>
);

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

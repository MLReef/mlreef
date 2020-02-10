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

class Myprojects extends React.Component {
  constructor(props) {
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    const { actions } = this.props;
    actions.getProjectsList();
    this.state = {
      currentProjects: null,
      showModal: false,
      projectName: '',
      owner: '',
    };
  }

  static getDerivedStateFromProps(prevProps, nextState) {
    const { projects } = prevProps;
    const { currentProjects } = nextState;
    if (JSON.stringify(projects) !== JSON.stringify(currentProjects)) {
      return { currentProjects: projects };
    }

    return { currentProjects };
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

  render() {
    const { showModal } = this.state;
    const { projectName } = this.state;
    const { owner } = this.state;
    const { currentProjects } = this.state;

    if (!currentProjects) {
      return <CircularProgress size={20} />;
    }
    return (
      <div>
        <ProjectDeletionModal
          isShowing={showModal}
          projectName={projectName}
          owner={owner}
          hideModal={this.hideModal}
          projectsList={currentProjects}
        />
        <Navbar />
        <div className="project-content">
          <NewProject />
          <hr />
          <ProjectSet projects={currentProjects} handleShowModal={this.handleShowModal} />
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
      className="add"
    >
        New Project
    </Link>
  </div>
);

function mapStateToProps(state) {
  return {
    projects: state.projects.all,
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
  projects: arrayOf(
    shape({}).isRequired,
  ).isRequired,
  actions: shape({
    getProjectsList: func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Myprojects);

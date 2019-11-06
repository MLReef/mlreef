import React from 'react';
import { connect } from 'react-redux';
import { arrayOf } from 'prop-types';
import Navbar from '../navbar/navbar';
import ProjectSet from '../projectSet';
import './myProjects.css';
import ProjectDeletionModal from '../project-deletion-modal/projectDeletionModal';

class Myprojects extends React.Component {
  constructor(props) {
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.state = {
      showModal: false,
      projectName: '',
      owner: '',
    };
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
    const { projects } = this.props;
    return (
      <div>
        <ProjectDeletionModal
          isShowing={showModal}
          projectName={projectName}
          owner={owner}
          hideModal={this.hideModal}
          projectsList={projects}
        />
        <Navbar />
        <div className="project-content">
          <NewProject />
          <hr />
          <ProjectSet projects={projects} handleShowModal={this.handleShowModal} />
        </div>
      </div>
    );
  }
}

const NewProject = () => (
  <div className="new-project">
    <p id="title">Projects</p>
    <button
      type="button"
      className="add"
    >
        New Project
    </button>
  </div>
);

function mapStateToProps(state) {
  return {
    projects: state.projects.all,
  };
}

Myprojects.propTypes = {
  projects: arrayOf.isRequired,
};

export default connect(mapStateToProps)(Myprojects);

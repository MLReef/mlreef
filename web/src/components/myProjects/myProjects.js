import React from "react";
import { connect } from "react-redux";
import Navbar from "../navbar/navbar";
import ProjectSet from "../projectSet";
import "./myProjects.css";
import ProjectDeletionModal from "../project-deletion-modal/projectDeletionModal";

class Myprojects extends React.Component {
  constructor(props){
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    
    this.state = {
      showOverview: true,
      showProjects: false,
      showRepo: false,
      showModal: false,
      projectName: "",
      owner: ""
    }
  }

  handleOverview = () => {
    this.setState({ showOverview: true, showProjects: false, showRepo: false })
  }

  handleProjectList = () => {
    this.setState({ showOverview: false, showProjects: true, showRepo: false })
  }

  handleRepo = () => {
    this.setState({ showOverview: false, showProjects: false, showRepo: true })
  }

  handleShowModal= (projectName, owner) => 
    this.setState({ 
      showModal: true, 
      projectName: projectName,
      owner: owner
    });

  hideModal = () =>
    this.setState({ 
      showModal: false,
      isEnabledConfirmButton: false
    });

  render() {
    return (
      <div>
        <ProjectDeletionModal 
          isShowing={this.state.showModal} 
          projectName={this.state.projectName} 
          owner={this.state.owner} 
          hideModal={this.hideModal}
          projectsList={this.props.projects}
        />
        <Navbar />
        <div className="project-content">
          <NewProject />
          <hr />
          <ProjectSet projects={this.props.projects} handleShowModal={this.handleShowModal}/>
        </div>
      </div>
    )
  }
}

const NewProject = () => {
  return (
    <div className="new-project">
      <p id="title">Projects</p>
      <button className="add">
        New Project
      </button>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    projects: state.projects.all
  };
}

export default connect(mapStateToProps)(Myprojects);

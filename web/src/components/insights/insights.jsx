import React, { useState } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { shape } from 'prop-types';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './insights.scss';
import Jobs from './insights-menu/jobs';

const Insights = (props) => {
  const { selectedProject, selectedProject: { name } } = props;
  const groupName = selectedProject.namespace.name;

  const sections = {
    'jobs-btn': 0,
  };

  const [selectedSection, setSelectedSection] = useState(0);

  function menuBtnHandler(e) {
    $('div.insights-menu')[0]
      .childNodes.forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
    setSelectedSection(sections[e.target.id]);
  }

  function renderTheSelectedSection() {
    switch (selectedSection) {
      case 0:
        return <Jobs />;
      default:
        return <Jobs />;
    }
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="insights"
        folders={[groupName, name, 'Insights']}
      />
      <div className="main-content web-box">
        <div className="insights-menu">
          <button type="button" id="jobs-btn" onClick={menuBtnHandler} className="mbtn active">Jobs</button>
        </div>
        {renderTheSelectedSection()}
      </div>
    </>
  );
};

Insights.propTypes = {
  selectedProject: shape.isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
  };
}

export default connect(mapStateToProps)(Insights);

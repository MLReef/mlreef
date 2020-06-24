import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape,
  arrayOf,
  string,
} from 'prop-types';
import './experimentDetails.css';
import ExperimentsApi from 'apis/experimentApi';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import DetailsSummary from './menu-options/detailsSummary';
import Files from './menu-options/files';
import JobLog from './menu-options/jobLog';

const sections = {
  'details-btn': 0,
  'performance-btn': 1,
  'data-btn': 2,
  'algorithm-btn': 3,
  'training-btn': 4,
  'monitoring-btn': 5,
  'files-btn': 6,
};

const ExperimentDetails = (props) => {
  const [selectedSection, setSelectedSection] = useState(0);
  const [experiment, setExperiment] = useState({});
  const tabSwitch = useRef(null);
  const {
    selectedProject,
    jobs,
    selectedProject: { gitlabName: name },
    match: { params: { projectId } },
    location: {
      state: {
        uuid, currentState, userParameters, pipelineInfo, experimentId, allParameters,
      },
    },
  } = props;
  const groupName = selectedProject.namespace.name;
  const experimentName = experiment.name;
  const uniqueName = experimentName && experimentName.split('/')[1];
  let experimentJob;
  const firstInd = 0;
  if (experiment) {
    experimentJob = jobs.filter((job) => job.ref === experiment.name)[firstInd];
  }

  // Union of two arrays of parameters
  const mergedArray = [...userParameters, ...allParameters];
  const set = new Set();
  const mergedParameters = mergedArray.filter((item) => {
    if (!set.has(item.name)) {
      set.add(item.name);
      return true;
    }
    return false;
  }, set);

  useEffect(() => {
    ExperimentsApi.getExperimentDetails(uuid, experimentId)
      .then((res) => setExperiment(res))
      .catch(() => toastr.error('Error', 'Could not fetch the experiment'));
  }, [uuid, experimentId]);

  function menuBtnHandler(e) {
    tabSwitch.current.childNodes
      .forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
    setSelectedSection(sections[e.target.id]);
  }

  function renderTheSelectedSection() {
    switch (selectedSection) {
      case 0:
        return (
          <DetailsSummary
            projectId={projectId}
            experiment={experiment}
            currentState={currentState}
            experimentName={uniqueName}
            parameters={mergedParameters}
            pipelineInfo={pipelineInfo}
            experimentJob={experimentJob}
          />
        );
      case 4:
        return (
          <JobLog
            projectId={projectId}
            currentState={experimentJob && experimentJob.status}
            job={experimentJob}
          />
        );
      case 6:
        return (
          <Files projectId={projectId} job={experimentJob} />
        );
      default:
        return <DetailsSummary experiment={experiment} experimentName={uniqueName} />;
    }
  }

  return (
    <>
      <Navbar />
      <ProjectContainer
        project={selectedProject}
        activeFeature="experiments"
        folders={[groupName, name, 'Experiments', 'Details']}
      />
      <div className="main-content">
        <div style={{ display: 'flex', padding: '1em 2em' }}>
          <Link
            type="button"
            style={{
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              height: 'auto',
            }}
            to={`/my-projects/${projectId}/-/experiments`}
          >
            <p>
              Experiments
            </p>
          </Link>
          <p>
            &nbsp;
            <b>&gt;</b>
            &nbsp;
          </p>
          <p>
            {uniqueName}
          </p>
        </div>
        <div style={{ display: 'flex' }}>
          <div ref={tabSwitch} className="experiment-details-menu">
            <button type="button" id="details-btn" onClick={menuBtnHandler} className="menu-button active">Details</button>
            <button type="button" id="training-btn" onClick={menuBtnHandler} className="menu-button">Training</button>
            <button type="button" id="files-btn" onClick={menuBtnHandler} className="menu-button">Files</button>
          </div>
          {renderTheSelectedSection()}
        </div>
      </div>
    </>
  );
};

ExperimentDetails.propTypes = {
  selectedProject: shape({
    gitlabName: string.isRequired,
  }).isRequired,
  location: shape({
    state: shape({
      uuid: string.isRequired,
      currentState: string.isRequired,
      pipelineInfo: shape.isRequired,
      userParameters: arrayOf.isRequired,
    }).isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      projectId: string.isRequired,
      experimentId: string.isRequired,
    }).isRequired,
  }).isRequired,
  jobs: arrayOf(shape({})).isRequired,
};

function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    selectedProject: state.projects.selectedProject,
    algorithms: state.processors.algorithms,
  };
}

export default connect(mapStateToProps)(ExperimentDetails);

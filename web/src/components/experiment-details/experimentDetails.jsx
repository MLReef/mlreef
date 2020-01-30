import React, { useState } from 'react';
import {
  func,
  shape,
  arrayOf,
  string,
} from 'prop-types';
import './experimentDetails.css';
import $ from 'jquery';
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

const ExperimentDetails = ({
 projectId, setNullExperiment, experiment, job, parameters 
}) => {
  const [selectedSection, setSelectedSection] = useState(0);
  function menuBtnHandler(e) {
    $('div.experiment-details-menu')[0]
      .childNodes.forEach((btnNode) => {
        btnNode.classList.remove('active');
      });
    e.target.classList.add('active');
    setSelectedSection(sections[e.target.id]);
  }

  function renderTheSelectedSection() {
    switch (selectedSection) {
      case 0:
        return <DetailsSummary experiment={experiment} files={parameters} />;
      case 4:
        return <JobLog projectId={projectId} job={job} />;
      case 6:
        return <Files projectId={projectId} job={job} experimentName={experiment.descTitle} />;
      default:
        return <DetailsSummary experiment={experiment} files={parameters} />;
    }
  }

  return (
    <>
      <div style={{ display: 'flex', padding: '1em 2em' }}>
        <button
          type="button"
          style={{
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'transparent',
            height: 'auto',
          }}
          onClick={() => setNullExperiment(null)}
        >
          Experiments
        </button>
        <p>
          &nbsp;
          <b>&gt;</b>
          &nbsp;
        </p>
        <p>
          {experiment.descTitle}
        </p>
      </div>

      <div style={{ display: 'flex' }}>
        <div className="experiment-details-menu">
          <button id="details-btn" onClick={menuBtnHandler} className="menu-button active">Details</button>
          <button id="training-btn" onClick={menuBtnHandler} className="menu-button">Training</button>
          <button id="files-btn" onClick={menuBtnHandler} className="menu-button">Files</button>
        </div>
        {renderTheSelectedSection()}
      </div>
    </>
  );
};

ExperimentDetails.propTypes = {
  setNullExperiment: func.isRequired,
  experiment: shape({
    currentState: string,
    descTitle: string,
    userName: string,
    modelTitle: string,
    timeCreatedAgo: string,
  }).isRequired,
  parameters: arrayOf(
    shape({
      description: string.isRequired,
      param: string.isRequired,
      value: string.isRequired,
    }),
  ).isRequired,
};

export default ExperimentDetails;

import React, { useState } from 'react';
import {
  number, string, arrayOf, shape,
} from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { getPipelineIcon } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import './dataVisualizationCard.css';

const DataVisualizationCard = ({ classification, projectId }) => {
  const today = new Date();
  const [redirect, setRedirect] = useState(false);
  function goToPipelineView(e, val) {
    const configuredOperations = {
      dataOperatorsExecuted: val.dataOperations,
      inputFiles: val.inputFiles,
      pipelineBackendId: val.pipelineBackendId,
    };
    sessionStorage.setItem('configuredOperations', JSON.stringify(configuredOperations));
    setRedirect(true);
  }

  function getButtonsDiv(dataVisualizationState, val) {
    let buttons;
    const viewPipeLineBtn = (
      <button
        type="button"
        key="experiment-button"
        className="btn non-active-black-border"
        onClick={() => goToPipelineView(val)}
      >
        View Pipeline
      </button>
    );
    if (dataVisualizationState.toLowerCase() === 'in progress') {
      buttons = [
        viewPipeLineBtn,
        <button
          type="button"
          key="abort-button"
          className="btn btn-danger border-solid my-auto"
          style={{ width: 'max-content' }}
        >
          <b> Abort </b>
        </button>,
      ];
    } else if (
      dataVisualizationState.toLowerCase() === 'active'
    ) {
      buttons = [
        viewPipeLineBtn,
        <button
          type="button"
          key="delete-button"
          className="dangerous-red"
          style={{ borderRadius: '0.2em' }}
        >
          <b>
            X
          </b>
        </button>,
      ];
    } else {
      buttons = [
        viewPipeLineBtn,
      ];
    }
    return (
      <div id="pipeline-buttons-div">{buttons}</div>
    );
  }

  if (redirect) {
    return <Redirect to={`/my-projects/${projectId}/pipeline-execution/new-data-visualization`} />;
  }
  return (
    <div className="pipeline-card" key={today}>
      <div className="header">
        <div className="title-div">
          <p><b>{classification.status}</b></p>
        </div>
      </div>
      {classification.values.map((val) => (
        <div className="data-visualization-card-content" key={`${val.creator} ${val.name}`} data-key={val.name}>
          <img src={getPipelineIcon(val.status.toUpperCase())} width="30" height="30" alt={val.status} />
          <div className="general-information ml-2">
            <Link to={`/my-projects/${projectId}/visualizations/${encodeURIComponent(val.name)}`}>
              <b>{val.name}</b>
            </Link>
            <p className="m-0 mt-1">
              Created by
              &nbsp;
              <b>{val.authorName}</b>
              &nbsp;
              {getTimeCreatedAgo(val.createdAt, new Date())}
              &nbsp;
              ago
            </p>
          </div>
          <div className="detailed-information-1">
            {classification.status.toLowerCase() === 'active' && (
            <>
              <p>
                <b>
                  Use:
                  {val.spaceUsed}
                </b>
              </p>
              <p>
                Expires in:
                {val.expiresIn}
              </p>
            </>
            )}
          </div>
          {getButtonsDiv(classification.status, val)}
        </div>
      ))}
    </div>
  );
};

DataVisualizationCard.propTypes = {
  classification: shape({
    status: string.isRequired,
    values: arrayOf(shape({
      creator: string,
      name: string.isRequired,
      authorName: string.isRequired,
      createdAt: string.isRequired,
      completedPercentage: string,
      spaceUsed: string,
      expiresIn: string,
      filesChanged: string,
    })).isRequired,
  }).isRequired,
  projectId: number.isRequired,
};

export default DataVisualizationCard;

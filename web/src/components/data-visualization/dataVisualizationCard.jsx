import React, { useState } from 'react';
import {
  number, string, arrayOf, shape,
} from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import AuthWrapper from 'components/AuthWrapper';
import { getPipelineIcon } from 'functions/pipeLinesHelpers';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import './dataVisualizationCard.css';

const DataVisualizationCard = ({ classification, projectId, namespace, slug }) => {
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
        <button
          type="button"
          key="delete-button"
          label="close"
          className="btn btn-icon btn-danger fa fa-times"
          style={{ borderRadius: '0.2em' }}
        />,
      ];
    } else {
      buttons = [];
    }
    return (
      <div id="pipeline-buttons-div">
        {viewPipeLineBtn}
        <AuthWrapper minRole={30} norender>
          {buttons}
        </AuthWrapper>
      </div>
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
      {classification.values.map((val) => {
        const pipeBackendId = val?.backendPipeline?.id;
        return (
          <div className="data-visualization-card-content" key={`${val.creator} ${val.name}`} data-key={val.name}>
            <img src={getPipelineIcon(val.status.toUpperCase())} width="30" height="30" alt={val.status} />
            <div className="general-information ml-2">
              <Link to={`/${namespace}/${slug}/-/visualizations/${pipeBackendId}`}>
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
        );
      })}
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
  namespace: string.isRequired,
  slug: string.isRequired,
};

export default DataVisualizationCard;

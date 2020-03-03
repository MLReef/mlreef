import React, { useState } from 'react';
import {
  func, number, string, arrayOf, shape,
} from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { Base64 } from 'js-base64';
import { toastr } from 'react-redux-toastr';
import { getTimeCreatedAgo, mlreefLinesToExtractConfiguration } from '../../functions/dataParserHelpers';
import './dataVisualizationCard.css';
import filesApi from '../../apis/FilesApi';

const DataVisualizationCard = ({ classification, projectId }) => {
  const today = new Date();
  const [redirect, setRedirect] = useState(false);
  function goToPipelineView(e) {
    const branch = e.currentTarget.parentNode.parentNode.getAttribute('data-key');
    filesApi
      .getFileData(
        projectId,
        '.mlreef.yml',
        branch,
      )
      .then((fileData) => {
        const dataParsedInLines = Base64.decode(fileData.content).split('\n');
        const configuredOperation = mlreefLinesToExtractConfiguration(dataParsedInLines);
        sessionStorage.setItem('configuredOperations', JSON.stringify(configuredOperation));

        setRedirect(true);
      })
      .catch(() => {
        toastr.error('Error:', 'An error occurred while parsing your configuration');
      });
  }

  function getButtonsDiv(dataVisualizationState) {
    let buttons;
    const viewPipeLineBtn = (
      <button
        type="button"
        key="experiment-button"
        className="non-active-black-border rounded-pipeline-btn"
        onClick={goToPipelineView}
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
          className="dangerous-red"
          style={{ width: 'max-content', borderRadius: '0.2em' }}
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
      <div id="buttons-div">{buttons}</div>
    );
  }

  if (redirect) {
    return <Redirect to={`/my-projects/${projectId}/empty-data-visualization`} />;
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
          <div className="general-information">
        
            <Link to={`/my-projects/${projectId}/visualizations/${encodeURIComponent(val.name)}`}>
              <b>{val.name}</b>
            </Link>
            <p>
              Create by
              &nbsp;
              <b>{val.authorName}</b>
              &nbsp;
              {getTimeCreatedAgo(val.createdAt, new Date())}
              &nbsp;
              ago
            </p>
          </div>
          <div className="detailed-information-1">
            {classification.status.toLowerCase() === 'in progress' && (
            <p>
              <b>
                {val.completedPercentage}
                % completed
              </b>
            </p>
            )}
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
          <div className="detailed-information-2">
            <p>
              <b>
                {val.filesChanged}
                {' '}
                files
              </b>
            </p>
            <p>dl_code</p>
          </div>
          {getButtonsDiv(classification.status)}
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
  setVisualizationSelected: func.isRequired,
  projectId: number.isRequired,
};

export default DataVisualizationCard;

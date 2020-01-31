import React from 'react';
import { Base64 } from 'js-base64';
import './dataVisualizationCard.css';
import {
  RUNNING,
  SUCCESS,
  CANCELED,
  FAILED,
  PENDING,
} from '../../dataTypes';
/* import { mlreefLinesToExtractConfiguration } from '../../functions/dataParserHelpers';
import filesApi from '../../apis/FilesApi'; */

const DataVisualizationCard = ({ classification }) => {
  const today = new Date();
  /* 
  function goToPipelineView(e) {
    const pId = props.params.instances[0].projId;
    const branch = e.currentTarget.parentNode.parentNode.getAttribute('data-key');
    filesApi
      .getFileData(
        pId,
        '.mlreef.yml',
        branch,
      )
      .then((fileData) => {
        const dataParsedInLines = Base64.decode(fileData.content).split('\n');
        const configuredOperation = mlreefLinesToExtractConfiguration(dataParsedInLines);
        sessionStorage.setItem('configuredOperations', JSON.stringify(configuredOperation));
        //props.history.push(`/my-projects/${pId}/pipe-line`);
      })
      .catch(() => {

      });
  } */

  function getButtonsDiv(experimentState) {
    let buttons;
    const viewPipeLineBtn = (
      <button
        type="button"
        key="experiment-button"
        className="non-active-black-border rounded-pipeline-btn"
        /* onClick={goToPipelineView} */
      >
        View Pipeline
      </button>
    );
    if (experimentState === RUNNING || experimentState === PENDING) {
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
      experimentState === SUCCESS
        || experimentState === FAILED
        || experimentState === CANCELED
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

  function getTitle(status) {
    switch (status) {
      case RUNNING:
        return 'In progress';
      case SUCCESS:
        return 'Active';
      case FAILED:
        return 'Active';
      default:
        return 'Expired';
    }
  }

  return (
    <div className="pipeline-card" key={today}>
      <div className="header">
        <div className="title-div">
          <p><b>{getTitle(classification.status)}</b></p>
        </div>
      </div>
      {classification.values.map((val) => (
        <div className="data-visualization-card-content" key={`${val.creator} ${val.name}`}>
          <div className="general-information">
            <p>
              <b>{val.name}</b>
            </p>
            <p>
            Create by&nbsp;
              <b>{val.creator}</b>
            &nbsp;
            10 minutes ago
            </p>
          </div>
          <div className="detailed-information-1">
            {classification.status === RUNNING && (
            <p>
              <b>
                {val.completedPercentage}
% completed
              </b>
            </p>
            )}
            {classification.status === SUCCESS || classification.status === FAILED
              ? (
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
              )
              : null}
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

export default DataVisualizationCard;

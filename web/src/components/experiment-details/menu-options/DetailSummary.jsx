import React, { useState, useEffect } from 'react';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import PipeLinesApi from 'apis/PipelinesApi';
import { shape, string, arrayOf, number, func } from 'prop-types';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { SUCCESS, RUNNING, PENDING } from 'dataTypes';

const DetailsSummary = ({
  projectNamespace,
  projectSlug,
  projectId,
  experimentName,
  parameters,
  pipelineInfo,
  dataOperatorsExecuted,
  inputFiles,
  setPreconfiguredOPerations,
  history,
}) => {
  const [pipelineDetails, setDetails] = useState({});
  const {
    id, duration, startedAt: startedAtRaw, finishedAt: finishedAtRaw, status: currentState,
  } = pipelineDetails;
  const lowerCaseCurrCase = currentState;
  const first = 0;
  let startedAt = '---';
  let finishedAt = '---';
  if (startedAtRaw) {
    startedAt = startedAtRaw.split('.')[first];
  }
  if (finishedAtRaw) {
    finishedAt = finishedAtRaw.split('.')[first];
  }

  let experimentStatus = (
    <b className={`m-auto ${lowerCaseCurrCase === SUCCESS ? 't-primary' : 't-danger'}`}>
      {currentState?.toUpperCase()}
    </b>
  );

  if (lowerCaseCurrCase === RUNNING.toLowerCase()) {
    experimentStatus = (
      <b className="m-auto t-primary">
        {RUNNING}
      </b>
    );
  } else if (lowerCaseCurrCase === PENDING.toLowerCase()) {
    experimentStatus = (
      <b className="m-auto" style={{ color: '#E99444' }}>
        {PENDING}
      </b>
    );
  }

  useEffect(() => {
    PipeLinesApi.getPipesById(projectId, pipelineInfo.id)
      .then((res) => setDetails(res ? parseToCamelCase(res) : {}))
      .catch(() => toastr.error('Error', 'Could not fetch the pipeline information'));
  }, [projectId, pipelineInfo.id]);
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height: '5em',
        display: 'flex',
      }}
      >
        <p className="experiment-details-subtitle mt-2">Metadata</p>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        <div
          id="experiment-data-content"
          style={{
            width: '100%',
            padding: '0px 1em',
            borderBottom: '1px solid rgb(236, 236, 236)',
            borderTop: '1px solid rgb(236, 236, 236)',
          }}
        >
          <div className="content-subdiv">
            <div className="composed-row">
              <div className="d-flex" style={{ alignItems: 'center' }}>
                <p style={{ width: '10em', margin: '5px' }}>Experiment name: </p>
                <p><b>{experimentName}</b></p>
              </div>
              <div className="d-flex" style={{ alignItems: 'center' }}>
                <button
                  id="view-pipeline-btn"
                  type="button"
                  className="btn btn-outline-dark btn-label-sm"
                  onClick={() => {
                    const configuredOperations = {
                      dataOperatorsExecuted: [dataOperatorsExecuted],
                      inputFiles,
                      pipelineBackendId: pipelineInfo.id,
                    };
                    setPreconfiguredOPerations(configuredOperations);
                    history.push(`/${projectNamespace}/${projectSlug}/-/experiments/new`);
                  }}
                >
                  View pipeline
                </button>
              </div>

            </div>
            <div className="composed-row">
              <div className="d-flex">
                <p className="ml-1 mr-1" style={{ width: '10rem' }}>Status: </p>
                <p className="d-flex m-0">
                  {experimentStatus}
                </p>
              </div>
              <p>
                ID:
                {' '}
                <button
                  type="button"
                  style={{
                    border: '1px solid gray',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    padding: '0rem 2.5rem',
                  }}
                >
                  {id || '---'}
                </button>
              </p>
            </div>
          </div>
          <br />
          <div className="content-subdiv">
            <div
              style={{ display: 'flex' }}
            >
              <p style={{ width: '10em' }}>Created:</p>
              <p style={{ marginLeft: 0 }}><b>{startedAt}</b></p>
            </div>
            <div className="composed-row">
              <div style={{ display: 'flex' }}>
                <p style={{ width: '10em', marginLeft: '5px' }}>Completed:</p>
                <p style={{ marginLeft: '5px' }}><b>{finishedAt}</b></p>
              </div>
              <p>
                Training time:
                <b>
                  {duration
                    ? moment({}).startOf('day').seconds(duration).format('HH:mm:ss')
                    : '---'}
                </b>
              </p>
            </div>
            <div style={{ display: 'flex' }}>
              <p style={{ width: '10em' }}>Owner: </p>
              <p style={{ marginLeft: 0 }}><b>mlreef</b></p>
            </div>
          </div>
          <br />
          {/* <p className="experiment-details-subtitle" style={{ paddingLeft: '5px' }}>Source summary</p>
          <div className="composed-row">
            <div style={{ display: 'flex' }}>
              <p style={{ marginRight: 5, width: '10em' }}>Data source:</p>
              <p><b>Data_Repository / Data Instance</b></p>
            </div>
          </div> */}
          <p className="experiment-details-subtitle" style={{ paddingLeft: '5px' }}>All parameters</p>
        </div>
      </div>
      <div style={{ margin: '1em' }}>
        <table
          style={{
            width: '100%',
            textAlign: 'left',
            borderRadius: '10px',
            border: '1px solid #e5e5e5',
            padding: '1px',
            borderCollapse: 'collapse',
          }}
        >
          <thead style={{ backgroundColor: '#1d2b40', color: '#fff' }}>
            <tr>
              <th style={{ paddingLeft: '10px' }}>
                <p>#</p>
              </th>
              <th>
                <p>Parameter</p>
              </th>
              <th>
                <p>Values</p>
              </th>
              <th>
                <p>Type</p>
              </th>
            </tr>
          </thead>
          <tbody className="files-tbody">
            {parameters.map((param, index) => (
              <tr style={{ borderBottom: '1px solid #1d2b40' }} key={`${param.name}-${index.toString()}`}>
                <td style={{ paddingLeft: '10px' }}>
                  {(index + 1)}
                </td>
                <td>
                  {param.name}
                </td>
                <td>
                  <p>{param.value ? param.value : param.default_value}</p>
                </td>
                <td>
                  <p>{param.type}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DetailsSummary.defaultProps = {
  experimentName: '',
  currentState: '---',
};

DetailsSummary.propTypes = {
  projectId: number.isRequired,
  projectNamespace: string.isRequired,
  projectSlug: string.isRequired,
  experimentName: string,
  currentState: string,
  history: shape({}).isRequired,
  parameters: arrayOf(
    shape({
      name: string.isRequired,
      type: string.isRequired,
      value: string,
    }).isRequired,
  ).isRequired,
  pipelineInfo: shape({}).isRequired,
  dataOperatorsExecuted: shape({}).isRequired,
  inputFiles: arrayOf(shape({})).isRequired,
  setPreconfiguredOPerations: func.isRequired,
};

export default DetailsSummary;

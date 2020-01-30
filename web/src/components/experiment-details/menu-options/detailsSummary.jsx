import React from 'react';
import { shape, string, arrayOf } from 'prop-types';

const DetailsSummary = ({ experiment, files }) => (
  <div style={{ width: '100%' }}>
    <div style={{
      borderLeft: '1px solid rgb(236, 236, 236)',
      height: '5em',
      display: 'flex',
    }}
    >
      <p className="experiment-details-subtitle">Metadata</p>
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ width: '10em', margin: '5px' }}>Experiment name: </p>
              <p><b>{experiment.modelTitle}</b></p>
            </div>
            <p>
              ID:
              <button
                type="button"
                style={{
                  border: '1px solid gray',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                }}
              >
                {experiment.descTitle}
              </button>
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <p style={{ width: '10em' }}>Status: </p>
            <p style={{ margin: 0 }}>
              <b
                style={{
                  color: experiment.currentState === 'success'
                    ? '#38b797'
                    : 'red',
                }}
              >
                {experiment.currentState}
              </b>
            </p>
          </div>
        </div>
        <br />
        <div className="content-subdiv">
          <div
            style={{ display: 'flex' }}
          >
            <p style={{ width: '10em' }}>Created:</p>
            <p style={{ marginLeft: 0 }}><b>{experiment.timeCreatedAgo}</b></p>
          </div>
          <div className="composed-row">
            <div style={{ display: 'flex' }}>
              <p style={{ width: '10em', marginLeft: '5px' }}>Completed:</p>
              <p style={{ marginLeft: '5px' }}><b>01.01.2019 - 17:00</b></p>
            </div>
            <p>
              Training time:
              <b>2h, 12 minutes, 3 seconds</b>
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <p style={{ width: '10em' }}>Owner: </p>
            <p style={{ marginLeft: 0 }}><b>{experiment.userName}</b></p>
          </div>
        </div>
        <br />
        <p className="experiment-details-subtitle" style={{ paddingLeft: '5px' }}>Source summary</p>
        <div className="composed-row">
          <div style={{ display: 'flex' }}>
            <p style={{ marginRight: 5, width: '10em' }}>Data source:</p>
            <p><b>Data_Repository / Data Instance</b></p>
          </div>
        </div>
        <p className="experiment-details-subtitle" style={{ paddingLeft: '5px' }}>Model parameters</p>
      </div>
    </div>
    <div style={{ margin: '1em' }}>
      <table
        style={{
          width: '100%',
          borderRadius: '5px',
          border: '1px solid gray',
          padding: '1px',
        }}
      >
        <thead style={{ backgroundColor: '#1d2b40', color: '#fff' }}>
          <tr>
            <th>
              <p>#</p>
            </th>
            <th>
              <p>Parameter</p>
            </th>
            <th>
              <p>Values</p>
            </th>
            <th>
              <p>Description</p>
            </th>
          </tr>
        </thead>
        <tbody className="files-tbody">
          {files.map((file, index) => (
            <tr key={file.param}>
              <td>
                {(index + 1)}
              </td>
              <td>
                {file.param}
              </td>
              <td>
                <p>{file.value}</p>
              </td>
              <td>
                <p>{file.lastUpdate}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

DetailsSummary.propTypes = {
  experiment: shape({
    modelTitle: string.isRequired,
    descTitle: string.isRequired,
    currentState: string.isRequired,
    timeCreatedAgo: string.isRequired,
    userName: string.isRequired,
  }).isRequired,
  files: arrayOf(
    shape({
      description: string.isRequired,
      param: string.isRequired,
      value: string.isRequired,
    }).isRequired,
  ).isRequired,
};

export default DetailsSummary;

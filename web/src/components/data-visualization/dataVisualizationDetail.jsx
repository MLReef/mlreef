import React, { useState } from 'react';
import { shape, string } from 'prop-types';
import './dataVisualizationDetail.css';
import { getTimeCreatedAgo } from '../../functions/dataParserHelpers';

const DataVisualizationDetails = ({
  visualizationSelected,
}) => {
  const [fileSelected, setFileSelected] = useState(null);
  return (
    <>
      <br />
      <br />
      <div className="viewing-visualization">
        <div className="title-bar">
          <p><b>Viewing</b></p>
        </div>
        <div className="content-data">
          <div>
            <p><b>{visualizationSelected.name}</b></p>
            <p>
            Create by
            &nbsp;
              <b>{visualizationSelected.authorName}</b>
            &nbsp;
              {getTimeCreatedAgo(visualizationSelected.createdAt, new Date())}
            &nbsp;
            ago
            </p>
          </div>
          <div>
            <p><b>24.051 files used</b></p>
            <p>di_code</p>
          </div>
          <div id="buttons-div">
            <br />
            <button type="button" className="dangerous-red">
              <b>X</b>
            </button>
          </div>
        </div>
      </div>
      <br />
      {fileSelected
        ? (
          <div className="viewing-visualization">
            <div className="title-bar">
              <p>
                File selected 1
              </p>
            </div>
            <div className="content-data">
              <div style={{ height: '20em', width: '20em', marginLeft: '35%', backgroundColor: 'gray' }} />
            </div>
          </div>
        ) : (
          <table className="file-properties" id="file-tree">
            <thead>
              <tr className="title-row">
                <th><p>Name</p></th>
                <th><p>Last commit</p></th>
                <th><p>Size (Files)</p></th>
                <th><p>Last Update</p></th>
              </tr>
            </thead>
            <tbody>
              <tr className="files-row blue-on-hover" style={{ padding: 0, cursor: 'pointer' }} onClick={() => { setFileSelected({}); }}>
                <td className="file-type" id="file1"><p style={{ width: '100%', textAlign: 'center' }}>File 1</p></td>
                <td className="file-type" id="file1"><p style={{ width: '100%', textAlign: 'center' }}>Last commit</p></td>
                <td className="file-type" id="file1"><p style={{ width: '100%', textAlign: 'center' }}>10 Mb</p></td>
                <td className="file-type" id="file1"><p style={{ width: '100%', textAlign: 'center' }}>Today</p></td>
              </tr>
            </tbody>
          </table>
        )}
    </>
  );
};

DataVisualizationDetails.propTypes = {
  visualizationSelected: shape({
    name: string.isRequired,
  }).isRequired,
};

export default DataVisualizationDetails;

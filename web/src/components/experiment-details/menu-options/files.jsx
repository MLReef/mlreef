import React from 'react';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import {
  Button,
} from '@material-ui/core';
// import JobsApi from '../../../apis/JobsApi';

const Files = ({ job }) => {
  function downloadArtifacts() {
    /*
    The next block of code will be enabled when CORS error can be solved

    const encoded = encodeURIComponent(experimentName);// .replace(/\//g, '%2F');
    console.log(projectId);
    console.log(encoded);
    console.log(job);
    JobsApi
      .getArtifacts(projectId, job.id)
      .then((res) => console.log(res))
      .catch((err) => console.error(err)); */
  }
  return (
    <div style={{ marginLeft: '1em', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1em',
        borderBottom: '1px solid #ececec',
      }}
      >
        <div>
          <p style={{ color: '#1d2b40', fontSize: '1.2em', fontWeight: '700' }}>Files</p>
        </div>
        <div>
          <Button onClick={downloadArtifacts} variant="outlined">Download</Button>
          <button type="button" style={{ marginLeft: '1em' }} className="dangerous-red">X</button>
        </div>
      </div>
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
              <p>Type</p>
            </th>
            <th>
              <p>Size</p>
            </th>
          </tr>
        </thead>
        <tbody className="files-tbody">
          {job.artifacts.map((artifact, index) => (
            <tr key={artifact.toString()}>
              <td>
                <p>{(index + 1)}</p>
              </td>
              <td>
                <p>{artifact.filename}</p>
              </td>
              <td>
                <p>{artifact.file_type}</p>
              </td>
              <td>
                <p>{artifact.size}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Files.propTypes = {
  job: shape({
    name: string.isRequired,
    artifacts: arrayOf(
      shape({
        filename: string.isRequired,
        file_type: string.isRequired,
        size: number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default Files;

import React from 'react';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import {
  Button,
} from '@material-ui/core';
import FileSaver from 'file-saver';
import { toastr } from 'react-redux-toastr';
import FilesTable from '../../files-table/filesTable';
import JobsApi from '../../../apis/JobsApi';

const Files = ({ projectId, job }) => {
  function downloadArtifacts() {
    const encodedBranchName = encodeURIComponent(job.ref);
    JobsApi
      .downloadArtifacts(projectId, encodedBranchName, job.name)
      .then(
        (res) => res.ok
          ? res.blob().then((data) => FileSaver.saveAs(data, 'artifacts.zip'))
          : Promise.reject(res),
      ).catch(
        () => toastr.error('Error', 'Your artifacts could not be downloaded'),
      );
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
      <FilesTable
        files={job.artifacts.map((art) => ({
          id: art.id,
          name: art.filename,
          file_type: art.file_type,
          size: art.size,
        }))}
        headers={['Parameter', 'Type', 'Size']}
        onCLick={() => {}}
      />
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

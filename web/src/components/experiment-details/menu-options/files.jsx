import React from 'react';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import FileSaver from 'file-saver';
import { toastr } from 'react-redux-toastr';
import iconGrey from 'images/icon_grey-01.png';
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
      {(job.status === 'failed' || job.status === 'success') ? (
        <>
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
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={downloadArtifacts}
              >
                Download
              </button>
              <button
                type="button"
                label="close"
                className="btn btn-icon btn-danger fa fa-times my-auto ml-3"
              />
            </div>
          </div>
          <FilesTable
            isReturnOptVisible={false}
            files={job.artifacts.map((art) => ({
              id: art.id,
              name: art.filename,
              file_type: art.file_type,
              size: art.size,
            }))}
            headers={['Parameter', 'Type', 'Size']}
            onCLick={() => {}}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center' }} className="d-flex noelement-found-div">
          <img src={iconGrey} alt="" style={{ maxHeight: '100px' }} />
          <p style={{ color: '#b1b1b1' }}>No output files available yet. Try again later</p>
        </div>
      )}
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

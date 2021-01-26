import React, { useState } from 'react';
import {
  number, shape, string, arrayOf,
} from 'prop-types';
import { FAILED, SUCCESS } from 'dataTypes';
import FileSaver from 'file-saver';
import { toastr } from 'react-redux-toastr';
import iconGrey from 'images/icon_grey-01.png';
import FilesTable from '../../files-table/filesTable';
import JobsApi from '../../../apis/JobsApi.ts';
import { INFORMATION_UNITS } from 'domain/informationUnits';

/**
 * @param {*} numberOfUnits: number of bytes to transform
 * @returns equivalent number but in gigabytes or megabytes
 */
const parseUnitsInformation = (
  numberOfUnits,
  outputUnitType,
  incomeUnitType = INFORMATION_UNITS.BIT,
) => (!numberOfUnits || !outputUnitType)
  ? 0
  : Number(((numberOfUnits * incomeUnitType) / outputUnitType).toFixed(1));

const jobsApi = new JobsApi();

const Files = ({ projectId, job }) => {
  const [isDownloadingArtifacts, setIsDownloadingArtifacts] = useState(false);
  function downloadArtifacts() {
    setIsDownloadingArtifacts(true);
    toastr.info('Info', 'The artifacts download has started');
    const encodedBranchName = encodeURIComponent(job.ref);
    jobsApi
      .downloadArtifacts(projectId, encodedBranchName, job.name)
      .then(
        (res) => res.ok
          ? res
            .blob()
            .then((data) => FileSaver.saveAs(data, `${job.ref}-artifacts.zip`))
          : Promise.reject(res),
      ).catch(() => toastr.error('Error', 'Job artifacts were not found or cannot be parsed'))
      .finally(() => setIsDownloadingArtifacts(false));
  }
  return (
    <div style={{ marginLeft: '1em', width: '100%' }}>
      {(job.status === FAILED || job.status === SUCCESS) ? (
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
                disabled={isDownloadingArtifacts}
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
              fileType: art.file_type,
              size: `${parseUnitsInformation(
                art.size,
                INFORMATION_UNITS.MEGABYTE,
                INFORMATION_UNITS.BYTE,
              )}`,
            }))}
            headers={['Parameter', 'Type', 'Size(MB)']}
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
  projectId: number.isRequired,
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

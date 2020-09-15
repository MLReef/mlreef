import React from 'react';
import { string, number, func } from 'prop-types';
import MProgressBar from 'components/ui/MProgressBar';

const file01 = '/images/svg/file_01.svg';

const FileToSend = ({
  fileId, fileName, progress, onRemove,
}) => (
  <>
    {progress < 100 ? <MProgressBar color="info" /> : null}
    <div className="file-uploaded d-flex">
      <img className="dropdown-white" src={file01} alt="File" />
      <p>
        Uploaded
        {' '}
        {fileName}
        {' '}
      </p>
      <button
        className="remove-file-button"
        onClick={() => onRemove(fileId)}
        type="button"
      >
        <b>X</b>
      </button>
    </div>
  </>
);

FileToSend.propTypes = {
  fileId: string.isRequired,
  fileName: string.isRequired,
  progress: number.isRequired,
  onRemove: func.isRequired,
};

export default FileToSend;

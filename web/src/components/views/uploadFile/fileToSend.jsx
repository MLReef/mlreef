import React from 'react';
import { string, number, func } from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import file01 from 'images/file_01.svg';

const FileToSend = ({
  fileId, fileName, progress, onRemove,
}) => (
  <>
    <LinearProgress variant="determinate" value={progress} />
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

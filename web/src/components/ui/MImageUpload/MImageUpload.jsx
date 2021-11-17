import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './MImageUpload.scss';

const MImageUpload = (props) => {
  const {
    className,
    setImage,
    maxSize,
    onError,
  } = props;

  const [file, setFile] = useState({});

  const handleChange = (e) => {
    const [recentFile] = e.target.files;

    if (recentFile) {
      if (recentFile && (recentFile.size / 1024) < maxSize) {
        return setFile(recentFile);
      }
      if (onError) onError(new Error(`File size exceeds ${maxSize}Kb`));
    }
  };

  const removeFile = () => {
    setFile({});
  };

  useEffect(() => {
    if (file.name) setImage(file);
  }, [file, setImage]);

  return (
    <div className={cx('m-image-upload mt-2', className)}>
      <button type="button" className="m-image-upload-btn btn btn-outline-dark btn-sm">
        Choose a file
        <input onChange={handleChange} className="m-image-upload-input" type="file" />
      </button>
      <span className="m-image-upload-label ml-3">{file.name || 'No file chosen.'}</span>
      <div className="t-secondary mt-2">The maximum allowed is {maxSize}Kb.</div>
      {file.name && (
        <button onClick={removeFile} type="button" className="btn btn-sm btn-outline-danger mt-3">
          Remove avatar
        </button>
      )}
    </div>
  );
};

MImageUpload.defaultProps = {
  className: '',
  maxSize: 5 * 1024,
  onError: null,
};

MImageUpload.propTypes = {
  className: PropTypes.string,
  setImage: PropTypes.func.isRequired,
  onError: PropTypes.func,
  maxSize: PropTypes.number,
};

export default MImageUpload;
